import type { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest, TokenPair, AuthUser } from '@hr-portal/auth-contracts';
import { conflict, badRequest, unauthorized } from '../errors/http-error.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateTokenPair, hashToken, verifyRefreshToken } from '../utils/jwt.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { userRepository } from '../repositories/user.repository.js';

const toSafeUser = (user: Awaited<ReturnType<typeof userRepository.create>>): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const storeRefreshToken = async (userId: string, refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload.exp) {
    throw badRequest('Refresh token is missing an expiry claim');
  }

  await refreshTokenRepository.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(payload.exp * 1000),
  });
};

const issueAuthResponse = async (user: AuthUser, tokenPair: TokenPair): Promise<AuthResponse> => {
  await storeRefreshToken(user.id, tokenPair.refreshToken);

  return {
    user,
    tokens: tokenPair,
  };
};

export const authService = {
  async register(input: RegisterRequest): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw conflict('A user with this email already exists');
    }

    const createdUser = await userRepository.create({
      name: input.name.trim(),
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    });

    const user = toSafeUser(createdUser);
    const tokens = generateTokenPair(user);

    return issueAuthResponse(user, tokens);
  },

  async login(input: LoginRequest): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();
    const userRecord = await userRepository.findByEmail(email);

    if (!userRecord) {
      throw unauthorized('Invalid email or password');
    }

    const passwordMatches = await comparePassword(input.password, userRecord.passwordHash);

    if (!passwordMatches) {
      throw unauthorized('Invalid email or password');
    }

    const user = toSafeUser(userRecord);
    const tokens = generateTokenPair(user);

    return issueAuthResponse(user, tokens);
  },

  async refresh(input: RefreshTokenRequest): Promise<AuthResponse> {
    const tokenHash = hashToken(input.refreshToken);
    const storedToken = await refreshTokenRepository.findActiveByHash(tokenHash);

    if (!storedToken) {
      throw unauthorized('Refresh token is invalid or expired');
    }

    const payload = verifyRefreshToken(input.refreshToken);

    if (payload.sub !== storedToken.userId || payload.tokenType !== 'refresh') {
      throw unauthorized('Refresh token is invalid');
    }

    await refreshTokenRepository.revokeByHash(tokenHash);

    const userRecord = await userRepository.findById(storedToken.userId);

    if (!userRecord) {
      throw badRequest('Associated user no longer exists');
    }

    const user = toSafeUser(userRecord);
    const tokens = generateTokenPair(user);

    return issueAuthResponse(user, tokens);
  },

  async logout(refreshToken: string) {
    await refreshTokenRepository.revokeByHash(hashToken(refreshToken));
    return { success: true };
  },

  async me(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw unauthorized('User not found');
    }

    return toSafeUser(user);
  },
};