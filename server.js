
require("dotenv").config();
const crypto = require("crypto");
const { ethers } = require("ethers");

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function canonicalize(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach((k) => (sorted[k] = obj[k]));
  return JSON.stringify(sorted);
}
function sha256Hex(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

const CONTRACT_ABI = ["function get(string qr_id) external view returns (bytes32)"];
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Load items from items.json (your backend "database" for MVP)
function loadItems() {
  const filePath = path.join(__dirname, "items.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// ✅ Verify endpoint: gives product details by qr_id
app.get("/verify", async (req, res) => {
  try {
    const { qr_id } = req.query;
    if (!qr_id) return res.status(400).json({ error: "qr_id is required" });

    const items = loadItems();
    const item = items.find((x) => x.qr_id === qr_id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // local hash from your current record
    const localHash = "0x" + sha256Hex(canonicalize(item));

    // blockchain stored hash
    const chainHash = await contract.get(qr_id);

    const verified =
      localHash.toLowerCase() === String(chainHash).toLowerCase() &&
      String(chainHash) !== "0x0000000000000000000000000000000000000000000000000000000000000000";

    return res.json({
      status: "ok",
      item,
      blockchain: { verified, localHash, chainHash },
    });
  } catch (e) {
    return res.status(500).json({ error: "Blockchain verify failed", details: String(e) });
  }
});

// ✅ List all products
app.get("/items", (req, res) => {
  const items = loadItems();
  res.json(items);
});

// ✅ Health check (useful for testing from phone)
app.get("/", (req, res) => {
  res.send("✅ Server is running. Try /items or /verify?qr_id=PROD001_BATCH01");
});

const PORT = 3000;

// IMPORTANT: bind to 0.0.0.0 so phone can reach it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on network`);
  console.log(`➡ Open on laptop:   http://localhost:${PORT}/items`);
  console.log(`➡ Open on phone :   http://10.127.131.25:${PORT}/items`);
});