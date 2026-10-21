module.exports = {
  name: '/sugestao',
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const sugText = args.join(' ');
    if (!sugText) {
      await sock.sendMessage(from, { text: "⚠️ Use: `/sugestao <sua sugestão para o bot>`" }, { quoted: msg });
      return;
    }
    db.suggestions = db.suggestions || {};
    db.suggestionCounter = (db.suggestionCounter || 0) + 1;
    const id = db.suggestionCounter;
    db.suggestions[id] = { user: senderJid, text: sugText, time: Date.now() };
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));

    if (db.ownerJid) {
      await sock.sendMessage(db.ownerJid, { text: `💡 *NOVA SUGESTÃO #${id} — LUNAR SYSTEM*\n👤 De: @${userNumber}\n💬 ${sugText}`, mentions: [senderJid] });
    }
    await sock.sendMessage(from, { text: `✅ Sugestão #${id} enviada com sucesso para o Montanha Dev!` }, { quoted: msg });
  }
};
