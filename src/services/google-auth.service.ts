import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `http://localhost:5001/api/auth/google/callback`
);

export const getGoogleAuthUrl = (): string => {
  const redirectUri = `http://localhost:5001/api/auth/google/callback`;
  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
    redirect_uri: redirectUri,
  });
};

export const verifyGoogleToken = async (
  code: string
): Promise<{ email: string; fullName: string; avatar: string } | null> => {
  try {
    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return null;
    }

    return {
      email: payload.email || '',
      fullName: payload.name || '',
      avatar: payload.picture || '',
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    return null;
  }
};
