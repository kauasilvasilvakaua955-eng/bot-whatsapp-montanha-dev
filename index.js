const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const purincash = require('./services/purincash');

const DB_PATH = path.join(__dirname, 'database.json');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const KEY_PATH = path.join(__dirname, 'Key_fullacess.json');
const FIXED_OWNER_NUMBER = '5562982520428';

const ownerInteractiveSessions = new Map();
const pvpSessions = new Map();

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {
      BOT_NAME: "LUNAR BOT",
      OWNER_NAME: "MONTANHA DEV",
      OWNER_NUMBER: FIXED_OWNER_NUMBER,
      COMPANY_NAME: "LUNAR SYSTEM ©",
      GATEWAY_ACTIVE: "purincash",
      PURINCASH_API: "",
      PURINCASH_SECRET: "",
      MAGNUS_API: "",
      MAGNUS_SECRET: "",
      DAILY_BONUS: 50
    };
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

function loadKey() {
  try {
    return JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8')).secretKey || "mtn";
  } catch {
    return "mtn";
  }
}

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      ownerJid: null,
      ownerName: "MONTANHA DEV",
      ownerNumber: FIXED_OWNER_NUMBER,
      rentedGroups: {},
      blacklistedUsers: [],
      customCommands: {},
      groupSettings: {},
      partners: {},
      groupSchedules: {},
      mutedUsers: {},
      wallets: {},
      groupRequests: {},
      suggestions: {},
      userProfessions: {},
      userPickaxes: {},
      userOres: {},
      cooldowns: {},
      shopProducts: {},
      gameConfigs: { minSalary: 50, workCooldownHours: 24, robCooldownHours: 12, mineCooldownHours: 6 },
      diceWinStreak: {},
      suggestionCounter: 1,
      requestCounter: 1,
      autoAprovarGroups: {},
      autoHistoricoGroups: {},
      welcomeGroups: {},
      saidaGroups: {},
      antiLink1Groups: {},
      antiLink2Groups: {},
      antiLinkGeralGroups: {},
      antiSpamGroups: {},
      jogosGroups: {},
      parceriaGroups: {},
      parceirosList: {},
      antiPalavraGroups: {},
      blockedWords: [],
      antiTypes: {},
      inventarioMinerios: {},
      userXp: {},
      marryRegistry: {},
      rentalPlans: {
        "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 2.00, feePercent: 10 },
        "7_dias": { name: "7 Dias de Aluguel", days: 7, price: 10.00, feePercent: 10 },
        "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 30.00, feePercent: 30 },
        "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50 }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    data.ownerNumber = FIXED_OWNER_NUMBER;
    if (!data.rentedGroups) data.rentedGroups = {};
    if (!data.blacklistedUsers) data.blacklistedUsers = [];
    if (!data.customCommands) data.customCommands = {};
    if (!data.groupSettings) data.groupSettings = {};
    if (!data.partners) data.partners = {};
    if (!data.groupSchedules) data.groupSchedules = {};
    if (!data.mutedUsers) data.mutedUsers = {};
    if (!data.wallets) data.wallets = {};
    if (!data.groupRequests) data.groupRequests = {};
    if (!data.suggestions) data.suggestions = {};
    if (!data.userProfessions) data.userProfessions = {};
    if (!data.userPickaxes) data.userPickaxes = {};
    if (!data.userOres) data.userOres = {};
    if (!data.cooldowns) data.cooldowns = {};
    if (!data.shopProducts) data.shopProducts = {};
    if (!data.gameConfigs) data.gameConfigs = { minSalary: 50, workCooldownHours: 24, robCooldownHours: 12, mineCooldownHours: 6 };
    if (!data.diceWinStreak) data.diceWinStreak = {};
    if (!data.autoAprovarGroups) data.autoAprovarGroups = {};
    if (!data.autoHistoricoGroups) data.autoHistoricoGroups = {};
    if (!data.welcomeGroups) data.welcomeGroups = {};
    if (!data.saidaGroups) data.saidaGroups = {};
    if (!data.antiLink1Groups) data.antiLink1Groups = {};
    if (!data.antiLink2Groups) data.antiLink2Groups = {};
    if (!data.antiLinkGeralGroups) data.antiLinkGeralGroups = {};
    if (!data.antiSpamGroups) data.antiSpamGroups = {};
    if (!data.jogosGroups) data.jogosGroups = {};
    if (!data.parceriaGroups) data.parceriaGroups = {};
    if (!data.parceirosList) data.parceirosList = {};
    if (!data.antiPalavraGroups) data.antiPalavraGroups = {};
    if (!data.blockedWords) data.blockedWords = [];
    if (!data.antiTypes) data.antiTypes = {};
    if (!data.inventarioMinerios) data.inventarioMinerios = {};
    if (!data.userXp) data.userXp = {};
    if (!data.marryRegistry) data.marryRegistry = {};
    if (!data.rentalPlans) data.rentalPlans = {
      "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 2.00, feePercent: 10 },
      "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 30.00, feePercent: 30 },
      "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50 }
    };
    return data;
  } catch {
    return { ownerJid: null, ownerName: "MONTANHA DEV", ownerNumber: FIXED_OWNER_NUMBER, rentedGroups: {}, blacklistedUsers: [], customCommands: {}, groupSettings: {}, partners: {}, groupSchedules: {}, mutedUsers: {}, wallets: {}, groupRequests: {}, suggestions: {}, userProfessions: {}, userPickaxes: {}, userOres: {}, cooldowns: {}, shopProducts: {}, gameConfigs: { minSalary: 50, workCooldownHours: 24, robCooldownHours: 12, mineCooldownHours: 6 }, diceWinStreak: {}, suggestionCounter: 1, requestCounter: 1, autoAprovarGroups: {}, autoHistoricoGroups: {}, rentalPlans: {} };
  }
}

