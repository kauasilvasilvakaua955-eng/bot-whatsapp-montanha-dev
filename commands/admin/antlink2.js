module.exports = {
  name: "antlink2",
  description: "Bloqueia links v2 no grupo",
  category: "admin",
  async execute({ sock, from, isGroup, args, msg, db, saveDatabase }) {
    if (!isGroup) return sock.sendMessage(from, { text: "❌ Comando exclusivo para grupos!" }, { quoted: msg });
    const action = args[0]?.toLowerCase();
    if (action === "on") { db.antiLink2[from] = true; saveDatabase(db); await sock.sendMessage(from, { text: "🛡️ *Anti-Link 2* ativado!" }, { quoted: msg }); }
    else if (action === "off") { db.antiLink2[from] = false; saveDatabase(db); await sock.sendMessage(from, { text: "⚠️ *Anti-Link 2* desativado." }, { quoted: msg }); }
    else { await sock.sendMessage(from, { text: "📌 Use: /antlink2 on/off" }, { quoted: msg }); }
  }
};
