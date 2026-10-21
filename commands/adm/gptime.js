const fs = require('fs');
const path = require('path');

module.exports = {
  name: '/gptime',
  category: 'adm',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    const openTime = args[0];
    const closeTime = args[1];
    if (!openTime || !closeTime) {
      await sock.sendMessage(from, { text: "⚠️ Use: `/gptime <abre> <fecha>` (ex: `/gptime 07:00 22:00`)" }, { quoted: msg });
      return;
    }
    db.groupSchedulesTimes = db.groupSchedulesTimes || {};
    db.groupSchedulesTimes[from] = { openTime, closeTime };
    fs.writeFileSync(path.join(__dirname, '../../database.json'), JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `⏰ Horário automático agendado!\nAbre às ${openTime} e Fecha às ${closeTime}.` }, { quoted: msg });
  }
};
