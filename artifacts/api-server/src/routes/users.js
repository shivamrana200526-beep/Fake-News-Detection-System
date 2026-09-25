import { Router } from "express";
import fs from "node:fs";
import path from "node:path";

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
    console.error("Failed to save users storage:", err);
  }
}

// Strips sensitive fields before any response
function sanitizeUser(user) {
  const { passwordHash, token, ...safeUser } = user;
  return safeUser;
}

// Requires a valid Bearer session token
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const users = loadUsers();
  const user = users.find((u) => u.token === token);
  if (!user) return res.status(401).json({ message: "Invalid or expired session token." });
  req.currentUser = user;
  next();
}

// Called internally after Google sign-in to persist the session entry
router.post("/users/login", (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  if (!email && !uid) {
    return res.status(400).json({ message: "email or uid is required" });
  }

  const users = loadUsers();
  const existingIndex = users.findIndex(
    (u) => (uid && u.uid === uid) || (email && u.email === email),
  );
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      displayName: displayName || users[existingIndex].displayName,
      photoURL: photoURL || users[existingIndex].photoURL,
      lastLogin: now,
      loginCount: (users[existingIndex].loginCount || 1) + 1,
    };
  } else {
    users.unshift({
      uid: uid || `user_${Date.now()}`,
      email: email || "anonymous@user.com",
      displayName: displayName || "Google User",
      photoURL:
        photoURL ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || "User")}`,
      firstLogin: now,
      lastLogin: now,
      loginCount: 1,
    });
  }

  saveUsers(users);
  // Never return the raw user record — acknowledge success only
  return res.json({ success: true });
});

// Admin audit log — requires a valid session token
router.get("/users", requireAuth, (req, res) => {
  const users = loadUsers();
  return res.json({
    total: users.length,
    users: users.map(sanitizeUser),
  });
});

export default router;
