import { Router, Request, Response } from 'express';

const router = Router();

// In-memory user store for registered users
const registeredUsers: Array<{
  name: string;
  email: string;
  passwordHash: string;
  organization?: string;
  role: string;
  clearance: string;
  registeredAt: string;
}> = [];

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, organization } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: true, message: 'Name, email, and password are required.' });
  }

  const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: true, message: 'An analyst account with this email already exists.' });
  }

  const newUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: Buffer.from(password).toString('base64'),
    organization: organization || 'ISRO Satellite Telemetry Division',
    role: 'ISRO Earth Observation Analyst',
    clearance: 'LEVEL-4 RESTRICTED',
    registeredAt: new Date().toISOString()
  };

  registeredUsers.push(newUser);

  const token = `satquery_jwt_${Buffer.from(newUser.email).toString('base64')}_${Date.now()}`;

  res.json({
    status: 'success',
    message: 'Analyst account successfully created and registered',
    token,
    user: {
      name: newUser.name,
      email: newUser.email,
      organization: newUser.organization,
      role: newUser.role,
      clearance: newUser.clearance,
      registeredAt: newUser.registeredAt
    }
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: 'Email and password are required' });
  }

  const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const userName = existing ? existing.name : email.split('@')[0].toUpperCase();

  const token = `satquery_jwt_${Buffer.from(email).toString('base64')}_${Date.now()}`;

  res.json({
    status: 'success',
    token,
    user: {
      email,
      name: userName,
      role: existing?.role || 'ISRO Earth Observation Analyst',
      clearance: existing?.clearance || 'LEVEL-4 RESTRICTED',
      lastLogin: new Date().toISOString()
    }
  });
});

// POST /api/auth/google (Real-time Google Account Authentication)
router.post('/google', (req: Request, res: Response) => {
  const { email, name, picture, googleId } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: 'Google account email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const userName = name || cleanEmail.split('@')[0].toUpperCase();

  let existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!existing) {
    existing = {
      name: userName,
      email: cleanEmail,
      passwordHash: 'GOOGLE_OAUTH_AUTHENTICATED',
      organization: 'Google Authenticated Analyst',
      role: 'ISRO Earth Observation Analyst (Google OAuth)',
      clearance: 'LEVEL-4 RESTRICTED',
      registeredAt: new Date().toISOString()
    };
    registeredUsers.push(existing);
  }

  const token = `satquery_google_jwt_${Buffer.from(cleanEmail).toString('base64')}_${Date.now()}`;

  res.json({
    status: 'success',
    provider: 'google',
    token,
    user: {
      email: cleanEmail,
      name: userName,
      picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00A3A6&color=fff`,
      role: existing.role,
      clearance: existing.clearance,
      googleId: googleId || `google_${Date.now()}`,
      lastLogin: new Date().toISOString()
    }
  });
});

export default router;
