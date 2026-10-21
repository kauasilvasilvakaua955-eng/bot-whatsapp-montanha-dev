const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/sistemaxp',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/sistemaxp on\` ou \`/sistemaxp off\`` }, { quoted: msg });
      return;
    }
    db.systemXpGroups = db.systemXpGroups || {};
    db.systemXpGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Sistema de XP e Níveis foi definido para: *${opt.toUpperCase()}* (Default: OFF)` }, { quoted: msg });
  }
};
