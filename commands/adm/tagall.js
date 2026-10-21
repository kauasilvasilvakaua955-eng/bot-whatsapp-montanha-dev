module.exports = {
  name: '/tagall',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants.map(p => p.id);
      let tagText = `📢 *MARCAÇÃO GERAL — LUNAR SYSTEM* ⚜️\n\n`;
      for (const p of participants) {
        tagText += `@${p.split('@')[0]} `;
      }
      await sock.sendMessage(from, { text: tagText, mentions: participants }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: `❌ Erro ao marcar todos os membros.` }, { quoted: msg });
    }
  }
};
