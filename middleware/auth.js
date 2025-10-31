import dotenv from "dotenv";
dotenv.config();

export function authenticate(req, res, next) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  let apiKeys;
  try {
    apiKeys = JSON.parse(process.env.API_KEYS || "{}");
  } catch (error) {
    console.error("Failed to parse API_KEYS from .env");
    return res.status(500).json({ error: "Server config error" });
  }

  const userId = Object.keys(apiKeys).find((key) => apiKeys[key] === apiKey);

  if (!userId) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.userId = userId;

  let admins = [];
  try {
    admins = JSON.parse(process.env.ADMIN_USERS || "[]");
  } catch (error) {
    console.error("Failed to parse ADMIN_USERS from .env");
  }

  req.isAdmin = admins.includes(userId);
  next();
}
