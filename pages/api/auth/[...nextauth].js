import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:1337";

async function refreshAccessToken(token) {
  try {
    const url = baseURL + "/auth/refresh";

    const response = await fetch(url, {
      method: "POST",
      body: {
        refreshToken: token.refreshToken,
      },
      headers: {
        x_authorization: token.accessToken,
      },
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.token,
      accessTokenExpires: Date.now() + refreshedTokens.expiresAt,
      refreshToken: refreshedTokens.user.refreshToken ?? token.refreshToken, // Fall back to old refresh token
      user: refreshedTokens.user,
    };
  } catch (error) {
    console.log("Cant refresh token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        wallet: {
          label: "wallet",
          type: "text",
        },
        message: {
          label: "message",
          type: "text",
        },
        signature: {
          label: "signature",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        const payload = {
          wallet: credentials?.wallet,
          message: credentials?.message,
          sig: credentials?.signature,
        };
        console.log(payload);
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
        console.log("Login response", res);

        const user = await res.json();
        console.log("Login data", user);
        if (!res.ok) {
          throw new Error(user);
        }
        // If no error and we have user data, return it
        if (res.ok && user) {
          return user.data;
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
      console.log("token", token);
      console.log("user", user);
      console.log("account", account);
      if (account && user) {
        return {
          ...token,
          accessToken: user.token,
          refreshToken: user.user.refreshToken,
          accessTokenExpires: Date.now() + user.expiresAt,
          user: user.user,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      refreshAccessToken(token);
    },

    async session({ session, token, user }) {
      console.log("tokenn", token);
      console.log("userr", user);
      console.log("sessionn", session);
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.user = token.user;
      return session;
    },
  },
});
