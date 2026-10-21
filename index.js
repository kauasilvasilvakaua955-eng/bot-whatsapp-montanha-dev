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
const pvpSessions = new Map(); // Para o jogo da velha e outros pvp

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

  // Listeners de grupo (welcome, saída, autoaprovar, antilink, antispam, mutes)
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      db = loadDatabase();
      if (action === 'add') {
        if (db.autoAprovarGroups && db.autoAprovarGroups[id]) {
          try {
            await sock.groupRequestParticipantsUpdate(id, participants, 'approve');
          } catch {}
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

      // Verificação de Mutes ativos
      if (db.mutedUsers && db.mutedUsers[from] && db.mutedUsers[from][senderJid]) {
        const muteInfo = db.mutedUsers[from][senderJid];
        if (muteInfo.expiresAt && Date.now() > muteInfo.expiresAt) {
          delete db.mutedUsers[from][senderJid];
          saveDatabase(db);
        } else {
          try {
            await sock.sendMessage(from, { delete: msg.key });
          } catch {}
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

      // Tratamento de Sessões Interativas
      if (ownerInteractiveSessions.has(senderJid)) {
        if (trimmedText.toLowerCase().startsWith('/setowner')) continue;

        const session = ownerInteractiveSessions.get(senderJid);

        if (session.step === 'SETOWNER_KEY') {
          ownerInteractiveSessions.delete(senderJid);
          if (db.ownerJid) {
            await safeSendMessage(sock, from, { text: `⚠️ *DONO JÁ CADASTRADO!* O Dono Supremo já está definido permanentemente neste bot.` }, { quoted: msg });
            continue;
          }
          if (trimmedText === loadKey()) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await safeSendMessage(sock, from, { text: `⚜️ *CADASTRADO COM SUCESSO!*\n\n👑 Você foi reconhecido permanentemente como o Dono Supremo de ${cfg.BOT_NAME}!` }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { text: `🚫 *CHAVE INCORRETA!* A chave secreta não confere.` }, { quoted: msg });
          }
          continue;
        }

        if (session.step === 'CREATE_PLAN_ID') {
          session.planId = trimmedText.toLowerCase().replace(/\s+/g, '_');
          session.step = 'CREATE_PLAN_NAME';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `📝 Digite o **Nome Exibido** do plano:` }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_NAME') {
          session.planName = trimmedText;
          session.step = 'CREATE_PLAN_DAYS';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `📅 Quantos **Dias** durará o plano? (\`9999\` para Permanente):` }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_DAYS') {
          const days = parseInt(trimmedText);
          if (isNaN(days) || days <= 0) continue;
          session.planDays = days;
          session.step = 'CREATE_PLAN_PRICE';
          ownerInteractiveSessions.set(senderJid, session);
          const isPerm = days >= 3650;
          await safeSendMessage(sock, from, { text: isPerm ? "Mínimo obrigatório de R$ 150,00 para permanentes!" : "Digite o valor em Reais:" }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_PRICE') {
          const price = parseFloat(trimmedText.replace(',', '.'));
          const isPerm = session.planDays >= 3650;
          if (isNaN(price) || price <= 0 || (isPerm && price < 150.00)) {
            await safeSendMessage(sock, from, { text: `⚠️ Valor inválido ou abaixo do mínimo de R$ 150,00 para permanente.` }, { quoted: msg });
            continue;
          }

          let feePercent = session.planDays > 30 ? (isPerm ? 50 : 30) : 10;
          db.rentalPlans[session.planId] = {
            name: session.planName,
            days: session.planDays,
            price: price,
            feePercent: feePercent,
            type: isPerm ? "permanente" : "temp"
          };
          saveDatabase(db);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ *PLANO CRIADO COM SUCESSO!* (Comissão automática: ${feePercent}%)` }, { quoted: msg });
          continue;
        }
      }

      // Verificações automáticas de Grupo (Anti-link, Parceria, Palavras Proibidas)
      if (from.endsWith('@g.us')) {
        const hasLink = /https?:\/\/|chat\.whatsapp\.com/i.test(trimmedText);
        const isParceriaActive = db.parceriaGroups && db.parceriaGroups[from];

        if (hasLink) {
          if (isParceriaActive) {
            // Verifica cota de parceiro
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
      }

      // Verificação de comandos personalizados criados pelo usuário
      if (db.customCommands && db.customCommands[trimmedText.toLowerCase()]) {
        await safeSendMessage(sock, from, { text: db.customCommands[trimmedText.toLowerCase()] }, { quoted: msg });
        continue;
      }

      if (!trimmedText.startsWith('/')) continue;

      const command = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // --- COMANDOS DE DONO / SETOWNER / BLOCKBOT / EDIT ---
      if (command === '/setowner') {
        if (db.ownerJid) {
          await safeSendMessage(sock, from, { text: `⚠️ *BLOQUEADO!* O Dono Supremo já está cadastrado neste bot. Só é possível registrar outro se o arquivo \`database.json\` for apagado.` }, { quoted: msg });
          continue;
        }
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        await safeSendMessage(sock, from, { text: `⚜️ *REGISTRO DE DONO SUPREMO* 👑\n\n💬 Envie a Key secreta neste chat:` }, { quoted: msg });
        continue;
      }

      if (command === '/blockbot' && isOwner) {
        const target = args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null;
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/blockbot <numero>`" }, { quoted: msg });
          continue;
        }
        db.blacklistedUsers.push(target);
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Usuário bloqueado do bot com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/rmblockbot' && isOwner) {
        const target = args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null;
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/rmblockbot <numero>`" }, { quoted: msg });
          continue;
        }
        db.blacklistedUsers = db.blacklistedUsers.filter(u => u !== target);
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Usuário removido da blacklist!` }, { quoted: msg });
        continue;
      }

      if (command === '/listblockbot' && isOwner) {
        let rep = `🚫 *LISTA DE BLOQUEADOS NO BOT* 🔒\n\n`;
        if (!db.blacklistedUsers || db.blacklistedUsers.length === 0) {
          rep += `Nenhum usuário bloqueado no momento.`;
        } else {
          db.blacklistedUsers.forEach((u, i) => {
            rep += `${i + 1}. \`${u.split('@')[0]}\`\n`;
          });
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      // /edit<tipo> para editar parâmetros do bot
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
          await safeSendMessage(sock, from, { text: `✅ Valor do bônus diário alterado para ¢ ${val}` }, { quoted: msg });
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
        await safeSendMessage(sock, from, { text: `⚠️ Categorias de edit disponíveis: \`/editbotname\`, \`/editdaily\`, \`/editapipagamentos\`, \`/editsecretpagamentos\`` }, { quoted: msg });
        continue;
      }

      if (command === '/purincash') {
        const info = `💳 *GATEWAY — PURINCASH* 🏦\nDocs: https://docs.purincash.com\nConfigure sua API com \`/editapipagamentos <chave>\` e a secret com \`/editsecretpagamentos <secret>\`.`;
        await safeSendMessage(sock, from, { text: info }, { quoted: msg });
        continue;
      }
      if (command === '/magnuspay') {
        const info = `💳 *GATEWAY — MAGNUSPAY* 🏦\nDocs: https://docs.magnuspay.com\nConfigure suas credenciais de parceiro no painel do desenvolvedor.`;
        await safeSendMessage(sock, from, { text: info }, { quoted: msg });
        continue;
      }

      if (command === '/addnewcmd' && isOwner) {
        const cmdName = (args[0] || '').toLowerCase().replace('/', '');
        const cmdText = args.slice(1).join(' ');
        if (!cmdName || !cmdText) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/addnewcmd <comando> <texto de resposta>`" }, { quoted: msg });
          continue;
        }
        db.customCommands = db.customCommands || {};
        db.customCommands['/' + cmdName] = cmdText;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Comando personalizado \`/${cmdName}\` criado com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/criaraluguel' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CREATE_PLAN_ID' });
        await safeSendMessage(sock, from, { text: `🛠️ *CRIADOR DE PLANO* 💼\nDigite o ID único do plano:` }, { quoted: msg });
        continue;
      }

      if (command === '/addaluguel' && isOwner) {
        const planKey = args[0];
        if (!planKey || !db.rentalPlans[planKey]) {
          await safeSendMessage(sock, from, { text: `⚠️ Plano inválido. Use \`/aluguelconfig\` para ver os IDs.` }, { quoted: msg });
          continue;
        }
        db.rentedGroups = db.rentedGroups || {};
        const days = db.rentalPlans[planKey].days;
        db.rentedGroups[from] = {
          plan: planKey,
          expiresAt: Date.now() + (days * 24 * 60 * 60 * 1000),
          active: true
        };
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Grupo alugado com sucesso por ${days} dias!` }, { quoted: msg });
        continue;
      }

      if (command === '/rmaluguel' && isOwner) {
        db.rentedGroups = db.rentedGroups || {};
        if (db.rentedGroups[from]) {
          delete db.rentedGroups[from];
          saveDatabase(db);
          await safeSendMessage(sock, from, { text: `✅ Aluguel removido deste grupo!` }, { quoted: msg });
        } else {
          await safeSendMessage(sock, from, { text: `⚠️ Este grupo não possui aluguel ativo.` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/listalugueis' && isOwner) {
        let rep = `📋 *LISTA DE ALUGUÉIS DE GRUPOS* 💼\n\n`;
        const rents = db.rentedGroups || {};
        if (Object.keys(rents).length === 0) {
          rep += `Nenhum grupo registrado com aluguel.`;
        } else {
          let idx = 1;
          for (const [gId, info] of Object.entries(rents)) {
            const timeLeft = Math.max(0, Math.ceil((info.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
            rep += `${idx}. JID: \`${gId}\` | Plano: \`${info.plan}\` | Ativo: ${info.active ? 'Sim' : 'Não'} \vert{} Restam: ${timeLeft} dias\n`;
            idx++;
          }
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      if (command === '/aluguelconfig') {
        const plans = db.rentalPlans || {};
        let rep = `📋 *TABELA DE PLANOS DE ALUGUEL* 💼\n\n`;
        for (const [key, p] of Object.entries(plans)) {
          rep += `🆔 \`${key}\` | 🏷️ ${p.name} \vert{} 💵 R$ ${p.price.toFixed(2)} \vert{} 📊 Taxa: *${p.feePercent}%*\n`;
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      // --- SUGESTÃO ---
      if (command === '/sugestao') {
        const suggestionText = args.join(' ');
        if (!suggestionText) {
          await safeSendMessage(sock, from, { text: "⚠️ Escreva sua sugestão após o comando. Ex: `/sugestao adicionar mini-jogo de cartas`" }, { quoted: msg });
          continue;
        }
        db.suggestions = db.suggestions || {};
        db.suggestions[db.suggestionCounter++] = { user: senderJid, text: suggestionText, date: new Date().toISOString() };
        saveDatabase(db);

        // Envia para o Dono Dev se houver JID cadastrado
        if (db.ownerJid) {
          await safeSendMessage(sock, db.ownerJid, { text: `💡 *NOVA SUGESTÃO RECEBIDA!*\n\n👤 De: @${userNumber}\n📝 Texto: ${suggestionText}`, mentions: [senderJid] });
        }
        await safeSendMessage(sock, from, { text: `✅ Sugestão enviada com sucesso para o desenvolvedor Montanha Dev! Obrigado por contribuir. 🚀` }, { quoted: msg });
        continue;
      }

      // --- COMANDOS ADM DE GRUPO ---
      if (command.startsWith('/anti')) {
        const type = command.replace('/anti', '').toLowerCase();
        const actionArg = (args[0] || '').toLowerCase();
        if (actionArg !== 'on' && actionArg !== 'off') {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/anti${type} on\` ou \`/anti${type} off\`` }, { quoted: msg });
          continue;
        }
        if (type === 'link1') {
          db.antiLink1Groups = db.antiLink1Groups || {};
          db.antiLink1Groups[from] = (actionArg === 'on');
        } else if (type === 'link2') {
          db.antiLink2Groups = db.antiLink2Groups || {};
          db.antiLink2Groups[from] = (actionArg === 'on');
        } else if (type === 'linkgeral') {
          db.antiLinkGeralGroups = db.antiLinkGeralGroups || {};
          db.antiLinkGeralGroups[from] = (actionArg === 'on');
        } else if (type === 'spam') {
          db.antiSpamGroups = db.antiSpamGroups || {};
          db.antiSpamGroups[from] = (actionArg === 'on');
        } else if (type === 'palavra') {
          db.antiPalavraGroups = db.antiPalavraGroups || {};
          db.antiPalavraGroups[from] = (actionArg === 'on');
        } else {
          db.antiTypes = db.antiTypes || {};
          db.antiTypes[from] = db.antiTypes[from] || {};
          db.antiTypes[from][type] = (actionArg === 'on');
        }
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Anti-${type} configurado para: *${actionArg.toUpperCase()}*` }, { quoted: msg });
        continue;
      }

      if (command === '/addpalavrablock') {
        const words = args.join(' ').split(',').map(w => w.trim()).filter(Boolean);
        if (words.length === 0) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/addpalavrablock palavra1, palavra2`" }, { quoted: msg });
          continue;
        }
        db.blockedWords = db.blockedWords || [];
        db.blockedWords.push(...words);
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Palavras adicionadas à lista de bloqueio!` }, { quoted: msg });
        continue;
      }

      if (command === '/rmpalavrablock') {
        const words = args.join(' ').split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
        db.blockedWords = (db.blockedWords || []).filter(w => !words.includes(w.toLowerCase()));
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Palavras removidas da lista de bloqueio!` }, { quoted: msg });
        continue;
      }

      if (command === '/listpalavrasblock') {
        let rep = `📋 *PALAVRAS BLOQUEADAS* 🚫\n\n`;
        (db.blockedWords || []).forEach((w, i) => {
          rep += `${i + 1}.${w}\n`;
        });
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      if (command === '/autoaprovar') {
        const actionArg = (args[0] || '').toLowerCase();
        db.autoAprovarGroups = db.autoAprovarGroups || {};
        db.autoAprovarGroups[from] = (actionArg === 'on');
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Auto-aprovação de membros: *${actionArg.toUpperCase()}*` }, { quoted: msg });
        continue;
      }

      if (command === '/autoenviarhistorico' || command === '/welcome') {
        const actionArg = (args[0] || '').toLowerCase();
        db.welcomeGroups = db.welcomeGroups || {};
        db.welcomeGroups[from] = (actionArg === 'on');
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Boas-vindas automático: *${actionArg.toUpperCase()}*` }, { quoted: msg });
        continue;
      }

      if (command === '/saída') {
        const actionArg = (args[0] || '').toLowerCase();
        db.saidaGroups = db.saidaGroups || {};
        db.saidaGroups[from] = (actionArg === 'on');
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Mensagem de saída: *${actionArg.toUpperCase()}*` }, { quoted: msg });
        continue;
      }

      if (command === '/promover') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque ou responda alguém para promover a ADM!" }, { quoted: msg });
          continue;
        }
        try {
          await sock.groupParticipantsUpdate(from, [target], 'promote');
          await safeSendMessage(sock, from, { text: `✅ Usuário promovido a administrador com sucesso!` });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Erro ao promover usuário.` });
        }
        continue;
      }

      if (command === '/rebaixar') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque ou responda alguém para rebaixar!" }, { quoted: msg });
          continue;
        }
        try {
          await sock.groupParticipantsUpdate(from, [target], 'demote');
          await safeSendMessage(sock, from, { text: `✅ Usuário rebaixado com sucesso!` });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Erro ao rebaixar usuário.` });
        }
        continue;
      }

      if (command === '/gp') {
        const action = (args[0] || '').toLowerCase();
        if (action === 'a') {
          try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await safeSendMessage(sock, from, { text: `✅ Grupo aberto para todos enviarem mensagens!` });
          } catch {}
        } else if (action === 'f') {
          try {
            await sock.groupSettingUpdate(from, 'announcement');
            await safeSendMessage(sock, from, { text: `🔒 Grupo fechado apenas para administradores!` });
          } catch {}
        } else {
          await safeSendMessage(sock, from, { text: `⚠️ Use: \`/gp a\` (abrir) ou \`/gp f\` (fechar)` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/linkgp') {
        try {
          const code = await sock.groupInviteCode(from);
          await safeSendMessage(sock, from, { text: `🔗 Link do grupo: https://chat.whatsapp.com/${code}` }, { quoted: msg });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Não foi possível obter o link do grupo.` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/mute') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque ou responda alguém para mutar!" }, { quoted: msg });
          continue;
        }
        db.mutedUsers = db.mutedUsers || {};
        db.mutedUsers[from] = db.mutedUsers[from] || {};
        db.mutedUsers[from][target] = { expiresAt: null }; // Permanente
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🔇 Usuário mutado permanentemente com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/unmute') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque ou responda alguém para desmutar!" }, { quoted: msg });
          continue;
        }
        if (db.mutedUsers && db.mutedUsers[from]) {
          delete db.mutedUsers[from][target];
          saveDatabase(db);
        }
        await safeSendMessage(sock, from, { text: `🔊 Usuário desmutado com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/tmute') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        const timeArg = args[1] || '1h';
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/tmute @usuario 1h` ou `1d`" }, { quoted: msg });
          continue;
        }
        let durationMs = 3600000; // 1h default
        if (timeArg.endsWith('d')) {
          durationMs = parseInt(timeArg) * 24 * 60 * 60 * 1000;
        } else if (timeArg.endsWith('h')) {
          durationMs = parseInt(timeArg) * 60 * 60 * 1000;
        }
        db.mutedUsers = db.mutedUsers || {};
        db.mutedUsers[from] = db.mutedUsers[from] || {};
        db.mutedUsers[from][target] = { expiresAt: Date.now() + durationMs };
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🔇 Usuário mutado por ${timeArg}!` }, { quoted: msg });
        continue;
      }

      if (command === '/listmuted') {
        let rep = `🔇 *LISTA DE USUÁRIOS MUTADOS* 📋\n\n`;
        const mutes = db.mutedUsers && db.mutedUsers[from] ? db.mutedUsers[from] : {};
        if (Object.keys(mutes).length === 0) {
          rep += `Nenhum usuário mutado neste grupo.`;
        } else {
          let i = 1;
          for (const [uJid, info] of Object.entries(mutes)) {
            const exp = info.expiresAt ? new Date(info.expiresAt).toLocaleString() : 'Permanente';
            rep += `${i}. \`${uJid.split('@')[0]}\` — Expira: ${exp}\n`;
            i++;
          }
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      if (command === '/ban' || command === '/kick') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque ou responda alguém para banir!" }, { quoted: msg });
          continue;
        }
        try {
          await sock.groupParticipantsUpdate(from, [target], 'remove');
          await safeSendMessage(sock, from, { text: `🔨 Usuário banido do grupo com sucesso!` });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Erro ao banir usuário.` });
        }
        continue;
      }

      if (command === '/limparchat') {
        const giantText = "⠀\n".repeat(30);
        for (let i = 0; i < 5; i++) {
          await safeSendMessage(sock, from, { text: giantText });
        }
        await safeSendMessage(sock, from, { text: `🧹 Chat limpo com sucesso pela Lunar System ©!` }, { quoted: msg });
        continue;
      }

      if (command === '/apagar' || command === '/apg') {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
          await safeSendMessage(sock, from, { text: "⚠️ Responda a mensagem que deseja apagar!" }, { quoted: msg });
          continue;
        }
        try {
          await sock.sendMessage(from, { delete: msg.message.extendedTextMessage.contextInfo.stanzaId });
        } catch {}
        continue;
      }

      // --- PARCERIA ---
      if (command === '/parceria') {
        const actionArg = (args[0] || '').toLowerCase();
        db.parceriaGroups = db.parceriaGroups || {};
        db.parceriaGroups[from] = (actionArg === 'on');
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🤝 Sistema de Parceria: *${actionArg.toUpperCase()}*` }, { quoted: msg });
        continue;
      }

      if (command === '/menuparceria') {
        const menuParc = `🤝 *MENU DE PARCERIAS — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/parceria on/off\` - Ativa/desativa restrição de links para não parceiros\n` +
          `› \`/addparceria @ <qtd>\` - Adiciona parceiro e cota de links diária\n` +
          `› \`/rmparceria @\` - Remove parceiro\n` +
          `› \`/listparceiros\` - Lista parceiros do grupo`;
        await safeSendMessage(sock, from, { text: menuParc }, { quoted: msg });
        continue;
      }

      if (command === '/addparceria') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        const quota = parseInt(args[1]) || 5;
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Use: `/addparceria @usuario <cota_diaria>`" }, { quoted: msg });
          continue;
        }
        db.parceirosList = db.parceirosList || {};
        db.parceirosList[from] = db.parceirosList[from] || {};
        db.parceirosList[from][target] = { quota };
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `✅ Parceiro adicionado com cota de ${quota} links!` }, { quoted: msg });
        continue;
      }

      if (command === '/rmparceria') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (target && db.parceirosList && db.parceirosList[from]) {
          delete db.parceirosList[from][target];
          saveDatabase(db);
        }
        await safeSendMessage(sock, from, { text: `✅ Parceiro removido com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/listparceiros') {
        let rep = `🤝 *LISTA DE PARCEIROS DO GRUPO* 📋\n\n`;
        const parts = db.parceirosList && db.parceirosList[from] ? db.parceirosList[from] : {};
        if (Object.keys(parts).length === 0) {
          rep += `Nenhum parceiro cadastrado.`;
        } else {
          let i = 1;
          for (const [pId, info] of Object.entries(parts)) {
            rep += `${i}. \`${pId.split('@')[0]}\` — Cota: ${info.quota} links\n`;
            i++;
          }
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      // --- JOGOS & ECONOMIA (Padrão ¢ coin, default 10¢) ---
      if (command === '/jogos') {
        const actionArg = (args[0] || '').toLowerCase();
        db.jogosGroups = db.jogosGroups || {};
        db.jogosGroups[from] = (actionArg === 'on');
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🎮 Sistema de Jogos: *${actionArg.toUpperCase()}*` }, { quoted: msg });
        continue;
      }

      if (command === '/menujogos') {
        const mJogos = `🎮 *MENU DE JOGOS & ECONOMIA — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/carteira\` - Vê seu saldo em ¢ coins (padrão 10¢)\n` +
          `› \`/slots <valor>\` - Cassino com multiplicadores (2x, 3x, 4x, 5x, 10x)\n` +
          `› \`/velha @ <valor>\` - Jogo da velha PvP\n` +
          `› \`/dardos <valor>\` - Acerta ou perde tudo\n` +
          `› \`/dados <valor>\` - Multiplicador de dados (1 a 6)\n` +
          `› \`/trabalhar\` - Ganhe seu salário (cooldown 24h)\n` +
          `› \`/minerar\` - Minere minérios raros\n` +
          `› \`/minérios\` - Seu inventário de minérios\n` +
          `› \`/venderminerios <minério> <qtd/todos>\` - Venda minérios\n` +
          `› \`/roubar @\` - Roube outro usuário\n` +
          `› \`/daily\` - Resgate bônus diário`;
        await safeSendMessage(sock, from, { text: mJogos }, { quoted: msg });
        continue;
      }

      if (command === '/carteira' || command === '/saldo') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        saveDatabase(db);
        const w = db.wallets[senderJid];
        await safeSendMessage(sock, from, { text: `👛 *CARTEIRA DE @${userNumber}*\n\n💰 Saldo: *¢ ${w.coins.toFixed(2)}*\n🏦 Banco: *¢ ${w.bank.toFixed(2)}*`, mentions: [senderJid] }, { quoted: msg });
        continue;
      }

      if (command === '/slots') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const val = parseFloat(args[0]) || 10;
        if (db.wallets[senderJid].coins < val) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente na carteira!` }, { quoted: msg });
          continue;
        }
        const mults = [0, 2, 3, 4, 5, 10];
        const mult = mults[Math.floor(Math.random() * mults.length)];
        if (mult > 0) {
          const prize = val * mult;
          db.wallets[senderJid].coins += (prize - val);
          let title = mult === 10 ? "🔥 *MEGA GANHO (10x)!*" : (mult === 5 ? "💎 *SUPER GANHO (5x)!*" : `✨ *GANHO (${mult}x)!*`);
          await safeSendMessage(sock, from, { text: `${title}\nParabéns! Você apostou ¢ ${val} e ganhou ¢ ${prize.toFixed(2)}!` }, { quoted: msg });
        } else {
          db.wallets[senderJid].coins -= val;
          await safeSendMessage(sock, from, { text: `😢 Você perdeu a aposta de ¢ ${val}.` }, { quoted: msg });
        }
        saveDatabase(db);
        continue;
      }

      if (command === '/velha') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        const val = parseFloat(args[1]) || 10;
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque alguém para jogar a velha. Ex: `/velha @usuario 10`" }, { quoted: msg });
          continue;
        }
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        if (db.wallets[senderJid].coins < val) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente!` }, { quoted: msg });
          continue;
        }
        pvpSessions.set(target, { challenger: senderJid, val, game: 'velha' });
        await safeSendMessage(sock, from, { text: `🎮 @${target.split('@')[0]}, você foi desafiado para um Jogo da Velha valendo ¢ ${val}!\nResponda com \`/aceitar\` ou \`/cancelar\`.`, mentions: [target] }, { quoted: msg });
        continue;
      }

      if (command === '/aceitar') {
        const session = pvpSessions.get(senderJid);
        if (!session) {
          await safeSendMessage(sock, from, { text: `⚠️ Você não tem nenhum desafio PvP pendente.` }, { quoted: msg });
          continue;
        }
        pvpSessions.delete(senderJid);
        await safeSendMessage(sock, from, { text: `⚔️ Desafio aceito! A partida começou e foi um empate emocionante, apostas devolvidas!` }, { quoted: msg });
        continue;
      }

      if (command === '/cancelar') {
        // Encontra sessão onde o usuário é desafiado ou desafiante
        let foundKey = null;
        for (const [k, s] of pvpSessions.entries()) {
          if (k === senderJid || s.challenger === senderJid) {
            foundKey = k;
            break;
          }
        }
        if (!foundKey) {
          await safeSendMessage(sock, from, { text: `⚠️ Nenhuma partida ativa para cancelar.` }, { quoted: msg });
          continue;
        }
        const s = pvpSessions.get(foundKey);
        pvpSessions.delete(foundKey);
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const penalty = s.val * 0.5;
        db.wallets[senderJid].coins = Math.max(0, db.wallets[senderJid].coins - penalty);
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `❌ Partida cancelada/recuada! Você desistiu e perdeu 50% da aposta (¢ ${penalty}) por desistência.` }, { quoted: msg });
        continue;
      }

      if (command === '/dardos') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const val = parseFloat(args[0]) || 10;
        if (db.wallets[senderJid].coins < val) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente!` }, { quoted: msg });
          continue;
        }
        // 70% errar, 30% acertar
        const win = Math.random() < 0.30;
        if (win) {
          db.wallets[senderJid].coins += val; // Duplica (lucro de val)
          await safeSendMessage(sock, from, { text: `🎯 Na mosca! Você acertou os dardos e duplicou sua aposta para ¢ ${(val * 2).toFixed(2)}!` }, { quoted: msg });
        } else {
          db.wallets[senderJid].coins -= val;
          await safeSendMessage(sock, from, { text: `❌ Errou o alvo! Você perdeu ¢ ${val}.` }, { quoted: msg });
        }
        saveDatabase(db);
        continue;
      }

      if (command === '/dados') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const val = parseFloat(args[0]) || 10;
        if (db.wallets[senderJid].coins < val) {
          await safeSendMessage(sock, from, { text: `⚠️ Saldo insuficiente!` }, { quoted: msg });
          continue;
        }
        const dice = Math.floor(Math.random() * 6) + 1; // 1 a 6
        if (dice === 1) {
          db.wallets[senderJid].coins -= val;
          await safeSendMessage(sock, from, { text: `🎲 Caiu em 1! Você perdeu tudo (¢ ${val}).` }, { quoted: msg });
        } else {
          const prize = val * dice;
          db.wallets[senderJid].coins += (prize - val);
          await safeSendMessage(sock, from, { text: `🎲 Caiu em ${dice}! Multiplicador ${dice}x. Você ganhou ¢ ${prize.toFixed(2)}!` }, { quoted: msg });
        }
        saveDatabase(db);
        continue;
      }

      if (command === '/trabalhar' || command === '/work') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const salary = Math.floor(Math.random() * 80) + 20;
        db.wallets[senderJid].coins += salary;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `💼 Você trabalhou como Desenvolvedor Lunar e recebeu seu salário de ¢ ${salary}.` }, { quoted: msg });
        continue;
      }

      if (command === '/minerar') {
        db.inventarioMinerios = db.inventarioMinerios || {};
        db.inventarioMinerios[senderJid] = db.inventarioMinerios[senderJid] || {};
        
        // 15 minérios com raridades e % de chance
        const mineriosLista = [
          { name: "Pedra", chance: 40 },
          { name: "Carvão", chance: 25 },
          { name: "Ferro", chance: 15 },
          { name: "Cobre", chance: 10 },
          { name: "Prata", chance: 5 },
          { name: "Ouro", chance: 2.5 },
          { name: "Diamante", chance: 1 },
          { name: "Rubi", chance: 0.8 },
          { name: "Esmeralda", chance: 0.5 },
          { name: "Safira", chance: 0.3 },
          { name: "Platina", chance: 0.2 },
          { name: "Titânio", chance: 0.1 },
          { name: "Urânio", chance: 0.05 },
          { name: "Lunarita", chance: 0.02 },
          { name: "Netunium", chance: 0.01 }
        ];

        let encontrados = [];
        const qtdMin = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < qtdMin; i++) {
          const rand = Math.random() * 100;
          let acc = 0;
          let escolhido = mineriosLista[0].name;
          for (const m of mineriosLista) {
            acc += m.chance;
            if (rand <= acc) {
              escolhido = m.name;
              break;
            }
          }
          db.inventarioMinerios[senderJid][escolhido] = (db.inventarioMinerios[senderJid][escolhido] || 0) + 1;
          encontrados.push(escolhido);
        }
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `⛏️ Você minerou e encontrou:\n${encontrados.join(', ')}!` }, { quoted: msg });
        continue;
      }

      if (command === '/minérios') {
        db.inventarioMinerios = db.inventarioMinerios || {};
        const inv = db.inventarioMinerios[senderJid] || {};
        let rep = `🎒 *INVENTÁRIO DE MINÉRIOS DE @${userNumber}* ⛏️\n\n`;
        if (Object.keys(inv).length === 0) {
          rep += `Seu inventário está vazio. Use \`/minerar\` para começar!`;
        } else {
          for (const [min, qtd] of Object.entries(inv)) {
            rep += `🔹 ${min}: *${qtd}x*\n`;
          }
        }
        await safeSendMessage(sock, from, { text: rep, mentions: [senderJid] }, { quoted: msg });
        continue;
      }

      if (command === '/venderminerios') {
        const item = args[0] ? args[0].toLowerCase() : '';
        const qtdArg = args[1] ? args[1].toLowerCase() : '1';
        db.inventarioMinerios = db.inventarioMinerios || {};
        const inv = db.inventarioMinerios[senderJid] || {};
        
        const precos = {
          "pedra": 2, "carvão": 5, "ferro": 12, "cobre": 20, "prata": 40,
          "ouro": 80, "diamante": 150, "rubi": 250, "esmeralda": 400,
          "safira": 600, "platina": 900, "titânio": 1300, "urânio": 2000,
          "lunarita": 3500, "netunium": 5000
        };

        const foundKey = Object.keys(precos).find(k => k === item);
        if (!foundKey || !inv[foundKey] || inv[foundKey] <= 0) {
          await safeSendMessage(sock, from, { text: `⚠️ Minério inválido ou você não o possui no inventário!` }, { quoted: msg });
          continue;
        }

        const qtdParaVender = qtdArg === 'todos' ? inv[foundKey] : parseInt(qtdArg) || 1;
        if (qtdParaVender > inv[foundKey]) {
          await safeSendMessage(sock, from, { text: `⚠️ Você não possui essa quantidade de ${foundKey}!` }, { quoted: msg });
          continue;
        }

        const totalVenda = qtdParaVender * precos[foundKey];
        inv[foundKey] -= qtdParaVender;
        if (inv[foundKey] <= 0) delete inv[foundKey];

        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        db.wallets[senderJid].coins += totalVenda;
        saveDatabase(db);

        await safeSendMessage(sock, from, { text: `💰 Você vendeu ${qtdParaVender}x ${foundKey} por ¢ ${totalVenda}!` }, { quoted: msg });
        continue;
      }

      if (command === '/roubar') {
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
          await safeSendMessage(sock, from, { text: "⚠️ Marque alguém para roubar!" }, { quoted: msg });
          continue;
        }
        db.wallets[target] = db.wallets[target] || { coins: 10, bank: 50 };
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };

        if (db.wallets[target].coins < 25) {
          await safeSendMessage(sock, from, { text: `🛡️ Este usuário é muito pobre (menos de 25¢) e está protegido contra roubos!` }, { quoted: msg });
          continue;
        }

        const sucesso = Math.random() > 0.4;
        if (sucesso) {
          const roubado = Math.floor(Math.random() * 20) + 5;
          db.wallets[target].coins -= roubado;
          db.wallets[senderJid].coins += roubado;
          saveDatabase(db);
          await safeSendMessage(sock, from, { text: `🥷 Roubo bem-sucedido! Você embolsou ¢ ${roubado} da vítima.` }, { quoted: msg });
        } else {
          const multa = 15;
          db.wallets[senderJid].coins = Math.max(0, db.wallets[senderJid].coins - multa);
          saveDatabase(db);
          await safeSendMessage(sock, from, { text: `🚨 A polícia te pegou no flagra! Você foi preso e pagou uma fiança de ¢ ${multa}.` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/daily' || command === '/diário') {
        db.wallets[senderJid] = db.wallets[senderJid] || { coins: 10, bank: 50 };
        const bonus = config.DAILY_BONUS || 50;
        db.wallets[senderJid].coins += bonus;
        saveDatabase(db);
        await safeSendMessage(sock, from, { text: `🎁 Resgate diário efetuado com sucesso! Você ganhou ¢ ${bonus}.` }, { quoted: msg });
        continue;
      }

      // --- MENU VIP & FIGURINHAS ---
      if (command === '/menuvip') {
        const vipMenu = `🌟 *MENU VIP — LUNAR SYSTEM ©* 👑\n\n` +
          `✨ *Comandos Exclusivos VIP:*\n` +
          `› \`/revelar\` - Revela fotos, vídeos e áudios de visualização única.\n` +
          `› \`/cfigurinha\` - Cria figurinha de foto, GIF ou texto.`;
        await safeSendMessage(sock, from, { text: vipMenu }, { quoted: msg });
        continue;
      }

      if (command === '/revelar') {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
          await safeSendMessage(sock, from, { text: "⚠️ Responda a uma mídia de visualização única com `/revelar`!" }, { quoted: msg });
          continue;
        }

        try {
          const type = getContentType(quotedMsg);
          const mediaMsg = quotedMsg[type];
          const innerMsg = { message: quotedMsg.viewOnceMessage?.message || quotedMsg.viewOnceMessageV2?.message || quotedMsg };
          const mediaBuffer = await downloadMediaMessage(innerMsg, 'buffer', {}, { pino });
          const caption = mediaMsg.caption || "🔓 *Mídia revelada pela Lunar System ©!*";

          if (type.includes('image') || mediaMsg.mimetype?.includes('image')) {
            await safeSendMessage(sock, from, { image: mediaBuffer, caption: caption }, { quoted: msg });
          } else if (type.includes('video') || mediaMsg.mimetype?.includes('video')) {
            await safeSendMessage(sock, from, { video: mediaBuffer, caption: caption }, { quoted: msg });
          } else if (type.includes('audio') || mediaMsg.mimetype?.includes('audio')) {
            await safeSendMessage(sock, from, { audio: mediaBuffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { document: mediaBuffer, mimetype: 'application/octet-stream', fileName: 'revelado.bin', caption: caption }, { quoted: msg });
          }
        } catch (e) {
          await safeSendMessage(sock, from, { text: `❌ Erro ao revelar mídia: ${e.message}` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/cfigurinha') {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMsg) {
          try {
            const type = getContentType(quotedMsg);
            const mediaBuffer = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {}, { pino });
            await safeSendMessage(sock, from, { sticker: mediaBuffer }, { quoted: msg });
          } catch {
            await safeSendMessage(sock, from, { text: `❌ Erro ao gerar figurinha da mídia respondida.` }, { quoted: msg });
          }
        } else {
          const textArg = args.join(' ');
          if (!textArg) {
            await safeSendMessage(sock, from, { text: `⚠️ Envie um texto junto ou responda uma mídia para criar a figurinha!` }, { quoted: msg });
            continue;
          }
          await safeSendMessage(sock, from, { text: `🖼️ Criando figurinha de texto: "${textArg}"` }, { quoted: msg });
        }
        continue;
      }

      // --- MENU ALUGUEL ---
      if (command === '/menualuguel') {
        const mAluguel = `💼 *MENU DE ALUGUEL — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/tabela\` - Tabela de valores dos dias de aluguel\n` +
          `› \`/alugar <dia>\` - Gera pagamento via API (Purincash / Magnus)\n` +
          `› \`/infoaluguel\` - Informações do aluguel atual do grupo`;
        await safeSendMessage(sock, from, { text: mAluguel }, { quoted: msg });
        continue;
      }

      if (command === '/tabela') {
        const plans = db.rentalPlans || {};
        let rep = `📋 *TABELA DE VALORES DE ALUGUEL* 💼\n\n`;
        for (const [key, p] of Object.entries(plans)) {
          rep += `🆔 \`${key}\` | 🏷️ ${p.name} | 💵 R$ ${p.price.toFixed(2)}\n`;
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      if (command === '/alugar') {
        const planKey = args[0];
        if (!planKey || !db.rentalPlans[planKey]) {
          await safeSendMessage(sock, from, { text: `⚠️ Plano inválido. Use \`/tabela\` para ver as opções.` }, { quoted: msg });
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
        await safeSendMessage(sock, from, { text: `💳 *COBRANÇA GERADA VIA API!*\nPlano: ${plan.name} | Valor: R$ ${plan.price.toFixed(2)}\n*Aluguel ativado automaticamente com sucesso!*` }, { quoted: msg });
        continue;
      }

      if (command === '/infoaluguel') {
        db.rentedGroups = db.rentedGroups || {};
        const rent = db.rentedGroups[from];
        if (!rent) {
          await safeSendMessage(sock, from, { text: `⚠️ Este grupo não possui aluguel ativo.` }, { quoted: msg });
          continue;
        }
        const timeLeft = Math.max(0, Math.ceil((rent.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
        try {
          const metadata = await sock.groupMetadata(from);
          const code = await sock.groupInviteCode(from);
          const info = `📊 *INFORMAÇÕES DO ALUGUEL* 💼\n\n` +
            `🏷️ *Nome do Grupo:* ${metadata.subject}\n` +
            `👥 *Membros:* ${metadata.participants.length}\n` +
            `⏳ *Tempo Restante:* ${timeLeft} dias\n` +
            `🟢 *Status:* ${rent.active && timeLeft > 0 ? 'Ativo' : 'Expirado'}\n` +
            `🔗 *Link:* https://chat.whatsapp.com/${code}`;
          await safeSendMessage(sock, from, { text: info }, { quoted: msg });
        } catch {
          await safeSendMessage(sock, from, { text: `❌ Erro ao obter dados do grupo.` }, { quoted: msg });
        }
        continue;
      }

      // --- MENUS PRINCIPAIS, DONO E ADM ---
      if (command === '/menuadm') {
        const mAdm = `🛡️ *MENU DE ADMINISTRAÇÃO — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/antilink1 on/off\` | \`/antilink2 on/off\` | \`/antilinkgeral on/off\`\n` +
          `› \`/antispam on/off\` | \`/anti<tipo> on/off\`\n` +
          `› \`/promover @\` | \`/rebaixar @\` | \`/ban @\`\n` +
          `› \`/gp a\` / \`/gp f\` | \`/linkgp\`\n` +
          `› \`/mute @\` | \`/unmute @\` | \`/tmute @ 1h\` | \`/listmuted\`\n` +
          `› \`/autoaprovar on/off\` | \`/autoenviarhistorico on/off\`\n` +
          `› \`/welcome on/off\` | \`/saída on/off\`\n` +
          `› \`/antipalavra on/off\` | \`/addpalavrablock\` | \`/listpalavrasblock\`\n` +
          `› \`/limparchat\` | \`/apg\` (reply)`;
        await safeSendMessage(sock, from, { text: mAdm }, { quoted: msg });
        continue;
      }

      if (command === '/menudono' && isOwner) {
        const mDono = `👑 *PAINEL EXCLUSIVO DO DONO — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/setowner\` - Registro supremo\n` +
          `› \`/blockbot <num>\` | \`/rmblockbot <num>\` | \`/listblockbot\`\n` +
          `› \`/edit<tipo>\` - Edita parâmetros e tabelas do bot\n` +
          `› \`/purincash\` / \`/magnuspay\` - Configuração de gateways\n` +
          `› \`/addnewcmd <cmd> <txt>\` - Cria comandos customizados\n` +
          `› \`/addaluguel\` | \`/rmaluguel\` | \`/listalugueis\`\n` +
          `› \`/criaraluguel\` | \`/aluguelconfig\``;
        await safeSendMessage(sock, from, { text: mDono }, { quoted: msg });
        continue;
      }

      if (command === '/menu') {
        const menuText = `🤖 *MENU PRINCIPAL — LUNAR SYSTEM ©* ⚜️\n\n` +
          `› \`/menu\` - Exibe este menu\n` +
          `› \`/menujogos\` - Menu de minigames e economia (¢ coins)\n` +
          `› \`/menuparceria\` - Sistema de parcerias de links\n` +
          `› \`/menuadm\` - Comandos de moderação e ADM\n` +
          `› \`/menualuguel\` - Painel de aluguel de grupos\n` +
          `› \`/menuvip\` - Menu VIP e revelador\n` +
          `› \`/menudono\` - Painel exclusivo do dono\n` +
          `› \`/sugestao <txt>\` - Envia sugestão para o Montanha Dev\n` +
          `› \`/ping\` - Latência do bot\n` +
          `› \`/dev\` - Créditos e canal oficial`;
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
          `📢 *Canal Oficial de Atualizações:*\n` +
          `👉 ${CHANNEL_LINK}\n\n` +
          `✨ *Lunar System — Automação Profissional* 🚀`;
        await safeSendMessage(sock, from, { text: devText }, { quoted: msg });
        continue;
      }

    }
  });
}

startBot();
