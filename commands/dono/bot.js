const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/bot',
  category: 'dono',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const isOwner = db.ownerJid && (senderJid === db.ownerJid || senderJid.split('@')[0] === db.ownerJid.split('@')[0]);
    if (!isOwner) {
      await sock.sendMessage(from, { text: `⚠️ Apenas o Dono do Bot pode usar este comando.` }, { quoted: msg });
      return;
    }

    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/bot on\` ou \`/bot off\` (Default: ON)` }, { quoted: msg });
      return;
    }

    db.groupBotStatus = db.groupBotStatus || {};
    db.groupBotStatus[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));

    await sock.sendMessage(from, { text: `✅ Status do bot neste grupo foi definido para: *${opt.toUpperCase()}*` }, { quoted: msg });
  }
};
