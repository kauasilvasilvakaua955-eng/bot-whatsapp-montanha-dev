module.exports = {
  name: '/casal',
  category: 'casamento',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const cmd = require('./meucasamento');
    await cmd.execute(sock, msg, from, args, senderJid, userNumber, db, config);
  }
};
