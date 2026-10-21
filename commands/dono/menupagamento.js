module.exports = {
  name: '/menupagamento',
  category: 'dono',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mPagamento = `💳 *CATEGORIA DE PAGAMENTOS & PURIN CASH — LUNAR SYSTEM* ⚜️\n\n` +
      `🔹 *API Purin Cash (Montanha Dev):* \`ps_live_cd567d...\` (Automática)\n\n` +
      `› \`/gerarpagamento <valor>\` - Gera um Pix de cobrança\n` +
      `› \`/saldo\` - Saldo real disponível para saque\n` +
      `› \`/sacar <chave_pix>\` - Realiza saque total\n` +
      `› \`/pagar <chave> <valor>\` - Envia pagamento PIX\n` +
      `› \`/criaraluguel\` - Cria novos planos com taxa automática na Purin`;
    await sock.sendMessage(from, { text: mPagamento }, { quoted: msg });
  }
};
