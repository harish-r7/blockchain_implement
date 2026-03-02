require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const net = await provider.getNetwork();
  console.log("✅ Connected. ChainId:", net.chainId, "Name:", net.name);
}

main().catch(console.error);