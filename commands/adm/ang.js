module.exports = {
  name: '/ang',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const broadcastText = args.join(' ');
    if (!broadcastText) {
      await sock.sendMessage(from, { text: "⚠️ Use: `/ang <mensagem de comunicado>`" }, { quoted: msg });
      return;
    }
    try {
      const chats = await sock.groupFetchAllParticipating();
      const groups = Object.keys(chats);
      for (const gId of groups) {
        await sock.sendMessage(gId, { text: `📢 *COMUNICADO GLOBAL — LUNAR SYSTEM* ⚜️\n\n${broadcastText}` });
      }
      await sock.sendMessage(from, { text: `✅ Comunicado enviado com sucesso para ${groups.length} grupos!` }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erro ao disparar comunicado: ${e.message}` }, { quoted: msg });
    }
  }
};
