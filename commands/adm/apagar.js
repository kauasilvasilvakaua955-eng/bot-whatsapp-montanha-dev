module.exports = {
  name: '/apagar',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo;
      if (!quoted || !quoted.stanzaId) {
        await sock.sendMessage(from, { text: `⚠️ Responda (reply) a mensagem que deseja apagar com \`/apagar\` ou \`/apg\`.` }, { quoted: msg });
        return;
      }
      const targetKey = {
        remoteJid: from,
        fromMe: quoted.participant === sock.user?.id,
        id: quoted.stanzaId,
        participant: quoted.participant
      };
      await sock.sendMessage(from, { delete: targetKey });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erro ao apagar mensagem: ${e.message}` }, { quoted: msg });
    }
  }
};
