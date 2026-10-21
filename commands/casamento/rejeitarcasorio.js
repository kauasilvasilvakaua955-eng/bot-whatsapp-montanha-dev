const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/rejeitarcasorio',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.marryRegistry = db.marryRegistry || {};
    db.marryRegistry.proposals = db.marryRegistry.proposals || {};

    if (!db.marryRegistry.proposals[senderJid]) {
      await sock.sendMessage(from, { text: `⚠️ Você não tem nenhum pedido pendente.` }, { quoted: msg });
      return;
    }

    delete db.marryRegistry.proposals[senderJid];
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `💔 Pedido de casamento rejeitado com sucesso.` }, { quoted: msg });
  }
};
