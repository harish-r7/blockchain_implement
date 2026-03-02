const fs = require("fs");
const QRCode = require("qrcode");

const SERVER_IP = "10.127.131.25";
const PORT = 3000;

const items = JSON.parse(fs.readFileSync("items.json", "utf8"));

(async () => {
  if (!fs.existsSync("qrcodes")) fs.mkdirSync("qrcodes");

  for (const item of items) {
    // ✅ unique link per product
    const payload = `http://${SERVER_IP}:${PORT}/verify?qr_id=${encodeURIComponent(item.qr_id)}`;

    await QRCode.toFile(`qrcodes/${item.qr_id}.png`, payload, {
      width: 512,
      margin: 2,
    });

    console.log("QR generated:", item.qr_id, "->", payload);
  }
})();