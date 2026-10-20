module.exports = {
  name: "antilinkgeral",
  description: "Bloqueia todos os links no grupo",
  category: "admin",
  async execute({ sock, from, isGroup, args, msg, db, saveDatabase }) {
    if (!isGroup) return sock.sendMessage(from, { text: "❌ Comando exclusivo para grupos!" }, { quoted: msg });
    const action = args[0]?.toLowerCase();
    if (action === "on") { db.antiLinkGeral[from] = true; saveDatabase(db); await sock.sendMessage(from, { text: "🛡️ *Anti-Link Geral* ativado!" }, { quoted: msg }); }
    else if (action === "off") { db.antiLinkGeral[from] = false; saveDatabase(db); await sock.sendMessage(from, { text: "⚠️ *Anti-Link Geral* desativado." }, { quoted: msg }); }
    else { await sock.sendMessage(from, { text: "📌 Use: /antilinkgeral on/off" }, { quoted: msg }); }
  }
};