function saveDatabase(data) {
  data.ownerNumber = FIXED_OWNER_NUMBER;
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function safeSendMessage(sock, jid, content, options = {}) {
  try {
    return await sock.sendMessage(jid, content, options);
  } catch {
    return null;
  }
}

async function startBot() {
  const config = loadConfig();
  console.log(`\n========================================`);
  console.log(`🤖 INICIALIZANDO ${config.BOT_NAME} - ${config.COMPANY_NAME}`);
  console.log(`========================================\n`);

  let defaultNum = config.OWNER_NUMBER;
  const hasSession = fs.existsSync('./session') && fs.readdirSync('./session').length > 0;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const questionAsync = (query) => new Promise((resolve) => rl.question(query, resolve));

  if (!hasSession) {
    const inputNum = await questionAsync(`📱 Digite o número do WhatsApp para conexão (ex: 5562982520428): `);
    if (inputNum && inputNum.trim().length > 8) {
      defaultNum = inputNum.trim().replace(/\D/g, '');
      config.OWNER_NUMBER = defaultNum;
      saveConfig(config);
    }
  }
  rl.close();

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();
  let db = loadDatabase();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '121.0.6167.159'],
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false
  });

  if (!sock.authState.creds.registered && defaultNum) {
    setTimeout(async () => {
      try {
        console.log('⏳ Solicitando código de pareamento de 8 dígitos...');
        const pairingCode = await sock.requestPairingCode(defaultNum);
        console.log('\n========================================');
        console.log(`🔑 CÓDIGO DE PAREAMENTO: ${pairingCode}`);
        console.log('========================================\n');
      } catch (err) {
        console.error('❌ Erro ao solicitar código:', err.message);
      }
    }, 4000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`⚠️ Conexão fechada (Código: ${statusCode}).`);
      if (statusCode === 515 || statusCode === 428 || statusCode === DisconnectReason.connectionRestart) {
        console.log('🔄 Reiniciando conexão para concluir o pareamento...');
        setTimeout(() => startBot(), 3000);
      } else {
        console.log('Encerrando execução.');
      }
    } else if (connection === 'open') {
      console.log(`\n✅ ${config.BOT_NAME} CONECTADO COM SUCESSO!\n`);
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      db = loadDatabase();
      if (action === 'add') {
        if (db.autoAprovarGroups && db.autoAprovarGroups[id]) {
          try { await sock.groupRequestParticipantsUpdate(id, participants, 'approve'); } catch {}
        }
        if (db.autoHistoricoGroups && db.autoHistoricoGroups[id] || db.welcomeGroups && db.welcomeGroups[id]) {
          for (const p of participants) {
            await safeSendMessage(sock, id, { text: `👋 Olá @${p.split('@')[0]}! Seja muito bem-vindo(a) ao grupo! Confira as regras e aproveite os recursos da Lunar System © 🚀`, mentions: [p] });
          }
        }
      } else if (action === 'remove') {
        if (db.saidaGroups && db.saidaGroups[id]) {
          for (const p of participants) {
            await safeSendMessage(sock, id, { text: `👋 O membro @${p.split('@')[0]} deixou o grupo. Até mais!`, mentions: [p] });
          }
        }
      }
    } catch {}
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const userNumber = senderJid.split('@')[0].split(':')[0];
      const cfg = loadConfig();
      db = loadDatabase();

      if (db.blacklistedUsers.includes(senderJid) || db.blacklistedUsers.includes(userNumber)) continue;

      // Sistema de XP por atividade em mensagens
      db.userXp = db.userXp || {};
      db.userXp[senderJid] = db.userXp[senderJid] || { xp: 0, level: 1 };
      const xpGain = Math.floor(Math.random() * 15) + 10;
      db.userXp[senderJid].xp += xpGain;
      const nextLevelXp = db.userXp[senderJid].level * 150;
      if (db.userXp[senderJid].xp >= nextLevelXp) {
        db.userXp[senderJid].level += 1;
        db.userXp[senderJid].xp = 0;
        await safeSendMessage(sock, from, { text: `🎉 Parabéns @${userNumber}! Você subiu para o *Nível ${db.userXp[senderJid].level}* na Lunar System ©! 🚀`, mentions: [senderJid] });
      }
      saveDatabase(db);

      // Verificação de Mutes ativos
      if (db.mutedUsers && db.mutedUsers[from] && db.mutedUsers[from][senderJid]) {
        const muteInfo = db.mutedUsers[from][senderJid];
        if (muteInfo.expiresAt && Date.now() > muteInfo.expiresAt) {
          delete db.mutedUsers[from][senderJid];
          saveDatabase(db);
        } else {
          try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
          continue;
        }
      }

      const text = msg.message.conversation ||
                   msg.message.extendedTextMessage?.text ||
                   msg.message.imageMessage?.caption ||
                   '';

      const trimmedText = text.trim();
      const isOwner = db.ownerJid && (
        senderJid === db.ownerJid ||
        senderJid.split('@')[0] === db.ownerJid.split('@')[0]
      );

      // Sessões interativas
      if (ownerInteractiveSessions.has(senderJid)) {
        if (trimmedText.toLowerCase().startsWith('/setowner')) continue;
        const session = ownerInteractiveSessions.get(senderJid);
        if (session.step === 'SETOWNER_KEY') {
          ownerInteractiveSessions.delete(senderJid);
          if (db.ownerJid) {
            await safeSendMessage(sock, from, { text: `⚠️ *DONO JÁ CADASTRADO!*` }, { quoted: msg });
            continue;
          }
          if (trimmedText === loadKey()) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await safeSendMessage(sock, from, { text: `⚜️ *CADASTRADO COM SUCESSO!* 👑` }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { text: `🚫 *CHAVE INCORRETA!*` }, { quoted: msg });
          }
          continue;
        }
      }

      if (!trimmedText.startsWith('/')) continue;

      const command = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // --- SISTEMA DE XP E NÍVEIS ---
      if (command === '/menuxp' || command === '/menunivel') {
        const mXp = `⭐ *MENU DE XP & NÍVEIS — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/nivel\` ou \`/xp\` - Vê seu nível atual e progresso\n` +
          `› \`/rankingxp\` - Ranking global de membros mais ativos`;
        await safeSendMessage(sock, from, { text: mXp }, { quoted: msg });
        continue;
      }

      if (command === '/nivel' || command === '/xp') {
        db.userXp = db.userXp || {};
        const u = db.userXp[senderJid] || { xp: 0, level: 1 };
        const req = u.level * 150;
        await safeSendMessage(sock, from, { text: `⭐ *STATUS DE XP & NÍVEL — @${userNumber}*\n\n📈 Nível: *${u.level}*\n✨ XP Atual: *${u.xp} / ${req}*`, mentions: [senderJid] }, { quoted: msg });
        continue;
      }

      if (command === '/rankingxp' || command === '/topxp') {
        db.userXp = db.userXp || {};
        const sorted = Object.entries(db.userXp).sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp).slice(0, 10);
        let rep = `🏆 *RANKING DE XP & NÍVEIS — LUNAR SYSTEM* ⚜️\n\n`;
        if (sorted.length === 0) {
          rep += `Nenhum registro de XP no momento.`;
        } else {
          sorted.forEach(([jid, data], idx) => {
            rep += `${idx + 1}. \`${jid.split('@')[0]}\` — Nível *${data.level}* (XP: ${data.xp})\n`;
          });
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      // --- SISTEMA DE CASAMENTO ---
      if (command === '/menucasamento' || command === '/menucasar') {
        const mCasamento = `💍 *MENU DE CASAMENTO — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/casar @\` - Pede alguém em casamento\n` +
          `› \`/aceitarcasorio\` - Aceita o pedido de casamento\n` +
          `› \`/rejeitarcasorio\` - Rejeita o pedido\n` +
          `› \`/divorciar\` - Divorcia do cônjuge atual\n` +
          `› \`/casal\` ou \`/meucasamento\` - Vê status do seu relacionamento`;
        await safeSendMessage(sock, from, { text: mCasamento }, { quoted: msg });
        continue;
      }

      if (command === '/casar') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque alguém para pedir em casamento. Ex: `/casar @usuario`" }, { quoted: msg });
          continue;
        }
        if (target === senderJid) {
          await safeSendMessage(sock, from, { text: "⚠️ Você não pode se casar consigo mesmo!" }, { quoted: msg });
          continue;
        }
        db.marryRegistry = db.marryRegistry || {};
        if (db.marryRegistry[senderJid]) {
          await safeSendMessage(sock, from, { text: "⚠️ Você já é casado(a)!" }, { quoted: msg });
          continue;
        }
        if (db.marryRegistry[target]) {
          await safeSendMessage(sock, from, { text: "⚠️ Esta pessoa já está casada!" }, { quoted: msg });
        }

        pvpSessions.set(target, { suplicante: senderJid, type: 'casamento' });
        await safeSendMessage(sock, from, { text: `💍 @${target.split('@')[0]}, você recebeu um pedido de casamento de @${userNumber}!\nResponda com \`/aceitarcasorio\` ou \`/rejeitarcasorio\`.`, mentions: [target, senderJid] }, { quoted: msg });
        continue;
      }

      if (command === '/aceitarcasorio') {
        let suplicanteJid = null;
        for (const [k, s] of pvpSessions.entries()) {
          if (k === senderJid && s.type === 'casamento') {
            suplicanteJid = s.suplicante;
            break;
          }
        }
        if (!suplicanteJid) {
          await safeSendMessage(sock, from, { text: "⚠️ Nenhum pedido de casamento pendente para você." }, { quoted: msg });
          continue;
        }
        pvpSessions.delete(senderJid);
        db.marryRegistry = db.marryRegistry || {};
        db.marryRegistry[senderJid] = suplicanteJid;
        db.marryRegistry[suplicanteJid] = senderJid;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🎉 *LUA DE MEL NA LUNAR SYSTEM!* 💍\n@${suplicanteJid.split('@')[0]} e @${userNumber} agora estão oficialmente casados! ❤️`, mentions: [suplicanteJid, senderJid] }, { quoted: msg });
        continue;
      }

      if (command === '/rejeitarcasorio') {
        pvpSessions.delete(senderJid);
        await safeSendMessage(sock, from, { text: `💔 Pedido de casamento rejeitado com sucesso.` }, { quoted: msg });
        continue;
      }

      if (command === '/divorciar') {
        db.marryRegistry = db.marryRegistry || {};
        const partner = db.marryRegistry[senderJid];
        if (!partner) {
          await safeSendMessage(sock, from, { text: "⚠️ Você não é casado(a)!" }, { quoted: msg });
          continue;
        }
        delete db.marryRegistry[senderJid];
        delete db.marryRegistry[partner];
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `📄 Divórcio concluído. Cada um para o seu lado!` }, { quoted: msg });
        continue;
      }

      if (command === '/casal' || command === '/meucasamento') {
        db.marryRegistry = db.marryRegistry || {};
        const partner = db.marryRegistry[senderJid];
        if (!partner) {
          await safeSendMessage(sock, from, { text: "💔 Você está solteiro(a). Use `/casar @usuario` para encontrar alguém!" }, { quoted: msg });
          continue;
        }
        await safeSendMessage(sock, from, { text: `💍 Você está casado(a) com @${partner.split('@')[0]} ❤️`, mentions: [partner] }, { quoted: msg });
        continue;
      }

      // --- COMANDOS ANTERIORES E MENUS ---
      if (command === '/setowner') {
        if (db.ownerJid) {
          await safeSendMessage(sock, from, { text: `⚠️ *BLOQUEADO!*` }, { quoted: msg });
          continue;
        }
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        await safeSendMessage(sock, from, { text: `⚜️ *REGISTRO DE DONO SUPREMO* 👑\n\n💬 Envie a Key secreta:` }, { quoted: msg });
        continue;
      }

      if (command === '/menu') {
        const menuText = `🤖 *MENU PRINCIPAL — LUNAR SYSTEM ©* ⚜️\n\n` +
          `› \`/menu\` - Exibe este menu\n` +
          `› \`/menujogos\` - Jogos e economia\n` +
          `› \`/menuxp\` - Menu de XP e níveis\n` +
          `› \`/menucasamento\` - Menu de casamento\n` +
          `› \`/menuparceria\` - Parcerias de links\n` +
          `› \`/menuadm\` - Moderação e ADM\n` +
          `› \`/menualuguel\` - Aluguel de grupos\n` +
          `› \`/menuvip\` - Menu VIP\n` +
          `› \`/menudono\` - Painel do dono\n` +
          `› \`/sugestao <txt>\` - Sugestões\n` +
          `› \`/ping\` - Latência\n` +
          `› \`/dev\` - Créditos`;
        await safeSendMessage(sock, from, { text: menuText }, { quoted: msg });
        continue;
      }

      if (command === '/ping') {
        const start = Date.now();
        await safeSendMessage(sock, from, { text: `🏓 Pong! Latência: ${Date.now() - start}ms | Lunar System 100% Operacional.` }, { quoted: msg });
        continue;
      }

      if (command === '/dev') {
        const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbEDNzxFCCoUo724eo45';
        const devText = `🤖 *INFORMATIONS & CREDITS — LUNAR SYSTEM ©* ⚜️\n\n` +
          `👑 *Desenvolvedor Chefe:* Montanha Dev\n` +
          `📱 *Contato Oficial:* +55 62 98252-0428\n` +
          `🛡️ *Empresa / Equipe:* Lunar System ©\n\n` +
          `📢 *Canal Oficial:*\n👉 ${CHANNEL_LINK}`;
        await safeSendMessage(sock, from, { text: devText }, { quoted: msg });
        continue;
      }

    }
  });
}

startBot();
