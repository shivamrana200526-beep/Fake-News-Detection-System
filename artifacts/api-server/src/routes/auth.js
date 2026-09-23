import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const router = Router();
const USERS_FILE = path.resolve(process.cwd(), "users-storage.json");

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write users-storage.json:", err);
  }
}

// Password hashing with scrypt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// 1. REGISTER NEW USER (EMAIL + PASSWORD)
router.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  const users = loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists. Please sign in." });
  }

  const now = new Date().toISOString();
  const token = crypto.randomBytes(32).toString("hex");

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    displayName: name.trim(),
    email: cleanEmail,
    passwordHash: hashPassword(password),
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
    provider: "password",
    token,
    role: "user",
    createdAt: now,
    lastLogin: now,
    loginCount: 1,
  };

  users.unshift(newUser);
  saveUsers(users);

  return res.status(201).json({
    success: true,
    message: "Account created successfully!",
    user: sanitizeUser(newUser),
    token,
  });
});

// 2. LOGIN (EMAIL + PASSWORD)
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ message: "No account found with this email. Please sign up." });
  }

  if (user.provider === "google" && !user.passwordHash) {
    return res.status(400).json({ message: "This account was registered with Google. Please use 'Continue with Google'." });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Incorrect password. Please try again." });
  }

  // Update session
  const token = crypto.randomBytes(32).toString("hex");
  user.token = token;
  user.lastLogin = new Date().toISOString();
  user.loginCount = (user.loginCount || 0) + 1;
  saveUsers(users);

  return res.json({
    success: true,
    message: "Logged in successfully!",
    user: sanitizeUser(user),
    token,
  });
});

// 3. GOOGLE AUTHENTICATION
router.post("/auth/google", (req, res) => {
  const { email, name, displayName, photoURL, uid } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required for Google Sign-In." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const finalName = displayName || name || cleanEmail.split("@")[0];
  const users = loadUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  const now = new Date().toISOString();
  const token = crypto.randomBytes(32).toString("hex");

  let targetUser;

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      displayName: finalName,
      name: finalName,
      photoURL: photoURL || users[existingIndex].photoURL,
      uid: uid || users[existingIndex].uid,
      token,
      lastLogin: now,
      loginCount: (users[existingIndex].loginCount || 1) + 1,
    };
    targetUser = users[existingIndex];
  } else {
    targetUser = {
      id: uid || `usr_g_${Date.now()}`,
      uid: uid || `usr_g_${Date.now()}`,
      name: finalName,
      displayName: finalName,
      email: cleanEmail,
      photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalName)}`,
      provider: "google",
      token,
      role: "user",
      createdAt: now,
      lastLogin: now,
      loginCount: 1,
    };
    users.unshift(targetUser);
  }

  saveUsers(users);

  return res.json({
    success: true,
    message: "Google login successful!",
    user: sanitizeUser(targetUser),
    token,
  });
});

// 4. GET CURRENT USER PROFILE
router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const users = loadUsers();
  const user = users.find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ message: "Invalid or expired session token." });
  }

  return res.json({ user: sanitizeUser(user) });
});

// 5. FORGOT PASSWORD (SIMULATION & CONFIRMATION)
router.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  // Always return success for security (prevent email enumeration)
  return res.json({
    success: true,
    message: `If an account exists for ${cleanEmail}, a password reset link has been prepared.`,
  });
});

// 6. ADMIN USER AUDIT LOG
router.get("/auth/users", (req, res) => {
  const users = loadUsers();
  return res.json({
    total: users.length,
    users: users.map(sanitizeUser),
  });
});

export default router;
