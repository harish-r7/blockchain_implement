const fs = require("fs");

function pad(n, len = 3) {
  return String(n).padStart(len, "0");
}

const brands = ["DermaGlow", "PureCare", "SkinZen", "AquaNature", "BioBloom"];
const types = ["Face Wash", "Moisturizer", "Sunscreen", "Shampoo", "Serum", "Toner"];
const ingredientsPool = [
  "Glycerin","Niacinamide","Hyaluronic Acid","Salicylic Acid","Aloe Vera","Vitamin C",
  "Ceramides","Panthenol","Zinc Oxide","Fragrance","Alcohol Denat","Shea Butter"
];
const origins = ["Chennai", "Mumbai", "Bengaluru", "Delhi", "Hyderabad"];

function randomPick(arr, k) {
  const copy = [...arr];
  const out = [];
  while (out.length < k && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const baseMfg = "2026-02-01";
const items = [];

for (let i = 1; i <= 30; i++) {
  const brand = brands[i % brands.length];
  const type = types[i % types.length];
  const product_name = `${brand} ${type} ${pad(i, 2)}`;
  const qr_id = `PROD${pad(i)}_BATCH01`;          // unique per product
  const batch_number = `${brand.slice(0,2).toUpperCase()}-${2026}-${pad(i,2)}`;
  const manufactured_date = addDays(baseMfg, i);  // different mfg
  const expiry_date = addDays(manufactured_date, 365); // 1 year shelf-life
  const ingredients = randomPick(ingredientsPool, 3 + (i % 3));
  const origin = origins[i % origins.length];
  const is_expired = false;

  items.push({
    qr_id,
    product_name,
    type,
    manufactured_date,
    expiry_date,
    ingredients,
    batch_number,
    origin,
    is_expired
  });
}

fs.writeFileSync("items.json", JSON.stringify(items, null, 2));
console.log("✅ Created items.json with", items.length, "products");