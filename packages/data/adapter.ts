/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16}}>
 *  Official <a href="https://www.prisma.io/docs">Prisma</a> adapter for Auth.js / NextAuth.js.
 *  <a href="https://www.prisma.io/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/adapters/prisma.svg" width="38" />
 *  </a>
 * </div>
 *
 * ## Installation
 *
 * ```bash npm2yarn
 * npm install @prisma/client @auth/prisma-adapter
 * npm install prisma --save-dev
 * ```
 *
 * @module @auth/prisma-adapter
 */

import { type Prisma, type PrismaClient, DbError } from "./db";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters";
import { createUser, getUser, getUserByAccount, getUserByEmail } from "./repos";

export function PropstoAdapter(): Adapter {
  return {
    async createUser({ id: _id, ...data }) {
      const result = await createUser(data);
      return result.data;
    },
    async getUser(id) {
      const result = await getUser({ id });
      return result.data;
    },
    async getUserByEmail(email) {
      const result = await getUserByEmail({ email });
      return result.data;
    },
    async getUserByAccount(providerAccountId) {
      const result = await getUserByAccount(providerAccountId);
      return (result?.data?.user as AdapterUser) ?? null;
    },
    updateUser: ({ id, ...data }) =>
      withHandleError(
        () => p.user.update({ where: { id }, data }) as Promise<AdapterUser>
      ),
    deleteUser: (id) =>
      withHandleError(
        () => p.user.delete({ where: { id } }) as Promise<AdapterUser>
      ),
    linkAccount: (data) =>
      withHandleError(
        () => p.account.create({ data }) as unknown as AdapterAccount
      ),
    unlinkAccount: (provider_providerAccountId) =>
      withHandleError(
        () =>
          p.account.delete({
            where: { provider_providerAccountId },
          }) as unknown as AdapterAccount
      ),
    async getSessionAndUser(sessionToken) {
      const userAndSession = await withHandleError(
        async () =>
          await p.session.findUnique({
            where: { sessionToken },
            include: { user: true },
          })
      );
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session } as {
        user: AdapterUser;
        session: AdapterSession;
      };
    },
    createSession: (data) => withHandleError(() => p.session.create({ data })),
    updateSession: (data) =>
      withHandleError(() =>
        p.session.update({ where: { sessionToken: data.sessionToken }, data })
      ),
    deleteSession: (sessionToken) =>
      withHandleError(() => p.session.delete({ where: { sessionToken } })),
    async createVerificationToken(data) {
      const verificationToken = withHandleError(
        async () => await p.verificationToken.create({ data })
      );
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await withHandleError(
          async () =>
            await p.verificationToken.delete({
              where: { identifier_token },
            })
        );
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
    async getAccount(providerAccountId, provider) {
      return withHandleError(() => {
        return p.account.findFirst({
          where: { providerAccountId, provider },
        }) as Promise<AdapterAccount | null>;
      });
    },
    async createAuthenticator(authenticator) {
      return withHandleError(() => {
        return p.authenticator.create({
          data: authenticator,
        });
      });
    },
    async getAuthenticator(credentialID) {
      return withHandleError(() => {
        return p.authenticator.findUnique({
          where: { credentialID },
        });
      });
    },
    async listAuthenticatorsByUserId(userId) {
      return withHandleError(() => {
        return p.authenticator.findMany({
          where: { userId },
        });
      });
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      return withHandleError(() => {
        return p.authenticator.update({
          where: { credentialID },
          data: { counter },
        });
      });
    },
  };
}
