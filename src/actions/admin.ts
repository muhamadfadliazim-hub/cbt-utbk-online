"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserApproval(userId: string, isApproved: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved },
    });
    
    // Revalidate the users page so it updates immediately
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user approval:", error);
    return { error: "Failed to update user status" };
  }
}

export async function updateUserSchool(userId: string, schoolName: string) {
  try {
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
    // Delete in transaction to avoid orphan records
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
