module.exports = {
  name: "antilink1",
  description: "Bloqueia links v1 no grupo",
  category: "admin",
  async execute({ sock, from, isGroup, args, msg, db, saveDatabase }) {
    if (!isGroup) return sock.sendMessage(from, { text: "❌ Comando exclusivo para grupos!" }, { quoted: msg });
    const action = args[0]?.toLowerCase();
    if (action === "on") {
      db.antiLink1[from] = true;
      saveDatabase(db);
      await sock.sendMessage(from, { text: "🛡️ *Anti-Link 1* ativado com sucesso neste grupo!" }, { quoted: msg });
    } else if (action === "off") {
      db.antiLink1[from] = false;
      saveDatabase(db);
      await sock.sendMessage(from, { text: "⚠️ *Anti-Link 1* desativado neste grupo." }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: "📌 Use: /antilink1 on ou /antilink1 off" }, { quoted: msg });
    }
  }
};
