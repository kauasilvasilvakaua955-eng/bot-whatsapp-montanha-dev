module.exports = {
  name: '/menuparceria',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mParceria = `🤝 *MENU DE PARCERIAS — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/modoparceria on/off\` - Ativa/Desativa o modo parceria no grupo (Default: OFF)\n` +
      `› \`/addparceria @ <quantidade>\` - Adiciona um parceiro e define limite diário de links\n` +
      `› \`/rmparceria @\` - Remove um parceiro cadastrado\n` +
      `› \`/listparceiros\` - Lista todos os parceiros ativos e cotas do dia`;
    await sock.sendMessage(from, { text: mParceria }, { quoted: msg });
  }
};
