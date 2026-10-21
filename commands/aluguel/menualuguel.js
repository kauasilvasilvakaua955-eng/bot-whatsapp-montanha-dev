module.exports = {
  name: '/menualuguel',
  category: 'aluguel',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.rentedGroups = db.rentedGroups || {};
    const rent = db.rentedGroups[from];
    if (!rent) {
      await sock.sendMessage(from, { text: `⚠️ Este grupo não possui aluguel ativo. Use \`/aluguel\` para ver a tabela de planos.` }, { quoted: msg });
      return;
    }
    const timeLeft = Math.max(0, Math.ceil((rent.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
    try {
      const metadata = await sock.groupMetadata(from);
      const code = await sock.groupInviteCode(from);
      const info = `📊 *STATUS DO ALUGUEL DO GRUPO* 💼\n\n` +
        `🏷️ *Nome:* ${metadata.subject}\n` +
        `👥 *Membros:* ${metadata.participants.length}\n` +
        `⏳ *Tempo Restante:* ${timeLeft} dias\n` +
        `🟢 *Status:* ${rent.active && timeLeft > 0 ? 'Ativo' : 'Expirado'}\n` +
        `🔗 *Link:* https://chat.whatsapp.com/${code}`;
      await sock.sendMessage(from, { text: info }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: `❌ Erro ao carregar dados do grupo.` }, { quoted: msg });
    }
  }
};
