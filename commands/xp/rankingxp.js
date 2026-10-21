module.exports = {
  name: '/rankingxp',
  category: 'xp',
  async execute(sock, msg, from, args, senderJid, userNumber, db, config) {
    db.userXp = db.userXp || {};
    const sorted = Object.entries(db.userXp).sort((a, b) => {
      if (b[1].level !== a[1].level) return b[1].level - a[1].level;
      return b[1].xp - a[1].xp;
    }).slice(0, 10);

    let rankText = `🏆 *RANKING GLOBAL DE XP & NÍVEIS — LUNAR SYSTEM* ⚜️\n\n`;
    if (sorted.length === 0) {
      rankText += `Nenhum usuário registrado no ranking ainda.`;
    } else {
      let pos = 1;
      for (const [j, data] of sorted) {
        const num = j.split('@')[0];
        rankText += `${pos}º @${num} — Nível *${data.level}* (${data.xp} XP)\n`;
        pos++;
      }
    }
    const mentions = sorted.map(item => item[0]);
    await sock.sendMessage(from, { text: rankText, mentions }, { quoted: msg });
  }
};
