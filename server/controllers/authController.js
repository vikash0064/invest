import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'alphainvest_secret_key_123456';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token and sign user session JWT
 * POST /api/auth/google
 */
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'ID Token is required' });
  }

  try {
    let email, name, picture;

    // Helper fallback for local developer testing with mock tokens
    if (idToken.startsWith('mock_')) {
      const parts = idToken.split('_');
      email = parts[1] || 'mock.user@gmail.com';
      name = email.split('@')[0].toUpperCase();
      picture = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
      console.log(`[Auth Controller] Simulating Google Sign-In for email: ${email}`);
    } else {
      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ 
          error: 'Google Client ID is not configured on the backend server.',
          details: 'Please add GOOGLE_CLIENT_ID to your backend .env file.' 
        });
      }

      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      email = payload.email;
      name = payload.name || email.split('@')[0];
      picture = payload.picture || '';
      console.log(`[Auth Controller] Securely verified Google User: ${email}`);
    }

    // Sign local session JWT
    const token = jwt.sign(
      { email, name }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        name,
        email,
        avatar: picture,
        tier: 'Institutional Tier',
        joinedDate: 'June 28, 2026',
        apiCallsUsed: 42,
        apiCallsLimit: 1000
      }
    });
  } catch (error) {
    console.error('Google OAuth validation failed:', error.message);
    res.status(401).json({ 
      error: 'Invalid ID Token or Google Authentication failed.',
      details: error.message 
    });
  }
};
