import "dotenv/config";
import crypto from "crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ExamType } from "@prisma/client";
import { DEFAULT_PESANTREN_SEED } from "../src/lib/baznasSeed";

const connectionString =
  process.env.DATABASE_URL || "postgresql://muhamadfadliazim@localhost:5300/az_academy_cbt";
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SANTRI_AL_ABQORY: { name: string; gender: "L" | "P" }[] = [
  { name: "AZKA HABIBURRAHMAN", gender: "L" },
  { name: "FATIHAMDI KAYSAN HADI", gender: "L" },
  { name: "MUHAMMAD HAIDAR FATHURRIZIEQ", gender: "L" },
  { name: "RAIHAN FAJAR ADZHANI", gender: "L" },
  { name: "RIDHO FATUHROHMAN", gender: "L" },
  { name: "AQILLA MUSTANIRA", gender: "P" },
  { name: "JIHAN FAIRUZ RAMADHANI", gender: "P" },
  { name: "NASSYIFA NURUL FATHONAH", gender: "P" },
  { name: "SITI JELIKA CHAERUNNISA", gender: "P" },
  { name: "RIVALDY NABIL ATMADIMADJA", gender: "L" },
  { name: "MELSA ZUHRIYAH AL-RAFIFAH", gender: "P" },
  { name: "AHMAD WAFI HIBATULLAH", gender: "L" },
  { name: "HUSEIN AKHBAR NASRULLOH", gender: "L" },
  { name: "MUHAMMAD AL FATIH", gender: "L" },
  { name: "MUHAMMAD YUSUF SANTOSO", gender: "L" },
  { name: "KHAYYIRAH TRISYIFA FIRMANSYAH PUTRI", gender: "P" },
  { name: "MADINA AL ROFI", gender: "P" },
  { name: "TSABITA AFNAN JANNATI", gender: "P" },
  { name: "AZZAM ABDULLAH", gender: "L" },
  { name: "MASHDARUL ILMI MUBAROK", gender: "L" },
  { name: "MUHAMMAD HAFIDZ ABDURRAHMAN", gender: "L" },
  { name: "MUHAMMAD HANIF ARROSYAD", gender: "L" },
  { name: "MUHAMMAD SHONHAJI", gender: "L" },
  { name: "ZIYAN AHMAD HANIN", gender: "L" },
  { name: "AFIFAH KAMILA ISTIQOMAH", gender: "P" },
  { name: "AISAH TABRINA", gender: "P" },
  { name: "AISYATUL HUMAYRA", gender: "P" },
  { name: "ASHIMA DINILLAH HAFID", gender: "P" },
  { name: "AUSHOFANY JIHANA", gender: "P" },
  { name: "FATHIA ZAHIRATU BILQIS", gender: "P" },
  { name: "FIDA SALMA", gender: "P" },
  { name: "NUR IZZATUL ALIYAH", gender: "P" },
  { name: "RAJWA AQILAH FATIHATUN NA'IMAH", gender: "P" },
  { name: "SHIFNY NAADIYA AFILLAH", gender: "P" },
];

