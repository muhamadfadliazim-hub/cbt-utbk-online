import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PESANTREN_SEED, DEFAULT_SANTRI_SEED, DEFAULT_LOGBOOK_SEED } from "@/lib/baznasSeed";

export const ACTIVE_PESANTREN_COOKIE = "az_active_pesantren";

let seedInFlight: Promise<void> | null = null;

/**
 * Ensures at least two pesantren tenants exist in PostgreSQL so multi-pesantren
 * management works out-of-the-box on first load (safe under concurrent requests).
 */
export async function ensureDefaultPesantren() {
  const existing = await prisma.pesantren.findMany({ orderBy: { id: "asc" } });
  if (existing.length > 0) {
    return existing;
  }

  if (!seedInFlight) {
    seedInFlight = (async () => {
      await prisma.pesantren.createMany({
        data: DEFAULT_PESANTREN_SEED,
        skipDuplicates: true,
      });

      // Seed initial santri & logbook for Pesantren 1 so existing demo experience is preserved
      const santriCount = await prisma.baznasSantri.count();
      if (santriCount === 0) {
        await prisma.baznasSantri.createMany({
          data: DEFAULT_SANTRI_SEED.map((s) => ({
            pesantrenId: "pesantren-1",
            name: s.name,
            nisn: s.nisn,
            gender: s.gender,
            kelas: s.kelas,
            asnaf: s.asnaf,
            hafalanJuz: s.hafalanJuz,
            prestasi: s.prestasi,
            targetUniv1: s.targetUniv1,
            targetMajor1: s.targetMajor1,
            targetUniv2: s.targetUniv2,
            targetMajor2: s.targetMajor2,
            tryoutScores: JSON.stringify(s.tryoutScores),
            averageScore: s.averageScore,
            statusKelulusan: s.statusKelulusan,
            diterimaDi: s.diterimaDi || null,
            emailLogin: s.emailLogin,
            passwordLogin: s.passwordLogin,
            sktmNomor: s.sktmNomor || null,
          })),
          skipDuplicates: true,
        });
      }

      const logCount = await prisma.baznasLogbook.count();
      if (logCount === 0) {
        await prisma.baznasLogbook.createMany({
          data: DEFAULT_LOGBOOK_SEED.map((l) => ({
            pesantrenId: "pesantren-1",
            tanggal: l.tanggal,
            waktu: l.waktu,
            materi: l.materi,
            subtes: l.subtes,
            tutor: l.tutor,
            jumlahHadir: l.jumlahHadir,
            keterangan: l.keterangan,
          })),
          skipDuplicates: true,
        });
      }
    })().finally(() => {
      seedInFlight = null;
    });
  }

  await seedInFlight;
  return prisma.pesantren.findMany({ orderBy: { id: "asc" } });
}

export interface AdminTenantContext {
  user: any;
  isSuperAdmin: boolean;
  managedPesantrenId: string | null;
  activePesantrenId: string | null; // null = "Semua Pesantren" (only possible for Super Admin)
  pesantrenList: Awaited<ReturnType<typeof ensureDefaultPesantren>>;
  activePesantren: Awaited<ReturnType<typeof ensureDefaultPesantren>>[number] | null;
}

/**
 * Resolves the current admin's tenant scope.
 * Pesantren admins are strictly locked to their `managedPesantrenId`;
 * Super Admins may switch between `"ALL"` (`null`) or a specific pesantren via cookie.
 */
export async function getAdminTenantContext(): Promise<AdminTenantContext | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }

  const user = session.user as any;
  const pesantrenList = await ensureDefaultPesantren();
  const managedPesantrenId: string | null = user.managedPesantrenId || null;
  const isSuperAdmin = !managedPesantrenId;

  let activePesantrenId: string | null = managedPesantrenId;
  if (isSuperAdmin) {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(ACTIVE_PESANTREN_COOKIE)?.value;
    if (cookieVal && cookieVal !== "ALL" && pesantrenList.some((p) => p.id === cookieVal)) {
      activePesantrenId = cookieVal;
    } else {
      activePesantrenId = null;
    }
  }

  const activePesantren = activePesantrenId
    ? pesantrenList.find((p) => p.id === activePesantrenId) || null
    : null;

  return {
    user,
    isSuperAdmin,
    managedPesantrenId,
    activePesantrenId,
    pesantrenList,
    activePesantren,
  };
}

/**
 * Builds a Prisma `where` filter for User records scoped to the active pesantren.
 */
export function buildUserPesantrenWhere(ctx: AdminTenantContext, extraWhere: Record<string, any> = {}) {
  if (!ctx.activePesantrenId || !ctx.activePesantren) {
    return extraWhere;
  }
  return {
    AND: [
      extraWhere,
      {
        OR: [
          { pesantrenId: ctx.activePesantrenId },
          { schoolName: { equals: ctx.activePesantren.namaPesantren, mode: "insensitive" as const } },
        ],
      },
    ],
  };
}
