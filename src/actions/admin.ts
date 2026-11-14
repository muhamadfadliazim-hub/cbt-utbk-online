"use server";

import { prisma } from "@/lib/prisma";
import { getAdminTenantContext } from "@/lib/tenant";
import { ExamType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function toggleUserApproval(userId: string, isApproved: boolean) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin && ctx.managedPesantrenId) {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { pesantrenId: true } });
      if (!target || target.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Tidak memiliki akses ke akun pesantren lain." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isApproved },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user approval:", error);
    return { error: "Failed to update user status" };
  }
}

export async function updateUserSchool(userId: string, schoolName: string) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin && ctx.managedPesantrenId) {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { pesantrenId: true } });
      if (!target || target.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Tidak memiliki akses ke akun pesantren lain." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { schoolName },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user school:", error);
    return { error: "Failed to update user school" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin && ctx.managedPesantrenId) {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { pesantrenId: true } });
      if (!target || target.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Tidak memiliki akses ke akun pesantren lain." };
      }
    }

    await prisma.$transaction([
      prisma.attempt.deleteMany({ where: { userId } }),
      prisma.reportCard.deleteMany({ where: { userId } }),
      prisma.studentProgress.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

export async function updateUserExamTypes(userId: string, allowedTypes: ExamType[]) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };
    if (!ctx.isSuperAdmin && ctx.managedPesantrenId) {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { pesantrenId: true } });
      if (!target || target.pesantrenId !== ctx.managedPesantrenId) {
        return { error: "Tidak memiliki akses ke akun pesantren lain." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { allowedExamTypes: allowedTypes },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user exam types:", error);
    return { error: "Failed to update user exam types" };
  }
}

export async function createManagedUser(input: {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "ADMIN";
  pesantrenId?: string | null;
}) {
  try {
    const ctx = await getAdminTenantContext();
    if (!ctx) return { error: "Unauthorized" };

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();
    if (!name || !email || !password) {
      return { error: "Nama, email, dan password wajib diisi." };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: `Email ${email} sudah terdaftar.` };
    }

    const role = ctx.isSuperAdmin ? input.role : "STUDENT";
    const pesantrenId = ctx.isSuperAdmin
      ? input.pesantrenId || null
      : ctx.managedPesantrenId || null;

    let schoolName: string | null = null;
    if (pesantrenId) {
      const p = await prisma.pesantren.findUnique({
        where: { id: pesantrenId },
        select: { namaPesantren: true },
      });
      schoolName = p?.namaPesantren || null;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        pesantrenId,
        managedPesantrenId: role === "ADMIN" ? pesantrenId : null,
        schoolName,
        isApproved: true,
        isPremium: true,
        allowedExamTypes: ["SNBT", "TKA_SMA"],
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error creating managed user:", error);
    return { error: "Gagal membuat akun pengguna." };
  }
}

export async function publishAnnouncementAction(input: {
  title: string;
  message: string;
  audience: "ALL" | "SNBT" | "UTBK" | "TKA_SD" | "TKA_SMP" | "TKA_SMA";
  priority?: "NORMAL" | "IMPORTANT" | "URGENT";
}) {
  const ctx = await getAdminTenantContext();
  if (!ctx) return { error: "Unauthorized" };

  const title = input.title.trim();
  const message = input.message.trim();
  if (!title || !message) return { error: "Judul dan isi pengumuman wajib diisi." };

  const announcement = await prisma.announcement.create({
    data: {
      title,
      message,
      audience: input.audience === "ALL" ? null : input.audience,
      priority: input.priority || "IMPORTANT",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/student");
  revalidatePath("/student/exams");

  return { success: true, announcement };
}

export async function deleteAnnouncementAction(id: string) {
  const ctx = await getAdminTenantContext();
  if (!ctx) return { error: "Unauthorized" };

  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/student");
  revalidatePath("/student/exams");
  return { success: true };
}

export async function createMaterialAction(input: {
  title: string;
  subjectTitle: string;
  category: "SNBT" | "TKA_SD" | "TKA_SMP" | "TKA_SMA";
  type: "VIDEO" | "PDF" | "ARTICLE";
  url: string;
  duration: number;
  description: string;
  isPublished: boolean;
}) {
  const ctx = await getAdminTenantContext();
  if (!ctx) return { error: "Unauthorized" };

  const title = input.title.trim();
  const subjectTitle = input.subjectTitle.trim();
  const url = input.url.trim();
  if (!title || !subjectTitle || !url) {
    return { error: "Judul materi, mata pelajaran, dan tautan wajib diisi." };
  }

  let subject = await prisma.subject.findUnique({
    where: { title: subjectTitle },
    include: { chapters: { orderBy: { orderIndex: "asc" } } },
  });

  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        title: subjectTitle,
        description: `Modul resmi ${subjectTitle} untuk persiapan UTBK-SNBT 2026.`,
        chapters: {
          create: {
            title: "Modul Utama & Pembahasan",
            orderIndex: 0,
          },
        },
      },
      include: { chapters: { orderBy: { orderIndex: "asc" } } },
    });
  }

  let chapter = subject.chapters[0];
  if (!chapter) {
    chapter = await prisma.chapter.create({
      data: {
        subjectId: subject.id,
        title: "Modul Utama & Pembahasan",
        orderIndex: 0,
      },
    });
  }

  const countInChapter = await prisma.material.count({
    where: { chapterId: chapter.id },
  });

  const material = await prisma.material.create({
    data: {
      chapterId: chapter.id,
      title,
      description: input.description.trim() || null,
      type: input.type,
      url,
      duration: Math.max(1, Number(input.duration) || 15),
      orderIndex: countInChapter,
      examType: input.category,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? new Date() : null,
    },
  });

  revalidatePath("/admin/materials");
  revalidatePath("/admin");
  revalidatePath("/student/learn");

  return { success: true, material };
}

export async function toggleMaterialPublishAction(id: string, nextPublished: boolean) {
  const ctx = await getAdminTenantContext();
  if (!ctx) return { error: "Unauthorized" };

  await prisma.material.update({
    where: { id },
    data: {
      isPublished: nextPublished,
      publishedAt: nextPublished ? new Date() : null,
    },
  });

  revalidatePath("/admin/materials");
  revalidatePath("/student/learn");
  return { success: true };
}

export async function deleteMaterialAction(id: string) {
  const ctx = await getAdminTenantContext();
  if (!ctx) return { error: "Unauthorized" };

  await prisma.material.delete({ where: { id } });
  revalidatePath("/admin/materials");
  revalidatePath("/student/learn");
  return { success: true };
}
