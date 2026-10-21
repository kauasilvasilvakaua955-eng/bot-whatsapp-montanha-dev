const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/saída',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/saída on\` ou \`/saída off\`` }, { quoted: msg });
      return;
    }
    db.saidaGroups = db.saidaGroups || {};
    db.saidaGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Mensagem de Saída foi definida para: *${opt.toUpperCase()}*` }, { quoted: msg });
  }
};
