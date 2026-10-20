const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const KEY_PATH = path.join(__dirname, 'Key_fullacess.json');

const ownerInteractiveSessions = new Map();
const commands = new Map();

function loadCommands(dirPath = path.join(__dirname, 'commands')) {
  commands.clear();
  if (!fs.existsSync(dirPath)) return;
  const categories = fs.readdirSync(dirPath);
  for (const category of categories) {
    const catPath = path.join(dirPath, category);
    if (fs.statSync(catPath).isDirectory()) {
      const files = fs.readdirSync(catPath).filter(file => file.endsWith('.js'));
      for (const file of files) {
        try {
          delete require.cache[require.resolve(path.join(catPath, file))];
          const cmd = require(path.join(catPath, file));
          if (cmd.name && typeof cmd.execute === 'function') {
            commands.set(cmd.name.toLowerCase(), cmd);
          }
        } catch (err) {
          console.error("Erro ao carregar comando " + file + ":", err.message);
        }
      }
    }
  }
  console.log("📦 Comandos modulares carregados: " + commands.size);
}

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')); }
  catch { return { BOT_NAME: "LUNAR BOT", OWNER_NAME: "MONTANHA DEV", OWNER_NUMBER: "5562982520428", COMPANY_NAME: "LUNAR SYSTEM ©" }; }
}

function saveConfig(cfg) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); }
function loadKey() {
  try { return JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8')).secretKey || "mtn"; }
  catch { return "mtn"; }
}

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      ownerJid: null,
      ownerNumber: "5562982520428",
      rentedGroups: {},
      blacklistedUsers: [],
      antiLinkGeral: {},
      antiLink1: {},
      antiLink2: {},
      rentalPlans: {
        "teste": { name: "Teste 1 Hora", days: 0, hours: 1, price: 2.00, feePercent: 0, type: "teste" },
        "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 4.50, feePercent: 10, type: "temp" },
        "7_dias": { name: "7 Dias de Aluguel", days: 7, price: 25.00, feePercent: 10, type: "temp" },
        "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 90.00, feePercent: 30, type: "temp" },
        "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50, type: "permanente" }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (!data.antiLinkGeral) data.antiLinkGeral = {};
    if (!data.antiLink1) data.antiLink1 = {};
    if (!data.antiLink2) data.antiLink2 = {};
    return data;
  } catch { return {}; }
}

function saveDatabase(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const questionAsync = (query) => new Promise((resolve) => rl.question(query, resolve));

async function startBot() {
  loadCommands();
  const config = loadConfig();
  console.log("\n========================================");
  console.log("🤖 INICIALIZANDO " + config.BOT_NAME + " - " + config.COMPANY_NAME);
  console.log("========================================\n");

  let defaultNum = config.OWNER_NUMBER;
  const hasSession = fs.existsSync('./session') && fs.readdirSync('./session').length > 0;

  if (!hasSession) {
    const inputNum = await questionAsync("📱 Digite o número do WhatsApp para conexão (ex: 5599999999999): ");
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
    browser: ['Chrome (Linux)', 'Chrome', '121.0.6167.159'],
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
        console.log("🔑 CÓDIGO DE PAREAMENTO: " + pairingCode);
        console.log('========================================\n');
      } catch (err) { console.error('❌ Erro ao solicitar código:', err.message); }
    }, 4000);
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log("⚠️ Conexão fechada (Código: " + (statusCode || 'Desconhecido') + "). Reconectando...");
      if (shouldReconnect) setTimeout(() => startBot(), 3000);
    } else if (connection === 'open') {
      console.log("\n✅ " + config.BOT_NAME + " CONECTADO COM SUCESSO!\n");
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
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

      // Proteção Anti-Link
      if (isGroup && !isOwner) {
        const lowerText = trimmedText.toLowerCase();
        const hasLink = lowerText.includes('http://') || lowerText.includes('https://') || lowerText.includes('chat.whatsapp.com') || lowerText.includes('t.me/');
        if (hasLink) {
          if ((db.antiLinkGeral && db.antiLinkGeral[from]) || (db.antiLink1 && db.antiLink1[from]) || (db.antiLink2 && db.antiLink2[from])) {
            await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            continue;
          }
        }
      }

      // Sessões Interativas
      if (ownerInteractiveSessions.has(senderJid)) {
        const session = ownerInteractiveSessions.get(senderJid);
        if (session.step === 'SETOWNER_KEY') {
          ownerInteractiveSessions.delete(senderJid);
          if (trimmedText === loadKey()) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await sock.sendMessage(from, { text: "⚜️ *CADASTRADO COM SUCESSO!*\n\n👑 Você foi reconhecido como o Dono Supremo!" }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { text: "🚫 *CHAVE INCORRETA!*" }, { quoted: msg });
          }
          continue;
        }

        if (session.step === 'CREATE_PLAN_ID') {
          session.planId = trimmedText.toLowerCase().replace(/\s+/g, '_');
          session.step = 'CREATE_PLAN_NAME';
          ownerInteractiveSessions.set(senderJid, session);
          await sock.sendMessage(from, { text: "📝 Digite o **Nome Exibido** do plano:" }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_NAME') {
          session.planName = trimmedText;
          session.step = 'CREATE_PLAN_DAYS';
          ownerInteractiveSessions.set(senderJid, session);
          await sock.sendMessage(from, { text: "📅 Quantos **Dias** durará o plano? (9999 para Permanente):" }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_DAYS') {
          const days = parseInt(trimmedText);
          if (isNaN(days) || days <= 0) continue;
          session.planDays = days;
          session.step = 'CREATE_PLAN_PRICE';
          ownerInteractiveSessions.set(senderJid, session);
          await sock.sendMessage(from, { text: days >= 3650 ? "Mínimo obrigatório de R$ 150,00 para permanentes!" : "Digite o valor em Reais:" }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_PRICE') {
          const price = parseFloat(trimmedText.replace(',', '.'));
          const isPerm = session.planDays >= 3650;
          if (isNaN(price) || price <= 0 || (isPerm && price < 150.00)) continue;

          let feePercent = session.planDays > 30 ? (isPerm ? 50 : 30) : 10;
          db.rentalPlans[session.planId] = { name: session.planName, days: session.planDays, price, feePercent, type: isPerm ? "permanente" : "temp" };
          saveDatabase(db);
          ownerInteractiveSessions.delete(senderJid);
          await sock.sendMessage(from, { text: "✅ *PLANO CRIADO COM SUCESSO!*" }, { quoted: msg });
          continue;
        }
      }

      if (!trimmedText.startsWith('/')) continue;

      const commandName = trimmedText.split(' ')[0].slice(1).toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // Execução Dinâmica dos Comandos por Pasta
      if (commands.has(commandName)) {
        const cmd = commands.get(commandName);
        try {
          await cmd.execute({ sock, from, isGroup, senderJid, userNumber, isOwner, msg, args, cfg, db, saveDatabase, ownerInteractiveSessions, commands });
        } catch (err) {
          console.error("Erro ao executar comando /" + commandName + ":", err.message);
        }
      }

    }
  });
}

startBot();
