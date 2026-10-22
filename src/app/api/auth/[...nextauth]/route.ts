import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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

        // 1. Akun Default Admin (Langsung Lolos, Tidak Terpengaruh Koneksi DB)
        if ((email === "admin@az.cbt" || email === "admin") && password === "admin") {
          return {
            id: "usr_admin_default",
            name: "Super Administrator",
            email: "admin@az.cbt",
            role: "ADMIN",
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
            isApproved: true,
            isPremium: true,
            allowedExamTypes: ["SNBT", "TKA_SMA"],
          } as any;
        }

        // 3. Akun Santri BAZNAS (Format: *.santri@az.cbt)
        if (email.endsWith("@az.cbt") || password.startsWith("BSB")) {
          const namePart = email.split("@")[0].replace(".santri", "").toUpperCase();
          return {
            id: `usr_santri_${email.split("@")[0]}`,
            name: `Santri ${namePart}`,
            email: email,
            role: "STUDENT",
            isApproved: true,
            isPremium: true,
            allowedExamTypes: ["SNBT", "TKA_SMA"],
          } as any;
        }

        // 4. Cek Database PostgreSQL (jika online)
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: { equals: email, mode: "insensitive" }
            },
          });

          if (user && user.password === password) {
            return user;
          }
        } catch (dbError) {
          console.warn("Database offline during authorize lookup:", dbError);
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
        (session.user as any).isApproved = token.isApproved;
        (session.user as any).isPremium = token.isPremium;
        (session.user as any).allowedExamTypes = token.allowedExamTypes;
        (session.user as any).schoolName = token.schoolName;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT to avoid DB lookups on every request, matching middleware needs
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