const PASS_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function makeEmailSlug(fullName: string): string {
  return fullName
    .normalize("NFKD")
    .replace(/[`'’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function makeIndividualPassword(prefix: string, index: number, seedKey: string): string {
  const hash = crypto.createHash("sha256").update(`${prefix}:${index}:${seedKey}`).digest();
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += PASS_ALPHABET[hash[i] % PASS_ALPHABET.length];
  }
  return `${prefix}${String(index).padStart(2, "0")}-${code}`;
}

const PONPES_ADMINS = [
  {
    id: "usr_admin_alabqory",
    pesantrenId: "pesantren-1",
    schoolName: "Pondok Pesantren Al Abqory",
    name: "Admin Pondok Pesantren Al Abqory",
    email: "admin.alabqory@az.cbt",
    password: makeIndividualPassword("ABQADM", 1, "alabqory-ponpes-admin"),
  },
  {
    id: "usr_admin_nurulbantaniy",
    pesantrenId: "pesantren-2",
    schoolName: "Pondok Pesantren Nurul Bantaniy",
    name: "Admin Pondok Pesantren Nurul Bantaniy",
    email: "admin.nurulbantaniy@az.cbt",
    password: makeIndividualPassword("BNTADM", 2, "nurul-bantaniy-ponpes-admin"),
  },
];

async function main() {
  // 1. Ensure only the 2 official pesantren tenants exist cleanly with updated adminEmail
  for (const p of DEFAULT_PESANTREN_SEED) {
    await prisma.pesantren.upsert({
      where: { id: p.id },
      update: {
        namaPesantren: p.namaPesantren,
        adminEmail: p.adminEmail,
      },
      create: p,
    });
  }

  // 2. Create standalone Admin accounts for each Ponpes (terisolasi per managedPesantrenId)
  for (const adm of PONPES_ADMINS) {
    await prisma.user.upsert({
      where: { email: adm.email },
      update: {
        name: adm.name,
        password: adm.password,
        role: "ADMIN",
        isApproved: true,
        isPremium: true,
        pesantrenId: adm.pesantrenId,
        managedPesantrenId: adm.pesantrenId,
        schoolName: adm.schoolName,
        allowedExamTypes: [ExamType.SNBT, ExamType.TKA_SD, ExamType.TKA_SMP, ExamType.TKA_SMA],
      },
      create: {
        id: adm.id,
        name: adm.name,
        email: adm.email,
        password: adm.password,
        role: "ADMIN",
        isApproved: true,
        isPremium: true,
        pesantrenId: adm.pesantrenId,
        managedPesantrenId: adm.pesantrenId,
        schoolName: adm.schoolName,
        allowedExamTypes: [ExamType.SNBT, ExamType.TKA_SD, ExamType.TKA_SMP, ExamType.TKA_SMA],
      },
    });
  }

  // 3. Remove legacy placeholder dummy santri (*.santri@az.cbt) from Al Abqory
  await prisma.baznasSantri.deleteMany({
    where: {
      pesantrenId: "pesantren-1",
      emailLogin: { endsWith: ".santri@az.cbt" },
    },
  });

  // 4. Upsert 34 standalone individual santri accounts (User + BaznasSantri)
  const usedEmails = new Set<string>();
  const credentialsReport: { no: number; name: string; email: string; password: string; gender: string }[] = [];

  for (let i = 0; i < SANTRI_AL_ABQORY.length; i++) {
    const no = i + 1;
    const item = SANTRI_AL_ABQORY[i];
    const baseSlug = makeEmailSlug(item.name);
    let email = `${baseSlug}@alabqory.az.cbt`;
    if (usedEmails.has(email)) {
      email = `${baseSlug}.${no}@alabqory.az.cbt`;
    }
    usedEmails.add(email);

    const password = makeIndividualPassword("ABQ", no, item.name);
    const userId = `usr_abqory_${String(no).padStart(2, "0")}`;
    const santriId = `bsb_abqory_${String(no).padStart(2, "0")}`;
    const nisn = `202601${String(no).padStart(4, "0")}`;

    await prisma.user.upsert({
      where: { email },
      update: {
        name: item.name,
        password,
        role: "STUDENT",
        isApproved: true,
        isPremium: true,
        pesantrenId: "pesantren-1",
        managedPesantrenId: null,
        schoolName: "Pondok Pesantren Al Abqory",
        allowedExamTypes: [ExamType.SNBT, ExamType.TKA_SMA],
      },
      create: {
        id: userId,
        name: item.name,
        email,
        password,
        role: "STUDENT",
        isApproved: true,
        isPremium: true,
        pesantrenId: "pesantren-1",
        managedPesantrenId: null,
        schoolName: "Pondok Pesantren Al Abqory",
        allowedExamTypes: [ExamType.SNBT, ExamType.TKA_SMA],
      },
    });

    await prisma.baznasSantri.upsert({
      where: { id: santriId },
      update: {
        pesantrenId: "pesantren-1",
        name: item.name,
        nisn,
        gender: item.gender,
        kelas: "XII",
        emailLogin: email,
        passwordLogin: password,
      },
      create: {
        id: santriId,
        pesantrenId: "pesantren-1",
        name: item.name,
        nisn,
        gender: item.gender,
        kelas: "XII",
        asnaf: "MISKIN",
        hafalanJuz: 0,
        prestasi: "",
        targetUniv1: "",
        targetMajor1: "",
        targetUniv2: "",
        targetMajor2: "",
        tryoutScores: "[]",
        averageScore: 0,
        statusKelulusan: "BELUM_DIUMUMKAN",
        emailLogin: email,
        passwordLogin: password,
      },
    });

    credentialsReport.push({ no, name: item.name, email, password, gender: item.gender });
  }

  const [dbUsersAlAbqory, dbSantriAlAbqory, dbAdmins] = await Promise.all([
    prisma.user.count({ where: { pesantrenId: "pesantren-1", role: "STUDENT" } }),
    prisma.baznasSantri.count({ where: { pesantrenId: "pesantren-1" } }),
    prisma.user.findMany({
      where: { role: "ADMIN", managedPesantrenId: { not: null } },
      select: { id: true, email: true, managedPesantrenId: true, schoolName: true },
      orderBy: { managedPesantrenId: "asc" },
    }),
  ]);

  console.log("=== AKUN ADMIN PONPES (BERDIRI SENDIRI PER PESANTREN) ===");
  for (const adm of PONPES_ADMINS) {
    console.log(`${adm.schoolName} | Email: ${adm.email} | Password: ${adm.password}`);
  }
  console.log("DB Admins Verified:", JSON.stringify(dbAdmins));
  console.log(`DB Al Abqory Counts -> User(STUDENT): ${dbUsersAlAbqory}, BaznasSantri: ${dbSantriAlAbqory}`);
  console.log("=== 34 AKUN SANTRI PONPES AL ABQORY ===");
  for (const row of credentialsReport) {
    console.log(`${String(row.no).padStart(2, "0")}. ${row.name} | ${row.email} | ${row.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

