module.exports = {
  name: '/sistemabanco',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const opt = args[0] ? args[0].toLowerCase() : '';
    if (opt !== 'on' && opt !== 'off') {
      await sock.sendMessage(from, { text: `⚠️ Use: \`/sistemabanco on\` ou \`/sistemabanco off\`` }, { quoted: msg });
      return;
    }
    db.systemBancoGroups = db.systemBancoGroups || {};
    db.systemBancoGroups[from] = (opt === 'on');
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Sistema de Banco foi definido para: *${opt.toUpperCase()}* (Default: OFF)` }, { quoted: msg });
  }
};
