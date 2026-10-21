const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/aceitarcasorio',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.marryRegistry = db.marryRegistry || {};
    db.marryRegistry.proposals = db.marryRegistry.proposals || {};
    db.marryRegistry.couples = db.marryRegistry.couples || {};

    const proposer = db.marryRegistry.proposals[senderJid];
    if (!proposer) {
      await sock.sendMessage(from, { text: `⚠️ Você não tem nenhum pedido de casamento pendente.` }, { quoted: msg });
      return;
    }

    db.marryRegistry.couples[senderJid] = proposer;
    db.marryRegistry.couples[proposer] = senderJid;
    delete db.marryRegistry.proposals[senderJid];
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));

    await sock.sendMessage(from, { text: `🎉💍 *CASAMENTO REALIZADO COM SUCESSO!* 💖\nParabéns aos novos pombinhos @${senderJid.split('@')[0]} e @${proposer.split('@')[0]}!`, mentions: [senderJid, proposer] }, { quoted: msg });
  }
};
