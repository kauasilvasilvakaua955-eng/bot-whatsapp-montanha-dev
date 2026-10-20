module.exports = {
  name: "carteira",
  description: "Consulta o saldo atual na carteira",
  category: "rpg",
  async execute({ sock, from, senderJid, msg, db }) {
    const bal = db.wallets[senderJid] !== undefined ? db.wallets[senderJid] : 10;
    await sock.sendMessage(from, { text: `👛 *CARTEIRA LUNAR*\n\n💰 Saldo atual: R$ ${bal.toFixed(2)}` }, { quoted: msg });
  }
};
