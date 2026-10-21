const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/casar',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);

    if (!target || target === senderJid) {
      await sock.sendMessage(from, { text: `⚠️ Marque ou mencione alguém para pedir em casamento: \`/casar @usuário\`` }, { quoted: msg });
      return;
    }

    db.marryRegistry = db.marryRegistry || {};
    db.marryRegistry.proposals = db.marryRegistry.proposals || {};
    db.marryRegistry.couples = db.marryRegistry.couples || {};

    if (db.marryRegistry.couples[senderJid] || db.marryRegistry.couples[target]) {
      await sock.sendMessage(from, { text: `⚠️ Um de vocês já está casado(a)!` }, { quoted: msg });
      return;
    }

    db.marryRegistry.proposals[target] = senderJid;
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));

    await sock.sendMessage(from, { text: `💍 @${target.split('@')[0]}, você recebeu um pedido de casamento de @${userNumber}!\nResponda com \`/aceitarcasorio\` ou \`/rejeitarcasorio\`.`, mentions: [target, senderJid] }, { quoted: msg });
  }
};
