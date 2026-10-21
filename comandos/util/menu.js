module.exports = {
  name: 'menu',
  aliases: ['help'],
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, config) {
    const menuLayout = `╔═══════════════════════════╗\n` +
                       `║  ⚜️ *${config.botName}* ⚜️\n` +
                       `╚═══════════════════════════╝\n\n` +
                       `📅 *Empresa:* ${config.companyName}\n` +
                       `👑 *Criador:* ${config.ownerName}\n` +
                       `prefixo atual: \`${config.prefix}\`\n\n` +
                       `📂 *MENU PRINCIPAL:* \n` +
                       `› \`${config.prefix}menu\` - Exibe este menu estilo Nazuna\n` +
                       `› \`${config.prefix}lid\` - Mostra seu ID LID para configuração\n` +
                       `› \`${config.prefix}ping\` - Verifica a latência do bot\n` +
                       `› \`${config.prefix}gerarpagamento <valor>\` - Gera Pix com taxa dinâmica\n\n` +
                       `✨ *Lunar System © - Todos os direitos reservados.*`;
    await sock.sendMessage(from, { text: menuLayout }, { quoted: msg });
  }
};
