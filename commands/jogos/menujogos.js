module.exports = {
  name: '/menujogos',
  category: 'jogos',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mJogos = `🎮 *MENU DE JOGOS E ECONOMIA — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/carteira\` ou \`/saldo\` - Mostra suas coins, picareta e arma\n` +
      `› \`/trabalhar\` ou \`/work\` - Trabalha por salário (24h)\n` +
      `› \`/minerar\` - Minera minérios raros\n` +
      `› \`/minérios\` - Inventário de minérios\n` +
      `› \`/venderminerios <minério> <quantia>\` - Vende minérios\n` +
      `› \`/daily\` - Bônus diário\n` +
      `› \`/slots <valor>\` - Jogo de caça-níqueis\n` +
      `› \`/velha @ <valor>\` - Jogo da velha PvP\n` +
      `› \`/dardos <valor>\` - Jogo de dardos\n` +
      `› \`/dados <valor>\` - Jogo de dados\n` +
      `› \`/roubar @\` - Tenta roubar coins de outro usuário`;
    await sock.sendMessage(from, { text: mJogos }, { quoted: msg });
  }
};
