module.exports = {
  name: '/menudono',
  category: 'dono',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const mDono = `👑 *PAINEL EXCLUSIVO DO DONO — LUNAR SYSTEM* ⚜️\n\n` +
      `› \`/setowner\` - Registro supremo\n` +
      `› \`/menupagamento\` - Categoria de pagamentos, saques Pix e Purin Cash automática\n` +
      `› \`/criaraluguel\` - Criar planos com taxa direta na Purin\n` +
      `› \`/editbotname\` - Altera nome do bot\n` +
      `› \`/editdaily\` - Altera bônus diário\n` +
      `› \`/editbankinterest\` - Altera juros do banco\n` +
      `› \`/editapipagamentos\` / \`/editsecretpagamentos\` - Gateways\n` +
      `› \`/addnewcmd\` - Criar comando custom\n` +
      `› \`/addaluguel\` / \`/rmaluguel\` / \`/listalugueis\``;
    await sock.sendMessage(from, { text: mDono }, { quoted: msg });
  }
};
