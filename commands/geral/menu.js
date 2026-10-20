module.exports = {
  name: "menu",
  description: "Exibe o menu principal de comandos",
  category: "geral",
  async execute({ sock, from, msg, cfg, commands }) {
    let text = `🤖 *${cfg.BOT_NAME} — MENU PRINCIPAL* ⚜️\n\n`;
    const geralCmds = Array.from(commands.values()).filter(c => c.category === "geral");
    geralCmds.forEach(c => { text += `› \`/${c.name}\` - ${c.description}\n`; });
    text += `\n› \`/menuadm\` - Menu de Administração\n› \`/menudono\` - Painel do Dono\n\n✦ ${cfg.COMPANY_NAME} ✨`;
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};
