module.exports = {
  name: '/dev',
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbEDNzxFCCoUo724eo45';
    const devText = `🤖 *INFORMATIONS & CREDITS — LUNAR SYSTEM ©* ⚜️\n\n` +
      `👑 *Desenvolvedor Chefe:* Montanha Dev\n` +
      `📱 *Contato Oficial:* +55 62 98252-0428\n` +
      `🛡️ *Empresa / Equipe:* Lunar System ©\n\n` +
      `📢 *Canal Oficial:*\n👉 ${CHANNEL_LINK}`;
    await sock.sendMessage(from, { text: devText }, { quoted: msg });
  }
};
