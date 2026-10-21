module.exports = {
  name: '/limparchat',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    try {
      const invisibleBlock = "‏\n".repeat(40);
      for (let i = 0; i < 5; i++) {
        await sock.sendMessage(from, { text: invisibleBlock });
      }
      await sock.sendMessage(from, { text: `🧹 *CHAT LIMPO COM SUCESSO!* (Mensagens invisíveis enviadas pela administração)` }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erro ao limpar chat: ${e.message}` }, { quoted: msg });
    }
  }
};
