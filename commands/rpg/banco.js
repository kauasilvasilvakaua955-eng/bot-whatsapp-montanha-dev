module.exports = {
  name: "banco",
  description: "Consulta o cofre e sistema bancário",
  category: "rpg",
  async execute({ sock, from, senderJid, msg, db }) {
    const bal = db.wallets[senderJid] !== undefined ? db.wallets[senderJid] : 10;
    await sock.sendMessage(from, { text: `🏦 *BANCO LUNAR SYSTEM*\n\n💳 Saldo Disponível: R$ ${bal.toFixed(2)}\n🔒 Status: Protegido por cofres quânticos.` }, { quoted: msg });
  }
};
