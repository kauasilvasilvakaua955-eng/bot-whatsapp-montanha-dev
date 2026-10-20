module.exports = {
  name: "menudono",
  description: "Exibe o painel do dono e comandos de gestão",
  category: "dono",
  async execute({ sock, from, isOwner, msg, cfg, commands }) {
    if (!isOwner) return sock.sendMessage(from, { text: "❌ Comando restrito ao Dono Supremo!" }, { quoted: msg });
    let text = `🤖 *${cfg.BOT_NAME} — PAINEL DO DONO* 👑\n\n`;
    text += `💼 💰 GESTÃO DE ALUGUEL & TAXAS\n`;
    const aluguelCmds = Array.from(commands.values()).filter(c => c.category === "aluguel");
    aluguelCmds.forEach(c => { text += `› \`/${c.name}\` - ${c.description}\n`; });
    text += `\n✦ ${cfg.COMPANY_NAME} ✨`;
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};
