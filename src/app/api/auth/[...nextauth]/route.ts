import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PESANTREN_SEED } from "@/lib/baznasSeed";

async function resolvePesantrenInfo(pesantrenId: string) {
  try {
    const p = await prisma.pesantren.findUnique({ where: { id: pesantrenId } });
    if (p) return p;
  } catch {
    // Fallback when DB is offline
  }
  return DEFAULT_PESANTREN_SEED.find((p) => p.id === pesantrenId) || null;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password.trim();

        // 1. Akun Super Admin Pusat (Kelola Semua Pesantren)
        if ((email === "admin@az.cbt" || email === "admin") && password === "admin") {
          return {
            id: "usr_admin_default",
            name: "Super Administrator",
            email: "admin@az.cbt",
            role: "ADMIN",
            isSuperAdmin: true,
            managedPesantrenId: null,
            pesantrenId: null,
            schoolName: "Pusat (Semua Pesantren)",
            isApproved: true,
            isPremium: true,
            allowedExamTypes: ["SNBT", "TKA_SD", "TKA_SMP", "TKA_SMA"],
          } as any;
        }

        // 1b. Akun Admin Al Abqory & Admin Nurul Bantaniy (Terisolasi per Pesantren)
        if ((email === "admin1@az.cbt" || email === "admin1") && password === "admin1") {
          const p1 = await resolvePesantrenInfo("pesantren-1");
          return {
            id: "usr_admin_pesantren_1",
            name: `Admin ${p1?.namaPesantren || "Al Abqory"}`,
            email: "admin1@az.cbt",
            role: "ADMIN",
            isSuperAdmin: false,
            managedPesantrenId: "pesantren-1",
            pesantrenId: "pesantren-1",
            schoolName: p1?.namaPesantren || "Pondok Pesantren Al Abqory",
            isApproved: true,
            isPremium: true,
            allowedExamTypes: ["SNBT", "TKA_SD", "TKA_SMP", "TKA_SMA"],
          } as any;
        }

        if ((email === "admin2@az.cbt" || email === "admin2") && password === "admin2") {
          const p2 = await resolvePesantrenInfo("pesantren-2");
          return {
            id: "usr_admin_pesantren_2",
            name: `Admin ${p2?.namaPesantren || "Nurul Bantaniy"}`,
            email: "admin2@az.cbt",
            role: "ADMIN",
            isSuperAdmin: false,
            managedPesantrenId: "pesantren-2",
            pesantrenId: "pesantren-2",
            schoolName: p2?.namaPesantren || "Pondok Pesantren Nurul Bantaniy",
            isApproved: true,
            isPremium: true,
            allowedExamTypes: ["SNBT", "TKA_SD", "TKA_SMP", "TKA_SMA"],
          } as any;
        }

        // 2. Akun Default Siswa (Langsung Lolos)
        if ((email === "student@az.cbt" || email === "student") && password === "student") {
          return {
            id: "usr_student_default",
            name: "Siswa Bintang",
            email: "student@az.cbt",
            role: "STUDENT",
            isSuperAdmin: false,
            managedPesantrenId: null,
            pesantrenId: "pesantren-1",
            schoolName: "Pondok Pesantren Al Abqory",
            isApproved: true,
            isPremium: true,
            allowedExamTypes: ["SNBT", "TKA_SMA"],
          } as any;
        }

        // 3. Cek Database User (Admin Pesantren custom / Siswa terdaftar)
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: { equals: email, mode: "insensitive" },
            },
          });

          if (user && user.password === password) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              isSuperAdmin: user.role === "ADMIN" && !user.managedPesantrenId,
              managedPesantrenId: user.managedPesantrenId ?? null,
              pesantrenId: user.pesantrenId ?? null,
              schoolName: user.schoolName || "",
              isApproved: user.isApproved,
              isPremium: user.isPremium,
              allowedExamTypes: user.allowedExamTypes || [],
            } as any;
          }
        } catch (dbError) {
          console.warn("Database offline during user lookup:", dbError);
        }

        // 4. Cek Akun Santri BAZNAS di PostgreSQL (sinkron otomatis dengan data input pesantren)
        try {
          const santri = await prisma.baznasSantri.findFirst({
            where: { emailLogin: { equals: email, mode: "insensitive" } },
            include: { pesantren: true },
          });
          if (santri && santri.passwordLogin === password) {
            const linkedUser = await prisma.user.findFirst({
              where: { email: { equals: santri.emailLogin, mode: "insensitive" } },
            });
            return {
              id: linkedUser?.id || `usr_santri_${santri.id}`,
              name: santri.name,
              email: santri.emailLogin,
              role: "STUDENT",
              isSuperAdmin: false,
              managedPesantrenId: null,
              pesantrenId: santri.pesantrenId,
              schoolName: santri.pesantren.namaPesantren,
              isApproved: true,
              isPremium: true,
              allowedExamTypes: linkedUser?.allowedExamTypes?.length ? linkedUser.allowedExamTypes : ["SNBT", "TKA_SMA"],
            } as any;
          }
        } catch (dbError) {
          console.warn("Database offline during santri lookup:", dbError);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "STUDENT";
        token.isSuperAdmin = (user as any).isSuperAdmin ?? false;
        token.managedPesantrenId = (user as any).managedPesantrenId ?? null;
        token.pesantrenId = (user as any).pesantrenId ?? null;
        token.isApproved = (user as any).isApproved ?? false;
        token.isPremium = (user as any).isPremium ?? false;
        token.allowedExamTypes = (user as any).allowedExamTypes || [];
        token.schoolName = (user as any).schoolName || "";
        token.email = (user as any).email || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).managedPesantrenId = token.managedPesantrenId;
        (session.user as any).pesantrenId = token.pesantrenId;
        (session.user as any).isApproved = token.isApproved;
        (session.user as any).isPremium = token.isPremium;
        (session.user as any).allowedExamTypes = token.allowedExamTypes;
        (session.user as any).schoolName = token.schoolName;
        (session.user as any).email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (
          target.origin === baseUrl ||
          target.hostname.endsWith(".trycloudflare.com") ||
          target.hostname.endsWith(".vercel.app")
        ) {
          return url;
        }
      } catch {}
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
