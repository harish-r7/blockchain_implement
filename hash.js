
const fs = require("fs");
const crypto = require("crypto");

function canonicalize(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(k => (sorted[k] = obj[k]));
  return JSON.stringify(sorted);
}

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

const items = JSON.parse(fs.readFileSync("items.json", "utf8"));

const out = items.map(item => {
  const record_hash = sha256(canonicalize(item));
  return { ...item, record_hash };
});

fs.writeFileSync("items_hashed.json", JSON.stringify(out, null, 2));
console.log("✅ Created items_hashed.json with hashes for", out.length, "items");