module.exports = {
  name: 'ping',
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, config) {
    const start = Date.now();
    const sent = await sock.sendMessage(from, { text: `🏓 Pong! Calculando latência...` }, { quoted: msg });
    const latency = Date.now() - start;
    await sock.sendMessage(from, { text: `🏓 *Pong!* Resposta em \`${latency}ms\`` }, { quoted: sent });
  }
};
