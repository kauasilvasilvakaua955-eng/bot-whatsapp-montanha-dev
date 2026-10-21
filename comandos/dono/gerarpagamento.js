const purincash = require('../../services/purincash');

module.exports = {
  name: 'gerarpagamento',
  category: 'dono',
  async execute(sock, msg, from, args, senderJid, userNumber, config) {
    const val = parseFloat(args[0]?.replace(',', '.')) || 2.00;
    const res = await purincash.gerarPix(val);
    let txt = `💳 *PIX GATEWAY — LUNAR SYSTEM*\n\n`;
    txt += `💵 Valor Base: R$ ${res.valorBase.toFixed(2)}\n`;
    txt += `📊 Regra Aplicada: ${res.descricaoTaxa}\n`;
    txt += `💰 Taxa Total: R$ ${res.valorTaxa.toFixed(2)}\n`;
    txt += `✅ Valor Total Cobrado: R$ ${res.valorTotal.toFixed(2)}\n\n`;
    txt += `Copia e Cola:\n\`${res.copiaEcola}\``;
    await sock.sendMessage(from, { text: txt }, { quoted: msg });
  }
};
