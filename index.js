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
      MAGNUS_SECRET: ""
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
    if (!data.rentalPlans) data.rentalPlans = {
      "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 2.00, feePercent: 10 },
      "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 30.00, feePercent: 30 },
      "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50 }
    };
    return data;
  } catch {
    return { ownerJid: null, ownerName: "MONTANHA DEV", ownerNumber: FIXED_OWNER_NUMBER, rentedGroups: {}, blacklistedUsers: [], customCommands: {}, groupSettings: {}, partners: {}, groupSchedules: {}, mutedUsers: {}, wallets: {}, groupRequests: {}, suggestions: {}, userProfessions: {}, userPickaxes: {}, userOres: {}, cooldowns: {}, shopProducts: {}, gameConfigs: { minSalary: 50, workCooldownHours: 24, robCooldownHours: 12, mineCooldownHours: 6 }, diceWinStreak: {}, suggestionCounter: 1, requestCounter: 1, rentalPlans: {} };
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
      
      // Se for código 515 (restart necessário após pareamento) ou 428, reinicia automaticamente para conectar
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
        const session = ownerInteractiveSessions.get(senderJid);

        if (session.step === 'SETOWNER_KEY') {
          ownerInteractiveSessions.delete(senderJid);
          if (trimmedText === loadKey()) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await safeSendMessage(sock, from, { text: `⚜️ *CADASTRADO COM SUCESSO!*\n\n👑 Você foi reconhecido como o Dono Supremo de ${cfg.BOT_NAME}!` }, { quoted: msg });
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

      if (!trimmedText.startsWith('/')) continue;

      const command = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      if (command === '/setowner') {
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        await safeSendMessage(sock, from, { text: `⚜️ *REGISTRO DE DONO SUPREMO* 👑\n\n💬 Envie a Key secreta neste chat:` }, { quoted: msg });
        continue;
      }

      if (command === '/purincash') {
        const info = `💳 *GATEWAY — PURINCASH* 🏦\nConfigure sua API Key com \`/setapi <chave>\` e \`/setsecret <secret>\`.`;
        await safeSendMessage(sock, from, { text: info }, { quoted: msg });
        continue;
      }
      if (command === '/magnuspay') {
        const info = `💳 *GATEWAY — MAGNUSPAY* 🏦\nConfigure suas credenciais no painel de desenvolvedor.`;
        await safeSendMessage(sock, from, { text: info }, { quoted: msg });
        continue;
      }
      if (command === '/setapi' && isOwner) {
        cfg.PURINCASH_API = args[0] || '';
        saveConfig(cfg);
        await safeSendMessage(sock, from, { text: `✅ API Key salva!` }, { quoted: msg });
        continue;
      }
      if (command === '/setsecret' && isOwner) {
        cfg.PURINCASH_SECRET = args[0] || '';
        saveConfig(cfg);
        await safeSendMessage(sock, from, { text: `✅ Secret salva!` }, { quoted: msg });
        continue;
      }

      if (command === '/criaraluguel' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CREATE_PLAN_ID' });
        await safeSendMessage(sock, from, { text: `🛠️ *CRIADOR DE PLANO* 💼\nDigite o ID único do plano:` }, { quoted: msg });
        continue;
      }
      if (command === '/aluguelconfig') {
        const plans = db.rentalPlans || {};
        let rep = `📋 *TABELA DE PLANOS DE ALUGUEL* 💼\n\n`;
        for (const [key, p] of Object.entries(plans)) {
          rep += `🆔 \`${key}\` | 🏷️ ${p.name} | 💵 R$ ${p.price.toFixed(2)} | 📊 Taxa: *${p.feePercent}%*\n`;
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      if (command === '/menuvip') {
        const vipMenu = `🌟 *MENU VIP — LUNAR SYSTEM ©* 👑\n\n` +
          `✨ *Comandos Exclusivos VIP:*\n` +
          `› \`/revelar\` - Responda (reply) a uma foto, vídeo ou áudio de visualização única para exibi-lo normalmente em modo público.\n\n` +
          `✦ Lunar System — Automação Profissional 🚀`;
        await safeSendMessage(sock, from, { text: vipMenu }, { quoted: msg });
        continue;
      }

      if (command === '/revelar') {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
          await safeSendMessage(sock, from, { text: "⚠️ Responda (reply) a uma mídia de visualização única (foto, vídeo ou áudio) com `/revelar`!" }, { quoted: msg });
          continue;
        }

        try {
          const type = getContentType(quotedMsg);
          const mediaMsg = quotedMsg[type];

          if (!mediaMsg?.viewOnce && type !== 'viewOnceMessage' && type !== 'viewOnceMessageV2') {
            await safeSendMessage(sock, from, { text: "⚠️ A mensagem respondida não parece ser uma mídia de visualização única!" }, { quoted: msg });
            continue;
          }

          const innerMsg = {
            message: quotedMsg.viewOnceMessage?.message || quotedMsg.viewOnceMessageV2?.message || quotedMsg
          };

          const mediaBuffer = await downloadMediaMessage(innerMsg, 'buffer', {}, { pino });
          const caption = mediaMsg.caption || "🔓 *Mídia revelada com sucesso pela Lunar System ©!* ✨";

          if (type.includes('image') || mediaMsg.mimetype?.includes('image')) {
            await safeSendMessage(sock, from, { image: mediaBuffer, caption: caption }, { quoted: msg });
          } else if (type.includes('video') || mediaMsg.mimetype?.includes('video')) {
            await safeSendMessage(sock, from, { video: mediaBuffer, caption: caption }, { quoted: msg });
          } else if (type.includes('audio') || mediaMsg.mimetype?.includes('audio')) {
            await safeSendMessage(sock, from, { audio: mediaBuffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { document: mediaBuffer, mimetype: mediaMsg.mimetype || 'application/octet-stream', fileName: 'revelado.bin', caption: caption }, { quoted: msg });
          }
        } catch (e) {
          await safeSendMessage(sock, from, { text: `❌ Erro ao revelar mídia: ${e.message}` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/ping') {
        const start = Date.now();
        await safeSendMessage(sock, from, { text: `🏓 Pong! Latência: ${Date.now() - start}ms | Lunar System 100% Operacional.` }, { quoted: msg });
        continue;
      }

      if (command === '/menudono' && isOwner) {
        const donoMenu = `🤖 *PAINEL DO DONO* 👑\n\n` +
          `› \`/criaraluguel\` - Cria plano personalizado\n` +
          `› \`/aluguelconfig\` - Lista planos e taxas\n` +
          `› \`/purincash\` / \`/magnuspay\` - Gateways\n` +
          `› \`/dev\` - Créditos e canal oficial`;
        await safeSendMessage(sock, from, { text: donoMenu }, { quoted: msg });
        continue;
      }

      if (command === '/menu') {
        const menuText = `🤖 *MENU PRINCIPAL — LUNAR SYSTEM* ⚜️\n\n` +
          `› \`/menu\` - Exibe este menu\n` +
          `› \`/menuvip\` - Acessa o menu VIP\n` +
          `› \`/menudono\` - Painel do dono\n` +
          `› \`/ping\` - Latência do bot\n` +
          `› \`/dev\` - Créditos e canal oficial`;
        await safeSendMessage(sock, from, { text: menuText }, { quoted: msg });
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
