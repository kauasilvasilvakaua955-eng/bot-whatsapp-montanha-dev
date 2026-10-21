const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/welcome',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/welcome on\` ou \`/welcome off\`` }, { quoted: msg });
      return;
    }
    db.welcomeGroups = db.welcomeGroups || {};
    db.welcomeGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Mensagem de Boas-Vindas foi definida para: *${opt.toUpperCase()}*` }, { quoted: msg });
  }
};
