const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/autoenviarhistorico',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/autoenviarhistorico on\` ou \`/autoenviarhistorico off\`` }, { quoted: msg });
      return;
    }
    db.autoHistoricoGroups = db.autoHistoricoGroups || {};
    db.autoHistoricoGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Auto-Enviar histórico/boas-vindas foi definido para: *${opt.toUpperCase()}*` }, { quoted: msg });
  }
};
