import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

// Simple schema for login
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("Authorize called with:", credentials);
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({
            where: { email },
          });

          console.log("User found:", user ? user.email : "No user");

          if (!user) return null;

          if (password === user.password) {
            console.log("Password match");
            return user;
          }
          console.log("Password mismatch");
        } else {
          console.log("Schema validation failed");
        }

        return null;
      },
    }),
  ],
});

