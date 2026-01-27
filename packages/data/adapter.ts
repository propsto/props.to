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

// Extended user data from Google provider includes extra fields
type CreateUserInput = AdapterUser & {
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
};

export function PropstoAdapter(): Adapter {
  return {
    async createUser(inputData) {
      // Cast to extended type to access Google-specific fields
      const {
        id: _id,
        hostedDomain,
        isGoogleWorkspaceAdmin,
        ...data
      } = inputData as CreateUserInput;

      // Extract hostedDomain and isGoogleWorkspaceAdmin from the data and pass to createUser
      const result = await createUser({
        ...data,
        hostedDomain: hostedDomain ?? undefined,
        isGoogleWorkspaceAdmin: isGoogleWorkspaceAdmin ?? false,
      });
      return result.data as AdapterUser;
    },
    async getUser(id) {
      const result = await getUser({ id });
      return result.data as AdapterUser;
    },
    async getUserByEmail(email) {
      const result = await getUserByEmail(email);
      return result.data ?? null;
    },
    async getUserByAccount(providerAccountId) {
      const result = await getUserByAccount(providerAccountId);
      return (result?.data as AdapterUser) ?? null;
    },
    async updateUser({ id, ...data }) {
      const result = await updateUser(id, {
        ...data,
        // Remove role from the update as it's not part of the AdapterUser type
        role: undefined,
      });
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
      // Prisma may include an id field that Auth.js doesn't expect
      const tokenData = verificationToken.data as {
        id?: string;
      } & typeof verificationToken.data;
      if (tokenData.id) delete tokenData.id;
      return tokenData as unknown as VerificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await useVerificationToken(identifier_token);
        if (!verificationToken.data) return null;
        // Prisma may include an id field that Auth.js doesn't expect
        const tokenData = verificationToken.data as {
          id?: string;
        } & typeof verificationToken.data;
        if (tokenData.id) delete tokenData.id;
        return tokenData;
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
      return result?.data || null;
    },
    async createAuthenticator(authenticator) {
      const result = await createAuthenticator(authenticator);
      return result.data as unknown as AdapterAuthenticator;
    },
    async getAuthenticator(credentialID) {
      const result = await getAuthenticator(credentialID);
      return result.data ?? null;
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
