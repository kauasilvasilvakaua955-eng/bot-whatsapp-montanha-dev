module.exports = {
  name: '/xp',
  category: 'xp',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const cmd = require('./nivel');
    await cmd.execute(sock, msg, from, args, senderJid, userNumber, db, config);
  }
};
