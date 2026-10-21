module.exports = {
  name: '/menuvip',
  category: 'vip',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mVip = `💎 *MENU VIP — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/revelar\` (reply) - Revela mídia de visualização única\n` +
      `› \`/cfigurinha\` (reply) - Cria figurinha de foto, gif ou texto`;
    await sock.sendMessage(from, { text: mVip }, { quoted: msg });
  }
};
