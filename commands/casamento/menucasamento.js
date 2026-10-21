module.exports = {
  name: '/menucasamento',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mCasamento = `💍 *MENU DE CASAMENTO — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/casar @\` - Pede alguém em casamento\n` +
      `› \`/aceitarcasorio\` - Aceita o pedido de casamento\n` +
      `› \`/rejeitarcasorio\` - Rejeita o pedido\n` +
      `› \`/divorciar\` - Divorcia do cônjuge atual\n` +
      `› \`/casal\` ou \`/meucasamento\` - Vê status do seu relacionamento`;
    await sock.sendMessage(from, { text: mCasamento }, { quoted: msg });
  }
};
