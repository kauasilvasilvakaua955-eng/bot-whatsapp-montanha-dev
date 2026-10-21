const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/addparceria',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
    const limit = parseInt(args[1]) || 5;

    if (!target) {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/addparceria @usuario <quantidade_diaria>\`` }, { quoted: msg });
      return;
    }

    db.parceirosList = db.parceirosList || {};
    db.parceirosList[from] = db.parceirosList[from] || {};
    db.parceirosList[from][target] = {
      limit: limit,
      usedToday: 0,
      violations: 0,
      active: true
    };
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));

    await sock.sendMessage(from, { text: `✅ Usuário @${target.split('@')[0]} adicionado como parceiro com limite de *${limit}* links por dia!`, mentions: [target] }, { quoted: msg });
  }
};
