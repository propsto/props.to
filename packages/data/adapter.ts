import { type Prisma } from "./db";
import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import {
  createSession,
  createUser,
  createVerificationToken,
  deleteSession,
  deleteUser,
  getAccount,
  getSession,
  getUser,
  getUserByAccount,
  getUserByEmail,
  linkAccount,
  unlinkAccount,
  updateSession,
  updateUser,
  useVerificationToken,
  createAuthenticator,
  getAuthenticator,
  listAuthenticatorsByUserId,
  updateAuthenticatorCounter,
} from "./repos";

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
    async updateUser({ id, ...data }) {
      const result = await updateUser(id, data);
      return result.data as AdapterUser;
    },
    async deleteUser(id) {
      const result = await deleteUser(id);
      return result.data as AdapterUser;
    },
    async linkAccount(data) {
      const result = await linkAccount(data);
      return result.data as unknown as AdapterAccount;
    },
    async unlinkAccount(data) {
      const result = await unlinkAccount(data);
      return result.data as unknown as AdapterAccount;
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await getSession(sessionToken);
      if (!userAndSession || !userAndSession.data?.user) return null;
      const { user, ...session } = userAndSession.data;
      return { user, session } as {
        user: AdapterUser;
        session: AdapterSession;
      };
    },
    async createSession(data) {
      const result = await createSession(data);
      return result.data as AdapterSession;
    },
    async updateSession(data) {
      const result = await updateSession(data);
      return result.data;
    },
    async deleteSession(data) {
      const result = await deleteSession(data);
      return result.data;
    },
    async createVerificationToken(data) {
      const verificationToken = await createVerificationToken(data);
      if (!verificationToken.data) return null;
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.data.id) delete verificationToken.data.id;
      return verificationToken as unknown as VerificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await useVerificationToken(identifier_token);
        if (!verificationToken.data) return null;
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken.data;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
    async getAccount(providerAccountId, provider) {
      const result = await getAccount(providerAccountId, provider);
      return result.data;
    },
    async createAuthenticator(authenticator) {
      const result = await createAuthenticator(authenticator);
      return result.data as unknown as AdapterAuthenticator;
    },
    async getAuthenticator(credentialID) {
      const result = await getAuthenticator(credentialID);
      return result.data;
    },
    async listAuthenticatorsByUserId(userId) {
      const result = await listAuthenticatorsByUserId(userId);
      return result.data as AdapterAuthenticator[];
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      const result = await updateAuthenticatorCounter(credentialID, counter);
      return result.data as AdapterAuthenticator;
    },
  };
}
