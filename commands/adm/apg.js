module.exports = {
  name: '/apg',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const cmd = require('./apagar');
    await cmd.execute(sock, msg, from, args, senderJid, userNumber, db, config);
  }
};
