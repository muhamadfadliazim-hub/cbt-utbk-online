import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminTenantContext } from "@/lib/tenant";
import { enrichSantriWithAttempts } from "@/lib/baznasSync";

function serializeSantri(row: any) {
  let tryoutScores = [];
  try {
    tryoutScores = JSON.parse(row.tryoutScores || "[]");
  } catch {
    tryoutScores = [];
  }
  return {
    ...row,
    tryoutScores,
  };
}

function resolveTargetPesantrenId(
  ctx: NonNullable<Awaited<ReturnType<typeof getAdminTenantContext>>>,
  requestedId?: string | null
) {
  // Pesantren Admin is strictly locked to their own pesantren
  if (!ctx.isSuperAdmin) {
    return ctx.managedPesantrenId!;
  }
  if (requestedId && ctx.pesantrenList.some((p) => p.id === requestedId)) {
    return requestedId;
  }
  if (ctx.activePesantrenId) {
    return ctx.activePesantrenId;
  }
  return ctx.pesantrenList[0]?.id || "pesantren-1";
}

export async function GET(req: Request) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetId = resolveTargetPesantrenId(ctx, searchParams.get("pesantrenId"));

    const [profile, santriRows, logbookRows] = await Promise.all([
      prisma.pesantren.findUnique({ where: { id: targetId } }),
      prisma.baznasSantri.findMany({
        where: { pesantrenId: targetId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.baznasLogbook.findMany({
        where: { pesantrenId: targetId },
        orderBy: { tanggal: "desc" },
      }),
    ]);

    let overviewStats: any[] = [];
    if (ctx.isSuperAdmin) {
      const counts = await prisma.baznasSantri.groupBy({
        by: ["pesantrenId"],
        _count: { _all: true },
      });
      const logCounts = await prisma.baznasLogbook.groupBy({
        by: ["pesantrenId"],
        _count: { _all: true },
      });
      overviewStats = ctx.pesantrenList.map((p) => {
        const sCount = counts.find((c) => c.pesantrenId === p.id)?._count._all || 0;
        const lCount = logCounts.find((c) => c.pesantrenId === p.id)?._count._all || 0;
        return {
          id: p.id,
          namaPesantren: p.namaPesantren,
          nsp: p.nsp,
          adminEmail: p.adminEmail,
          santriCount: sCount,
          logbookCount: lCount,
          totalAnggaran: sCount * p.anggaranPerSantri,
        };
      });
    }

    const { santriList: enrichedSantriList, tryoutSummary } = await enrichSantriWithAttempts(
      santriRows,
      targetId
    );

    return NextResponse.json({
      isSuperAdmin: ctx.isSuperAdmin,
      activePesantrenId: targetId,
      pesantrenList: ctx.isSuperAdmin
        ? ctx.pesantrenList
        : ctx.pesantrenList.filter((p) => p.id === ctx.managedPesantrenId),
      profile,
      santriList: enrichedSantriList,
      tryoutSummary,
      logbookList: logbookRows,
      overviewStats,
    });
  } catch (error) {
    console.error("BAZNAS GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data pesantren" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, pesantrenId: reqPesantrenId, payload } = body;
    const targetId = resolveTargetPesantrenId(ctx, reqPesantrenId);

    switch (action) {
      case "create_pesantren": {
        if (!ctx.isSuperAdmin) {
          return NextResponse.json({ error: "Hanya Super Admin yang dapat menambah pesantren" }, { status: 403 });
        }
        const nextNum = ctx.pesantrenList.length + 1;
        const newId = `pesantren-${Date.now().toString().slice(-4)}`;
        const created = await prisma.pesantren.create({
          data: {
            id: newId,
            slug: `pesantren-${nextNum}-${Date.now().toString().slice(-3)}`,
            namaPesantren: payload.namaPesantren,
            nsp: payload.nsp || "-",
            pimpinan: payload.pimpinan || "-",
            koordinator: payload.koordinator || "-",
            kontak: payload.kontak || "-",
            alamat: payload.alamat || "-",
            tahunProgram: payload.tahunProgram || "2026/2027",
            anggaranPerSantri: Number(payload.anggaranPerSantri) || 4000000,
            adminEmail: payload.adminEmail || null,
          },
        });
        return NextResponse.json({ success: true, pesantren: created });
      }

      case "update_profile": {
        const updated = await prisma.pesantren.update({
          where: { id: targetId },
          data: {
            namaPesantren: payload.namaPesantren,
            nsp: payload.nsp,
            pimpinan: payload.pimpinan,
            koordinator: payload.koordinator,
            kontak: payload.kontak,
            alamat: payload.alamat,
            tahunProgram: payload.tahunProgram,
            anggaranPerSantri: Number(payload.anggaranPerSantri) || 4000000,
          },
        });
        return NextResponse.json({ success: true, profile: updated });
      }

      case "add_santri": {
        const cleanName = String(payload.name || "santri")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 8);
        const suffix = Date.now().toString().slice(-3);
        const emailLogin = `${cleanName || "santri"}${suffix}.santri@az.cbt`;
        const passwordLogin = `BSB${Math.floor(1000 + Math.random() * 9000)}`;
        const scores = Array.isArray(payload.tryoutScores) ? payload.tryoutScores : [];
        const avg =
          scores.length > 0
            ? Math.round(scores.reduce((acc: number, s: any) => acc + Number(s.score || 0), 0) / scores.length)
            : 0;

        const created = await prisma.baznasSantri.create({
          data: {
            pesantrenId: targetId,
            name: payload.name,
            nisn: payload.nisn,
            gender: payload.gender || "L",
            kelas: payload.kelas || "XII MIPA",
            asnaf: payload.asnaf || "MISKIN",
            hafalanJuz: Number(payload.hafalanJuz) || 0,
            prestasi: payload.prestasi || "Santri Berprestasi Pesantren",
            targetUniv1: payload.targetUniv1 || "",
            targetMajor1: payload.targetMajor1 || "",
            targetUniv2: payload.targetUniv2 || "",
            targetMajor2: payload.targetMajor2 || "",
            tryoutScores: JSON.stringify(scores),
            averageScore: avg,
            statusKelulusan: payload.statusKelulusan || "BELUM_DIUMUMKAN",
            diterimaDi: payload.diterimaDi || null,
            emailLogin,
            passwordLogin,
            sktmNomor: payload.sktmNomor || null,
          },
        });
        return NextResponse.json({ success: true, santri: serializeSantri(created) });
      }

      case "import_santri_bulk": {
        const items: any[] = Array.isArray(payload.items) ? payload.items : [];
        const createdList = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const cleanName = String(item.name || "santri")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .slice(0, 8);
          const emailLogin = `${cleanName || "santri"}${Date.now().toString().slice(-3)}${i}.santri@az.cbt`;
          const passwordLogin = `BSB${Math.floor(1000 + Math.random() * 9000)}`;
          const scores = item.tryoutScores || [
            { tryoutName: "TO 1 - Diagnostik", score: 540, date: new Date().toISOString().split("T")[0] },
          ];
          const avg = Math.round(scores.reduce((a: number, s: any) => a + Number(s.score || 0), 0) / scores.length);
          const row = await prisma.baznasSantri.create({
            data: {
              pesantrenId: targetId,
              name: item.name,
              nisn: item.nisn,
              gender: item.gender || "L",
              kelas: item.kelas || "XII",
              asnaf: item.asnaf || "MISKIN",
              hafalanJuz: Number(item.hafalanJuz) || 0,
              prestasi: item.prestasi || "Santri Binaan BAZNAS",
              targetUniv1: item.targetUniv1 || "UNIVERSITAS INDONESIA",
              targetMajor1: item.targetMajor1 || "Ilmu Komputer",
              targetUniv2: item.targetUniv2 || "UIN SYARIF HIDAYATULLAH",
              targetMajor2: item.targetMajor2 || "Pendidikan Agama Islam",
              tryoutScores: JSON.stringify(scores),
              averageScore: avg,
              statusKelulusan: "BELUM_DIUMUMKAN",
              emailLogin,
              passwordLogin,
              sktmNomor: item.sktmNomor || "400/SKTM/2026",
            },
          });
          createdList.push(serializeSantri(row));
        }
        return NextResponse.json({ success: true, count: createdList.length });
      }

      case "update_santri": {
        const existing = await prisma.baznasSantri.findUnique({ where: { id: payload.id } });
        if (!existing || existing.pesantrenId !== targetId) {
          return NextResponse.json({ error: "Data santri tidak ditemukan pada pesantren ini" }, { status: 404 });
        }
        const data: any = {};
        if (payload.statusKelulusan !== undefined) data.statusKelulusan = payload.statusKelulusan;
        if (payload.diterimaDi !== undefined) data.diterimaDi = payload.diterimaDi;
        if (payload.tryoutScores !== undefined) {
          const scores = Array.isArray(payload.tryoutScores) ? payload.tryoutScores : [];
          data.tryoutScores = JSON.stringify(scores);
          data.averageScore =
            scores.length > 0
              ? Math.round(scores.reduce((a: number, s: any) => a + Number(s.score || 0), 0) / scores.length)
              : 0;
        }
        const updated = await prisma.baznasSantri.update({
          where: { id: payload.id },
          data,
        });
        return NextResponse.json({ success: true, santri: serializeSantri(updated) });
      }

      case "delete_santri": {
        const existing = await prisma.baznasSantri.findUnique({ where: { id: payload.id } });
        if (!existing || existing.pesantrenId !== targetId) {
          return NextResponse.json({ error: "Data santri tidak ditemukan pada pesantren ini" }, { status: 404 });
        }
        await prisma.baznasSantri.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "add_logbook": {
        const created = await prisma.baznasLogbook.create({
          data: {
            pesantrenId: targetId,
            tanggal: payload.tanggal,
            waktu: payload.waktu,
            materi: payload.materi,
            subtes: payload.subtes,
            tutor: payload.tutor,
            jumlahHadir: Number(payload.jumlahHadir) || 0,
            keterangan: payload.keterangan || "",
          },
        });
        return NextResponse.json({ success: true, logbook: created });
      }

      case "delete_logbook": {
        const existing = await prisma.baznasLogbook.findUnique({ where: { id: payload.id } });
        if (!existing || existing.pesantrenId !== targetId) {
          return NextResponse.json({ error: "Logbook tidak ditemukan pada pesantren ini" }, { status: 404 });
        }
        await prisma.baznasLogbook.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
    }
  } catch (error) {
    console.error("BAZNAS POST Error:", error);
    return NextResponse.json({ error: "Gagal memproses data BAZNAS" }, { status: 500 });
  }
}

