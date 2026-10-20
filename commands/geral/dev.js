module.exports = {
  name: "dev",
  description: "Exibe informações e créditos do desenvolvedor",
  category: "geral",
  async execute({ sock, from, msg }) {
    const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbEDNzxFCCoUo724eo45";
    const devText = `🤖 *INFORMATIONS & CREDITS — LUNAR SYSTEM ©* ⚜️\n\n` +
      `👑 *Desenvolvedor Chefe:* Montanha Dev\n` +
      `📱 *Contato Oficial:* +55 62 98252-0428\n` +
      `🛡️ *Empresa / Equipe:* Lunar System ©\n\n` +
      `📢 *Canal Oficial de Atualizações:*\n` +
      `👉 ${CHANNEL_LINK}\n\n` +
      `✨ *Lunar System — Automação Profissional* 🚀`;
    await sock.sendMessage(from, { text: devText }, { quoted: msg });
  }
};
