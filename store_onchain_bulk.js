require("dotenv").config();
const fs = require("fs");
const { ethers } = require("ethers");

const ABI = [
  "function bulkStore(string[] qr_ids, bytes32[] hashes) external",
  "function get(string qr_id) external view returns (bytes32)"
];

async function main() {
  // 1) Connect to Sepolia through Alchemy RPC
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // 2) Load your MetaMask wallet (seller/admin) to SIGN transactions
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // 3) Point to your deployed contract
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

  // 4) Read hashed items from file
  const items = JSON.parse(fs.readFileSync("items_hashed.json", "utf8"));

  // 5) Build arrays for bulkStore
  const qr_ids = items.map((i) => i.qr_id);
  const hashes = items.map((i) => "0x" + i.record_hash); // bytes32 needs 0x prefix

  console.log("qr_ids:", qr_ids.length, "hashes:", hashes.length);
  console.log("Storing", qr_ids.length, "items on-chain...");

  // 6) Send transaction to blockchain
  const tx = await contract.bulkStore(qr_ids, hashes, { gasLimit: 5_000_000 });
  console.log("✅ TX sent:", tx.hash);

  // 7) Wait for confirmation
  await tx.wait();
  console.log("✅ Confirmed on-chain!");
}

main().catch((e) => {
  console.error("FAILED:", e?.shortMessage || e?.message || e);
  if (e?.info?.error?.message) console.error("RPC:", e.info.error.message);
});