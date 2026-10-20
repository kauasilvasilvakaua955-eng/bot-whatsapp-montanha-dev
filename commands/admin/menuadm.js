module.exports = {
  name: "menuadm",
  description: "Exibe os comandos de administração de grupo",
  category: "admin",
  async execute({ sock, from, msg, cfg, commands }) {
    let text = `🛡️ *${cfg.BOT_NAME} — MENU DE ADMINISTRAÇÃO* ⚜️\n\n`;
    const admCmds = Array.from(commands.values()).filter(c => c.category === "admin" && c.name !== "menuadm");
    admCmds.forEach(c => { text += `› \`/${c.name} on/off\` - ${c.description}\n`; });
    text += `\n✦ ${cfg.COMPANY_NAME} ✨`;
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};
