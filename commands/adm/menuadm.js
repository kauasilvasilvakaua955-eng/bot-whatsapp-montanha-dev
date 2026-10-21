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
      `› \`/antilink1 on/off\` - Apaga link e avisa\n` +
      `› \`/antilink2 on/off\` - Apaga link e bane\n` +
      `› \`/antilinkgeral on/off\` - Apaga e bane após 5 avisos\n` +
      `› \`/antispam on/off\` - Bloqueia spam\n` +
      `› \`/promover @\` / \`/rebaixar @\` - Cargos\n` +
      `› \`/gp a\` / \`/gp f\` - Abre/fecha grupo\n` +
      `› \`/autoaprovar on/off\` - Aprovação auto\n` +
      `› \`/autoenviarhistorico on/off\` - Histórico auto\n` +
      `› \`/welcome on/off\` / \`/saída on/off\` - Boas-vindas/saídas\n` +
      `› \`/linkgp\` - Link do grupo\n` +
      `› \`/mute @\` / \`/unmute @\` - Muta permanente\n` +
      `› \`/tmute @ 1h\` ou \`1d\` - Muta temporário\n` +
      `› \`/ban\` ou \`/kick\` - Bane usuário\n` +
      `› \`/listmuted\` - Lista mutados\n` +
      `› \`/anti<tipo> on/off\` - Mídia, áudio, foto, etc\n` +
      `› \`/antipalavra on/off\` / \`/addpalavrablock\` / \`/rmpalavrablock\` / \`/listpalavrasblock\`\n` +
      `› \`/limparchat\` - Limpa o chat\n` +
      `› \`/apagar\` ou \`/apg\` (reply) - Apaga mensagem`;
    await sock.sendMessage(from, { text: mAdm }, { quoted: msg });
  }
};
