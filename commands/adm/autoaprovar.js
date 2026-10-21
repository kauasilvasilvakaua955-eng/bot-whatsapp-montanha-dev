const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/autoaprovar',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/autoaprovar on\` ou \`/autoaprovar off\`` }, { quoted: msg });
      return;
    }
    db.autoAprovarGroups = db.autoAprovarGroups || {};
    db.autoAprovarGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Auto-Aprovar participantes foi definido para: *${opt.toUpperCase()}*` }, { quoted: msg });
  }
};
