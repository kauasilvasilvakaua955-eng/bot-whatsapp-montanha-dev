module.exports = {
  name: "aluguelconfig",
  description: "Lista todos os planos de aluguel e suas taxas",
  category: "aluguel",
  async execute({ sock, from, msg, db }) {
    const plans = db.rentalPlans || {};
    let rep = "📋 *TABELA DE PLANOS DE ALUGUEL ATIVOS* 💼\n\n";
    for (const [key, p] of Object.entries(plans)) {
      rep += `🆔 ID: \`${key}\` | 🏷️ ${p.name}\n⏳ Duração: ${p.days === 9999 ? "Permanente" : p.days + " dias"}\n💵 R$ ${p.price.toFixed(2)} | 📊 Taxa: *${p.feePercent}%*\n──────────────────────────\n`;
    }
    await sock.sendMessage(from, { text: rep }, { quoted: msg });
  }
};
