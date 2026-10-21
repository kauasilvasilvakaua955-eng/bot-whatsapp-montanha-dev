const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/rmparceria',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);

    if (!target) {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/rmparceria @usuario\`` }, { quoted: msg });
      return;
    }

    db.parceirosList = db.parceirosList || {};
    if (db.parceirosList[from] && db.parceirosList[from][target]) {
      delete db.parceirosList[from][target];
      fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
      await sock.sendMessage(from, { text: `✅ Parceria de @${target.split('@')[0]} removida com sucesso!`, mentions: [target] }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: `⚠️ Este usuário não está cadastrado como parceiro neste grupo.` }, { quoted: msg });
    }
  }
};
