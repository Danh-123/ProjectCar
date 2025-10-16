'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Data storage file
const USERS_FILE_PATH = path.join(__dirname, 'users.json');

function ensureUsersFileExists() {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (error) {
    // If we cannot ensure the file, throw to fail fast
    throw error;
  }
}

function readUsersFromFile() {
  ensureUsersFileExists();
  const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf8');
  try {
    const users = JSON.parse(fileContent);
    if (!Array.isArray(users)) {
      return [];
    }
    return users;
  } catch (_err) {
    // If JSON is malformed, reset to empty array to recover
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
}

function writeUsersToFile(users) {
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
}

function toBase64(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function fromBase64(value) {
  try {
    return Buffer.from(String(value), 'base64').toString('utf8');
  } catch (_err) {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Routes
// 1) Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'Thiếu name, email hoặc password' });
  }

  const users = readUsersFromFile();
  const existingUser = users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail
  );
  if (existingUser) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  const storedPassword = toBase64(password); // simple encoding per requirement
  const newUser = {
    name: String(name),
    email: normalizedEmail,
    password: storedPassword,
  };

  users.push(newUser);
  writeUsersToFile(users);

  return res.status(201).json({ message: 'Đăng ký thành công' });
});

// 2) Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Thiếu email hoặc password' });
  }

  const users = readUsersFromFile();
  const user = users.find((u) => normalizeEmail(u.email) === normalizedEmail);
  if (!user) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const encodedIncoming = toBase64(password);
  if (user.password !== encodedIncoming) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const token = toBase64(normalizedEmail);
  return res.json({ token });
});

// 3) Profile
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const [scheme, token] = authHeader.split(' ');

  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const emailFromToken = fromBase64(token);
  if (!emailFromToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const users = readUsersFromFile();
  const user = users.find(
    (u) => normalizeEmail(u.email) === normalizeEmail(emailFromToken)
  );

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.json({ name: user.name, email: user.email });
});

module.exports = app;
