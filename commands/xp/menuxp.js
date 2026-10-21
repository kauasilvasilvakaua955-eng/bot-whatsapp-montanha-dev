module.exports = {
  name: '/menuxp',
  category: 'xp',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mXp = `⭐ *MENU DE XP & NÍVEIS — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/nivel\` ou \`/xp\` - Vê seu nível atual e progresso\n` +
      `› \`/rankingxp\` - Ranking global de membros mais ativos`;
    await sock.sendMessage(from, { text: mXp }, { quoted: msg });
  }
};
