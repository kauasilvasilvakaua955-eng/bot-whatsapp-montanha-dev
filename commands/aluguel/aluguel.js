module.exports = {
  name: '/aluguel',
  category: 'aluguel',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const plans = db.rentalPlans || {};
    let rep = `📋 *TABELA OFICIAL DE PLANOS DE ALUGUEL* 💼\n\n`;
    for (const [key, p] of Object.entries(plans)) {
      rep += `🆔 \`${key}\` | 🏷️ ${p.name} | 💵 R$ ${p.price.toFixed(2)} | 📊 Taxa Purin Cash: *${p.feePercent}%*\n`;
    }
    rep += `\n💡 Para assinar, use \`/alugar <id_do_plano>\``;
    await sock.sendMessage(from, { text: rep }, { quoted: msg });
  }
};
