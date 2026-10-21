module.exports = {
  name: '/sistemacasamento',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/sistemacasamento on\` ou \`/sistemacasamento off\`` }, { quoted: msg });
      return;
    }
    db.systemCasamentoGroups = db.systemCasamentoGroups || {};
    db.systemCasamentoGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Sistema de Casamento foi definido para: *${opt.toUpperCase()}* (Default: OFF)` }, { quoted: msg });
  }
};
