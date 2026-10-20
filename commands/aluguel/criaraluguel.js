module.exports = {
  name: "criaraluguel",
  description: "Cria um novo plano de aluguel personalizado",
  category: "aluguel",
  async execute({ sock, from, senderJid, isOwner, msg, ownerInteractiveSessions }) {
    if (!isOwner) return sock.sendMessage(from, { text: "❌ Comando exclusivo do Dono Supremo!" }, { quoted: msg });
    ownerInteractiveSessions.set(senderJid, { step: "CREATE_PLAN_ID" });
    await sock.sendMessage(from, { text: "🛠️ *CRIADOR DE PLANO DE ALUGUEL* 💼\n\nDigite o **ID único** do plano (ex: `anual`, sem espaços):" }, { quoted: msg });
  }
};
