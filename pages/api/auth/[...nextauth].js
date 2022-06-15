import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        wallet: {
          label: "wallet",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        const payload = {
          wallet: credentials?.wallet,
        };

        console.log("payload", payload);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
          {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("hula", res);

        const user = await res.json();
        console.log("halu", user);
        if (!res.ok) {
          throw new Error(user);
        }
        // If no error and we have user data, return it
        if (res.ok && user) {
          console.log(user);
          return user;
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
    // ...add more providers here
  ],
  //   secret: process.env.NEXT_PUBLIC_JWT_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    newUser: "/signup",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: user,
          //   refreshToken: account.refresh_token,
        };
      }

      return token;
    },

    async session({ session, token, user }) {
      session.accessToken = token.accessToken;
      //   session.refreshToken = token.refreshToken;
      //   session.accessTokenExpires = token.accessTokenExpires;
      return session;
    },
  },
});
