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

// Record a user login
router.post("/users/login", (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  if (!email && !uid) {
    return res.status(400).json({ message: "email or uid is required" });
  }

  const users = loadUsers();
  const existingIndex = users.findIndex((u) => (uid && u.uid === uid) || (email && u.email === email));
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
      photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || "User")}`,
      firstLogin: now,
      lastLogin: now,
      loginCount: 1,
    });
  }

  saveUsers(users);
  return res.json({ success: true, user: users[existingIndex >= 0 ? existingIndex : 0] });
});

// Get all logged in users (Admin / Audit Log)
router.get("/users", (req, res) => {
  const users = loadUsers();
  return res.json({
    total: users.length,
    users,
  });
});

export default router;
