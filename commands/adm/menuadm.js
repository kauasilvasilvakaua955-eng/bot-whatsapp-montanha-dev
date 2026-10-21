module.exports = {
  name: '/menuadm',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mAdm = `🛡️ *MENU DE ADMINISTRAÇÃO — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/sistemaxp on/off\` - Sistema de XP e Níveis (Default: OFF)\n` +
      `› \`/sistemacasamento on/off\` - Sistema de Casamento (Default: OFF)\n` +
      `› \`/sistemabanco on/off\` - Sistema de Banco (Default: OFF)\n` +
      `› \`/ang <txt>\` - Comunicado global (broadcast)\n` +
      `› \`/gptime <abre> <fecha>\` - Agendador automático\n` +
      `› \`/tagall\` - Marca todos os membros\n` +
      `› \`/antilink1 on/off\` | \`/antilink2 on/off\` | \`/antilinkgeral on/off\`\n` +
      `› \`/promover @\` | \`/rebaixar @\` | \`/ban @\`\n` +
      `› \`/gp a\` | \`/gp f\` | \`/linkgp\`\n` +
      `› \`/mute @\` | \`/unmute @\` | \`/tmute @ 1h\` | \`/listmuted\`\n` +
      `› \`/autoaprovar on/off\` | \`/autoenviarhistorico on/off\``;
    await sock.sendMessage(from, { text: mAdm }, { quoted: msg });
  }
};
