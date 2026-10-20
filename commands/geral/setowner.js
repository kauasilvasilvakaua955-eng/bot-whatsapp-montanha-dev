module.exports = {
  name: "setowner",
  description: "Registra o Dono Supremo usando a chave de acesso",
  category: "geral",
  async execute({ sock, from, senderJid, msg, ownerInteractiveSessions }) {
    ownerInteractiveSessions.set(senderJid, { step: "SETOWNER_KEY" });
    await sock.sendMessage(from, { text: "⚜️ *REGISTRO DE DONO SUPREMO* 👑\n\n💬 Envie a Key secreta neste chat:" }, { quoted: msg });
  }
};
