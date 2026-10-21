const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/modoparceria',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/modoparceria on\` ou \`/modoparceria off\`` }, { quoted: msg });
      return;
    }
    db.parceriaGroups = db.parceriaGroups || {};
    db.parceriaGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Modo Parceria foi definido para: *${opt.toUpperCase()}* (Default: OFF)\nObs: Quando ativo, antilinks padrão são desativados e o sistema gerencia links e parceiros.` }, { quoted: msg });
  }
};
