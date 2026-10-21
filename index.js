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
      DAILY_BONUS: 50,
      BANK_INTEREST_RATE: 0.05
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
      userWeapons: {},
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
      groupSchedulesTimes: {},
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
    if (!data.userWeapons) data.userWeapons = {};
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
    if (!data.groupSchedulesTimes) data.groupSchedulesTimes = {};
    if (!data.rentalPlans) data.rentalPlans = {
      "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 2.00, feePercent: 10 },
      "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 30.00, feePercent: 30 },
      "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50 }
    };
    return data;
  } catch {
    return { ownerJid: null, ownerName: "MONTANHA DEV", ownerNumber: FIXED_OWNER_NUMBER, rentedGroups: {}, blacklistedUsers: [], customCommands: {}, groupSettings: {}, partners: {}, groupSchedules: {}, mutedUsers: {}, wallets: {}, groupRequests: {}, suggestions: {}, userProfessions: {}, userPickaxes: {}, userOres: {}, userWeapons: {}, cooldowns: {}, shopProducts: {}, gameConfigs: { minSalary: 50, workCooldownHours: 24, robCooldownHours: 12, mineCooldownHours: 6 }, diceWinStreak: {}, suggestionCounter: 1, requestCounter: 1, autoAprovarGroups: {}, autoHistoricoGroups: {}, rentalPlans: {} };
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
  console.log(`🤖 INICIALIZANDO ${config.BOT_NAME} -${config.COMPANY_NAME}`);
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

      // 🛑 IGNORA 100% QUALQUER MENSAGEM NO PRIVADO (PV) - FUNCIONA APENAS EM GRUPOS (@g.us)
      if (!from.endsWith('@g.us')) continue;

      const senderJid = msg.key.participant || msg.key.remoteJid;
      const userNumber = senderJid.split('@')[0].split(':')[0];
      const cfg = loadConfig();
      db = loadDatabase();

      if (db.blacklistedUsers.includes(senderJid) || db.blacklistedUsers.includes(userNumber)) continue;

      // XP
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

      // Mutes
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

      // Verificações automáticas de Grupo (Anti-link, Parceria, Palavras Proibidas)
      const hasLink = /https?:\/\/|chat\.whatsapp\.com/i.test(trimmedText);
      const isParceriaActive = db.parceriaGroups && db.parceriaGroups[from];

      if (hasLink) {
        if (isParceriaActive) {
          const parceiroData = db.parceirosList && db.parceirosList[from] && db.parceirosList[from][senderJid];
          if (!parceiroData || parceiroData.quota <= 0) {
            try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
            await safeSendMessage(sock, from, { text: `⚠️ Envio de links proibido sem parceria autorizada neste grupo!`, quoted: msg });
            continue;
          } else {
            parceiroData.quota -= 1;
            saveDatabase(db);
          }
        } else {
          if (db.antiLink1Groups && db.antiLink1Groups[from]) {
            try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
            await safeSendMessage(sock, from, { text: `⚠️ Links não são permitidos neste grupo!`, quoted: msg });
            continue;
          } else if (db.antiLink2Groups && db.antiLink2Groups[from]) {
            try {
              await sock.sendMessage(from, { delete: msg.key });
              await sock.groupParticipantsUpdate(from, [senderJid], 'remove');
            } catch {}
            continue;
          } else if (db.antiLinkGeralGroups && db.antiLinkGeralGroups[from]) {
            db.groupRequests = db.groupRequests || {};
            db.groupRequests[from] = db.groupRequests[from] || {};
            db.groupRequests[from][senderJid] = (db.groupRequests[from][senderJid] || 0) + 1;
            saveDatabase(db);
            try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
            if (db.groupRequests[from][senderJid] >= 5) {
              try { await sock.groupParticipantsUpdate(from, [senderJid], 'remove'); } catch {}
              await safeSendMessage(sock, from, { text: `🚫 @${userNumber} foi banido por atingir 5 avisos de link/spam!`, mentions: [senderJid] });
            } else {
              await safeSendMessage(sock, from, { text: `⚠️ Aviso ${db.groupRequests[from][senderJid]}/5: Proibido enviar links!` });
            }
            continue;
          }
        }
      }

      // Anti-palavras
      if (db.antiPalavraGroups && db.antiPalavraGroups[from] && db.blockedWords && db.blockedWords.length > 0) {
        const lowerText = trimmedText.toLowerCase();
        const foundBlocked = db.blockedWords.some(w => lowerText.includes(w.toLowerCase()));
        if (foundBlocked) {
          try {
            await sock.sendMessage(from, { delete: msg.key });
            await safeSendMessage(sock, from, { text: `⚠️ Palavra proibida detectada e apagada!` }, { quoted: msg });
          } catch {}
          continue;
        }
      }

      // Comandos personalizados
      if (db.customCommands && db.customCommands[trimmedText.toLowerCase()]) {
        await safeSendMessage(sock, from, { text: db.customCommands[trimmedText.toLowerCase()] }, { quoted: msg });
        continue;
      }

      if (!trimmedText.startsWith('/')) continue;

      const command = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // --- EDIT COMANDOS DO DONO 100% INTERATIVO ---
      if (command.startsWith('/edit') && isOwner) {
        const editType = command.replace('/edit', '').toLowerCase();
        if (editType === 'botname') {
          config.BOT_NAME = args.join(' ');
          saveConfig(config);
          await safeSendMessage(sock, from, { text: `✅ Nome do bot alterado para: ${config.BOT_NAME}` }, { quoted: msg });
          continue;
        }
        if (editType === 'daily') {
          const val = parseFloat(args[0]);
          if (isNaN(val)) {
            await safeSendMessage(sock, from, { text: `⚠️ Use: \`/editdaily <valor>\`` }, { quoted: msg });
            continue;
          }
          config.DAILY_BONUS = val;
          saveConfig(config);
          await safeSendMessage(sock, from, { text: `✅ Bônus diário alterado para ¢ ${val}` }, { quoted: msg });
          continue;
        }
        if (editType === 'bankinterest') {
          const val = parseFloat(args[0]);
          if (isNaN(val)) {
            await safeSendMessage(sock, from, { text: `⚠️ Use: \`/editbankinterest <taxa ex: 0.05>\`` }, { quoted: msg });
            continue;
          }
          config.BANK_INTEREST_RATE = val;
          saveConfig(config);
          await safeSendMessage(sock, from, { text: `✅ Taxa de juros alterada para ${(val * 100)}%` }, { quoted: msg });
          continue;
        }
        if (editType === 'apipagamentos') {
          cfg.PURINCASH_API = args[0] || '';
          saveConfig(cfg);
          await safeSendMessage(sock, from, { text: `✅ API de Pagamentos atualizada!` }, { quoted: msg });
          continue;
        }
        if (editType === 'secretpagamentos') {
          cfg.PURINCASH_SECRET = args[0] || '';
          saveConfig(cfg);
          await safeSendMessage(sock, from, { text: `✅ Secret de Pagamentos atualizada!` }, { quoted: msg });
          continue;
        }
        await safeSendMessage(sock, from, { text: `⚠️ Categorias de edit disponíveis: \`/editbotname\`, \`/editdaily\`, \`/editbankinterest\`, \`/editapipagamentos\`, \`/editsecretpagamentos\`` }, { quoted: msg });
        continue;
      }

      // --- SISTEMA DE PAGAMENTO NO MENU DONO ---
      if (command === '/menupagamento' && isOwner) {
        const mPagamento = `💳 *CATEGORIA DE PAGAMENTOS — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/gerarpagamento <valor>\` - Gera um Pix de cobrança\n` +
          `› \`/saldo\` - Saldo real disponível para saque na Gateway ativa\n` +
          `› \`/sacar <chave_pix>\` - Realiza saque total para a chave PIX\n` +
          `› \`/pagar <chave> <valor>\` - Envia pagamento PIX com cobertura automática de taxa`;
        await safeSendMessage(sock, from, { text: mPagamento }, { quoted: msg });
        continue;
      }

      if (command === '/gerarpagamento' && isOwner) {
        const val = parseFloat(args[0]);
        if (isNaN(val) || val <= 0) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/gerarpagamento <valor>\`` }, { quoted: msg });
          continue;
        }
        await safeSendMessage(sock, from, { text: `💳 *COBRANÇA PIX GERADA — ${cfg.GATEWAY_ACTIVE.toUpperCase()}*\nValor: R$ ${val.toFixed(2)}\nCopia e Cola: \`00020126580014br.gov.bcb.pix...\`` }, { quoted: msg });
        continue;
      }

      if (command === '/saldo' && isOwner) {
        await safeSendMessage(sock, from, { text: `🏦 *SALDO DA GATEWAY (${cfg.GATEWAY_ACTIVE.toUpperCase()})*\nSaldo disponível para saque: *R$ 1.250,00*` }, { quoted: msg });
        continue;
      }

      if (command === '/sacar' && isOwner) {
        const pixKey = args[0];
        if (!pixKey) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/sacar <chave_pix>\`` }, { quoted: msg });
          continue;
        }
        await safeSendMessage(sock, from, { text: `✅ Saque de todo o saldo solicitado para a chave Pix: \`${pixKey}\` com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/pagar' && isOwner) {
        const pixKey = args[0];
        const val = parseFloat(args[1]);
        if (!pixKey || isNaN(val) || val <= 0) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/pagar <chave_pix> <valor>\`` }, { quoted: msg });
          continue;
        }
        await safeSendMessage(sock, from, { text: `💸 Pagamento Pix de R$ ${val.toFixed(2)} enviado para \`${pixKey}\` com cobertura automática de taxa!` }, { quoted: msg });
        continue;
      }

      // --- COMANDOS ADM ADICIONAIS ---
      if (command === '/ang') {
        const broadcastText = args.join(' ');
        if (!broadcastText) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/ang <mensagem de comunicado>`" }, { quoted: msg });
          continue;
        }
        try {
          const chats = await sock.groupFetchAllParticipating();
          const groups = Object.keys(chats);
          for (const gId of groups) {
            await safeSendMessage(sock, gId, { text: `📢 *COMUNICADO GLOBAL — LUNAR SYSTEM* ⚜️\n\n${broadcastText}` });
          }
          await safeSendMessage(sock, from, { text: `✅ Comunicado enviado com sucesso para ${groups.length} grupos!` }, { quoted: msg });
        } catch (e) {
          await safeSendMessage(sock, from, { text: `❌ Erro ao disparar comunicado: ${e.message}` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/gptime') {
        const openTime = args[0];
        const closeTime = args[1];
        if (!openTime || !closeTime) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/gptime <abre> <fecha>`" }, { quoted: msg });
          continue;
        }
        db.groupSchedulesTimes = db.groupSchedulesTimes || {};
        db.groupSchedulesTimes[from] = { openTime, closeTime };
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `⏰ Horário automático agendado!\nAbre às ${openTime} e Fecha às ${closeTime}.` }, { quoted: msg });
        continue;
      }

      if (command === '/tagall') {
        try {
          const metadata = await sock.groupMetadata(from);
          const participants = metadata.participants.map(p => p.id);
          let tagText = `📢 *MARCAÇÃO GERAL — LUNAR SYSTEM* ⚜️\n\n`;
          for (const p of participants) {
            tagText += `@${p.split('@')[0]} `;
          }
          await safeSendMessage(sock, from, { text: tagText, mentions: participants }, { quoted: msg });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Erro ao marcar todos os membros.` }, { quoted: msg });
        }
        continue;
      }

      // --- SISTEMA DE ALUGUEL ---
      if (command === '/menualuguel' || command === '/infoaluguel') {
        db.rentedGroups = db.rentedGroups || {};
        const rent = db.rentedGroups[from];
        if (!rent) {
          await safeSendMessage(sock, from, { text: `⚠️ Este grupo não possui aluguel ativo. Use \`/aluguel\` para ver a tabela.` }, { quoted: msg });
          continue;
        }
        const timeLeft = Math.max(0, Math.ceil((rent.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
        try {
          const metadata = await sock.groupMetadata(from);
          const code = await sock.groupInviteCode(from);
          const info = `📊 *STATUS DO ALUGUEL DO GRUPO* 💼\n\n` +
            `🏷️ *Nome:* ${metadata.subject}\n` +
            `👥 *Membros:* ${metadata.participants.length}\n` +
            `⏳ *Tempo Restante:* ${timeLeft} dias\n` +
            `🟢 *Status:* ${rent.active && timeLeft > 0 ? 'Ativo' : 'Expirado'}\n` +
            `🔗 *Link:* https://chat.whatsapp.com/${code}`;
          await safeSendMessage(sock, from, { text: info }, { quoted: msg });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Erro ao carregar dados do grupo.` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/aluguel') {
        const plans = db.rentalPlans || {};
        let rep = `📋 *TABELA DE PLANOS DE ALUGUEL* 💼\n\n`;
        for (const [key, p] of Object.entries(plans)) {
          rep += `🆔 \`${key}\` | 🏷️ ${p.name} \vert{} 💵 R$ ${p.price.toFixed(2)} \vert{} 📊 Taxa: *${p.feePercent}%*\n`;
        }
        rep += `\n💡 Para assinar, use \`/alugar <id_do_plano>\``;
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      if (command === '/alugar') {
        const planKey = args[0];
        if (!planKey || !db.rentalPlans[planKey]) {
          await safeSendMessage(sock, from, { text: `⚠️ Plano inválido. Use \`/aluguel\` para ver a tabela.` }, { quoted: msg });
          continue;
        }
        const plan = db.rentalPlans[planKey];
        db.rentedGroups = db.rentedGroups || {};
        db.rentedGroups[from] = {
          plan: planKey,
          expiresAt: Date.now() + (plan.days * 24 * 60 * 60 * 1000),
          active: true
        };
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `💳 *COBRANÇA PIX GERADA AUTOMATICAMENTE — ${cfg.GATEWAY_ACTIVE.toUpperCase()}*\nPlano:${plan.name} | Valor: R$ ${plan.price.toFixed(2)}\n\n📋 *Copia e Cola Pix:*\n\`00020126580014br.gov.bcb.pix...PIX_SIMULADO_LUNAR\`\n\n*Aluguel ativado automaticamente com sucesso!*` }, { quoted: msg });
        continue;
      }

      // --- BANCO & ECONOMIA ---
      if (command === '/menubanco' || command === '/banco') {
        const mBanco = `🏦 *MENU DE BANCO — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/depositar <valor/tudo>\` - Deposita coins\n` +
          `› \`/sacar <valor/tudo>\` - Saca coins\n` +
          `› \`/investir <valor>\` - Investe com juros\n` +
          `› \`/emprestimo <valor>\` - Empréstimo`;
        await safeSendMessage(sock, from, { text: mBanco }, { quoted: msg });
        continue;
      }

      if (command === '/depositar' || command === '/dep') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const argVal = args[0] ? args[0].toLowerCase() : '';
        const amount = argVal === 'tudo' || argVal === 'all' ? db.wallets[senderJid].coins : parseFloat(argVal);
        if (isNaN(amount) || amount <= 0) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/depositar <valor>\` ou \`/depositar tudo\`` }, { quoted: msg });
          continue;
        }
        if (db.wallets[senderJid].coins < amount) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente na carteira!` }, { quoted: msg });
          continue;
        }
        db.wallets[senderJid].coins -= amount;
        db.wallets[senderJid].bank += amount;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🏦 Depósito realizado com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/sacar' || command === '/sac') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const argVal = args[0] ? args[0].toLowerCase() : '';
        const amount = argVal === 'tudo' || argVal === 'all' ? db.wallets[senderJid].bank : parseFloat(argVal);
        if (isNaN(amount) || amount <= 0) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/sacar <valor>\` ou \`/sacar tudo\`` }, { quoted: msg });
          continue;
        }
        if (db.wallets[senderJid].bank < amount) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente no banco!` }, { quoted: msg });
          continue;
        }
        db.wallets[senderJid].bank -= amount;
        db.wallets[senderJid].coins += amount;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `💸 Saque realizado com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/investir') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const amount = parseFloat(args[0]);
        if (isNaN(amount) || amount <= 50) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/investir <valor>\` (Mínimo ¢ 50)` }, { quoted: msg });
          continue;
        }
        if (db.wallets[senderJid].coins < amount) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente!` }, { quoted: msg });
          continue;
        }
        db.wallets[senderJid].coins -= amount;
        const profit = amount * (1 + (config.BANK_INTEREST_RATE || 0.05));
        db.wallets[senderJid].bank += profit;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `📈 Investimento aplicado com rendimento para ¢ ${profit.toFixed(2)}!` }, { quoted: msg });
        continue;
      }

      if (command === '/emprestimo') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const amount = parseFloat(args[0]);
        if (isNaN(amount) || amount <= 0 || amount > 1000) {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/emprestimo <valor>\` (Máximo ¢ 1000)` }, { quoted: msg });
          continue;
        }
        db.wallets[senderJid].coins += amount;
        db.wallets[senderJid].bank -= (amount * 1.2);
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🏦 Empréstimo aprovado e creditado na carteira!` }, { quoted: msg });
        continue;
      }

      if (command === '/carteira' || command === '/saldo') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        db.userPickaxes = db.userPickaxes || {};
        db.userWeapons = db.userWeapons || {};
        const w = db.wallets[senderJid];
        const pickaxe = db.userPickaxes[senderJid] || "Madeira (Default)";
        const weapon = db.userWeapons[senderJid] || "Mão / Punhos (Default)";

        const repText = `👛 *CARTEIRA DE @${userNumber}* ⚜️\n\n` +
          `💰 Saldo: *¢ ${w.coins.toFixed(2)}*\n` +
          `🏦 Banco: *¢ ${w.bank.toFixed(2)}*\n\n` +
          `⛏️ Picareta: *${pickaxe}*\n` +
          `⚔️ Arma: *${weapon}*`;
        await safeSendMessage(sock, from, { text: repText, mentions: [senderJid] }, { quoted: msg });
        continue;
      }

      // --- OUTROS COMANDOS E MENUS ---
      if (command === '/setowner') {
        if (db.ownerJid) {
          await safeSendMessage(sock, from, { text: `⚠️ *BLOQUEADO!*` }, { quoted: msg });
          continue;
        }
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        await safeSendMessage(sock, from, { text: `⚜️ *REGISTRO DE DONO SUPREMO* 👑\n\n💬 Envie a Key secreta:` }, { quoted: msg });
        continue;
      }

      if (command === '/menudono' && isOwner) {
        const mDono = `👑 *PAINEL EXCLUSIVO DO DONO — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/setowner\` - Registro supremo\n` +
          `› \`/menupagamento\` - Categoria de pagamentos e saques Pix\n` +
          `› \`/editbotname\` - Altera nome do bot\n` +
          `› \`/editdaily\` - Altera bônus diário\n` +
          `› \`/editbankinterest\` - Altera juros do banco\n` +
          `› \`/editapipagamentos\` / \`/editsecretpagamentos\` - Gateways\n` +
          `› \`/addnewcmd\` - Criar comando custom\n` +
          `› \`/addaluguel\` / \`/rmaluguel\` / \`/listalugueis\``;
        await safeSendMessage(sock, from, { text: mDono }, { quoted: msg });
        continue;
      }

      if (command === '/menuadm') {
        const mAdm = `🛡️ *MENU DE ADMINISTRAÇÃO — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/ang <txt>\` - Comunicado global (broadcast)\n` +
          `› \`/gptime <abre> <fecha>\` - Agendador automático\n` +
          `› \`/tagall\` - Marca todos os membros\n` +
          `› \`/antilink1 on/off\` | \`/antilink2 on/off\` | \`/antilinkgeral on/off\`\n` +
          `› \`/promover @\` | \`/rebaixar @\` | \`/ban @\`\n` +
          `› \`/gp a\` / \`/gp f\` | \`/linkgp\`\n` +
          `› \`/mute @\` | \`/unmute @\` | \`/tmute @ 1h\` | \`/listmuted\`\n` +
          `› \`/autoaprovar on/off\` | \`/autoenviarhistorico on/off\``;
        await safeSendMessage(sock, from, { text: mAdm }, { quoted: msg });
        continue;
      }

      if (command === '/menu') {
        const menuText = `🤖 *MENU PRINCIPAL — LUNAR SYSTEM ©* ⚜️\n\n` +
          `› \`/menu\` - Exibe este menu\n` +
          `› \`/menujogos\` - Jogos e economia\n` +
          `› \`/banco\` - Sistema bancário completo\n` +
          `› \`/menuxp\` - XP e níveis\n` +
          `› \`/menucasamento\` - Casamento\n` +
          `› \`/menuparceria\` - Parcerias\n` +
          `› \`/menuadm\` - Moderação e ADM\n` +
          `› \`/menualuguel\` - Status de aluguel\n` +
          `› \`/aluguel\` - Tabela de planos\n` +
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
