module.exports = {
  name: 'lid',
  aliases: ['myid'],
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, config) {
    await sock.sendMessage(from, { text: `🆔 *Seu identificador (LID / JID):* \`${senderJid}\`\nCopie este código e cole no arquivo \`dados/src/config.json\` no campo \`lidOwner\` se desejar autenticar privilégios absolutos.` }, { quoted: msg });
  }
};
