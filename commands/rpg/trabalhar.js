module.exports = {
  name: "trabalhar",
  description: "Trabalha para ganhar uma graninha extra",
  category: "rpg",
  async execute({ sock, from, senderJid, msg, db, saveDatabase }) {
    const ganho = Math.floor(Math.random() * 80) + 20;
    if (db.wallets[senderJid] === undefined) db.wallets[senderJid] = 10;
    db.wallets[senderJid] += ganho;
    saveDatabase(db);
    await sock.sendMessage(from, { text: `⚒️ Você trabalhou duro e ganhou *R$ ${ganho.toFixed(2)}*!` }, { quoted: msg });
  }
};
