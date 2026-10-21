module.exports = {
  name: '/ping',
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const start = Date.now();
    await sock.sendMessage(from, { text: `🏓 Pong! Latência: ${Date.now() - start}ms | Lunar System 100% Modular e Operacional.` }, { quoted: msg });
  }
};
