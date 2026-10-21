module.exports = {
  name: '/nivel',
  category: 'xp',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.userXp = db.userXp || {};
    const u = db.userXp[senderJid] || { xp: 0, level: 1 };
    const req = u.level * 150;
    await sock.sendMessage(from, { text: `⭐ *STATUS DE XP & NÍVEL — @${userNumber}*\n\n📈 Nível: *${u.level}*\n✨ XP Atual: *${u.xp} /${req}*`, mentions: [senderJid] }, { quoted: msg });
  }
};
