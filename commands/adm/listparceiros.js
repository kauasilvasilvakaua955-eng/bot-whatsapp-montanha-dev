module.exports = {
  name: '/listparceiros',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.parceirosList = db.parceirosList || {};
    const groupPartners = db.parceirosList[from] || {};
    let text = `🤝 *LISTA DE PARCEIROS DO GRUPO — LUNAR SYSTEM* ⚜️\n\n`;
    const entries = Object.entries(groupPartners);

    if (entries.length === 0) {
      text += `Nenhum parceiro cadastrado neste grupo.`;
    } else {
      let i = 1;
      const mentions = [];
      for (const [pJid, data] of entries) {
        mentions.push(pJid);
        text += `${i}º @${pJid.split('@')[0]} — Limite: ${data.limit} \vert{} Usados hoje:${data.usedToday}\n`;
        i++;
      }
      await sock.sendMessage(from, { text, mentions }, { quoted: msg });
      return;
    }
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};
