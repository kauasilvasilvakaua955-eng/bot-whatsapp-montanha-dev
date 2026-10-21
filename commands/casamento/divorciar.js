const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/divorciar',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.marryRegistry = db.marryRegistry || {};
    db.marryRegistry.couples = db.marryRegistry.couples || {};

    const partner = db.marryRegistry.couples[senderJid];
    if (!partner) {
      await sock.sendMessage(from, { text: `⚠️ Você não está casado(a) com ninguém no momento.` }, { quoted: msg });
      return;
    }

    delete db.marryRegistry.couples[senderJid];
    delete db.marryRegistry.couples[partner];
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));

    await sock.sendMessage(from, { text: `📜 Divórcio concluído. @${userNumber} e @${partner.split('@')[0]} não estão mais casados.`, mentions: [senderJid, partner] }, { quoted: msg });
  }
};
