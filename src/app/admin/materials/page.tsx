import { prisma } from "@/lib/prisma";
import MaterialsClient from "./MaterialsClient";

export default async function AdminMaterialsPage() {
  const materials = await prisma.material.findMany({
    include: {
      chapter: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = materials.map((m) => ({
    id: m.id,
    title: m.title,
    subject: m.chapter.subject.title,
    category: (m.examType || "SNBT") as "SNBT" | "TKA_SD" | "TKA_SMP" | "TKA_SMA",
    type: m.type,
    url: m.url,
    duration: m.duration || 15,
    description: m.description || "",
    isPublished: m.isPublished,
  }));

  return <MaterialsClient initialMaterials={serialized} />;
}
