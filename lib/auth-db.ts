// Auth database module
// In production, replace with PostgreSQL queries

export const authDB = {
  users: [] as any[],
  otpVerifications: [] as any[],
  sessions: [] as any[],
};

// User operations
export const userOps = {
  findByPhone: (phone: string) => authDB.users.find(u => u.phone === phone),
  
  findById: (id: string) => authDB.users.find(u => u.id === id),
  
  create: (data: any) => {
    const user = {
      id: `user_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    authDB.users.push(user);
    return user;
  },
  
  update: (id: string, data: any) => {
    const user = authDB.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, data);
      user.updatedAt = new Date().toISOString();
    }
    return user;
  },
};

// OTP operations
export const otpOps = {
  findByPhone: (phone: string) => authDB.otpVerifications.find(o => o.phone === phone),
  
  create: (phone: string, code: string, expiresAt: Date) => {
    const otp = {
      id: `otp_${Date.now()}`,
      phone,
      code,
      attempts: 0,
      expiresAt: expiresAt.toISOString(),
      verified: false,
      createdAt: new Date().toISOString(),
    };
    authDB.otpVerifications.push(otp);
    return otp;
  },
  
  increment: (id: string) => {
    const otp = authDB.otpVerifications.find(o => o.id === id);
    if (otp) otp.attempts++;
    return otp;
  },
  
  delete: (id: string) => {
    const index = authDB.otpVerifications.findIndex(o => o.id === id);
    if (index !== -1) {
      authDB.otpVerifications.splice(index, 1);
    }
  },
};

// Session operations
export const sessionOps = {
  findByToken: (token: string) => authDB.sessions.find(s => s.sessionToken === token),
  
  findByUserId: (userId: string) => authDB.sessions.filter(s => s.userId === userId),
  
  create: (userId: string, phone: string, userType: string, expiresAt: Date) => {
    const session = {
      id: `session_${Date.now()}`,
      userId,
      phone,
      userType,
      sessionToken: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    authDB.sessions.push(session);
    return session;
  },
  
  delete: (token: string) => {
    const index = authDB.sessions.findIndex(s => s.sessionToken === token);
    if (index !== -1) {
      authDB.sessions.splice(index, 1);
    }
  },
  
  deleteByUserId: (userId: string) => {
    const indices = authDB.sessions
      .map((s, i) => (s.userId === userId ? i : -1))
      .filter(i => i !== -1)
      .reverse();
    indices.forEach(i => authDB.sessions.splice(i, 1));
  },
};

// Helper function to get session by token/id
export async function getSession(sessionToken: string) {
  return sessionOps.findByToken(sessionToken);
}
