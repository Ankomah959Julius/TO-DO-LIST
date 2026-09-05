import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let result;
        try {
          result = await db.execute({
            sql: "SELECT id, name, email, password FROM users WHERE email = ?",
            args: [credentials.email],
          });
        } catch (err) {
          console.error("Database error during login:", err.message);
          throw new Error(
            "Could not reach the database. Check your internet connection and try again."
          );
        }

        const user = result.rows[0];
        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Deliberately NOT including the profile photo here. Cookies (which
        // is what the session/JWT gets stored in) have a strict size limit
        // of only a few KB. A photo is way too big to put in a cookie —
        // doing so breaks every subsequent request with a
        // "431 Request Header Fields Too Large" error. The photo stays in
        // the database only, and the app fetches it separately via
        // GET /api/profile whenever it needs to display it.
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      // Lets client code call useSession().update(newData) right after
      // saving a name change, so the header updates immediately.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
