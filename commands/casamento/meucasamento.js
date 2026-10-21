module.exports = {
  name: '/meucasamento',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.marryRegistry = db.marryRegistry || {};
    db.marryRegistry.couples = db.marryRegistry.couples || {};

    const partner = db.marryRegistry.couples[senderJid];
    if (!partner) {
      await sock.sendMessage(from, { text: `💍 Você (@${userNumber}) está solteiro(a) no momento.` }, { quoted: msg }, { mentions: [senderJid] });
      return;
    }

    await sock.sendMessage(from, { text: `💍 *STATUS DO RELACIONAMENTO* 💖\n\n@${userNumber} está casadíssimo(a) com @${partner.split('@')[0]}! ❤️`, mentions: [senderJid, partner] }, { quoted: msg });
  }
};
