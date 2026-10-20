module.exports = {
  name: "crime",
  description: "Comete um crime de risco",
  category: "rpg",
  async execute({ sock, from, senderJid, msg, db, saveDatabase }) {
    if (db.wallets[senderJid] === undefined) db.wallets[senderJid] = 10;
    const sucesso = Math.random() > 0.4;
    if (sucesso) {
      const premio = Math.floor(Math.random() * 150) + 50;
      db.wallets[senderJid] += premio;
      saveDatabase(db);
      await sock.sendMessage(from, { text: `🦹‍♂️ Crime bem-sucedido! Você faturou *R$ ${premio.toFixed(2)}*.` }, { quoted: msg });
    } else {
      const multa = Math.floor(Math.random() * 50) + 10;
      db.wallets[senderJid] = Math.max(0, db.wallets[senderJid] - multa);
      saveDatabase(db);
      await sock.sendMessage(from, { text: `🚨 A polícia pegou você! Multa de *R$ ${multa.toFixed(2)}*.` }, { quoted: msg });
    }
  }
};
