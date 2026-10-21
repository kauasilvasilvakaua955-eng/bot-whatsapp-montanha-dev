module.exports = {
  name: '/menu',
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const menuText = `🤖 *MENU PRINCIPAL — LUNAR SYSTEM ©* ⚜️\n\n` +
      `› \`/menu\` - Exibe este menu\n` +
      `› \`/menujogos\` - Jogos e economia\n` +
      `› \`/banco\` - Sistema bancário completo\n` +
      `› \`/menuxp\` - XP e níveis\n` +
      `› \`/menucasamento\` - Casamento\n` +
      `› \`/menuparceria\` - Parcerias\n` +
      `› \`/menuadm\` - Moderação e ADM\n` +
      `› \`/menualuguel\` - Status de aluguel\n` +
      `› \`/aluguel\` - Tabela de planos e taxas (%)\n` +
      `› \`/menuvip\` - Menu VIP\n` +
      `› \`/menudono\` - Painel do dono\n` +
      `› \`/sugestao <txt>\` - Sugestões\n` +
      `› \`/ping\` - Latência\n` +
      `› \`/dev\` - Créditos`;
    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
  }
};
