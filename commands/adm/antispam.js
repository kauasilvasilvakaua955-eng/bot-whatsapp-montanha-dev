const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/antispam',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/antispam on\` ou \`/antispam off\`` }, { quoted: msg });
      return;
    }
    db.antiSpamGroups = db.antiSpamGroups || {};
    db.antiSpamGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Anti-Spam foi definido para: *${opt.toUpperCase()}*` }, { quoted: msg });
  }
};
