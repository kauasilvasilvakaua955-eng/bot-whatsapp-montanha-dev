const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const purincash = require('./services/purincash');

const DB_PATH = path.join(__dirname, 'database.json');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const KEY_PATH = path.join(__dirname, 'Key_fullacess.json');

const ownerInteractiveSessions = new Map();
const spamTracker = new Map();
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
  console.log("📦 Total de comandos carregados: " + commands.size);
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
      groupSettings: {},
      wallets: {},
      rentalPlans: {
        "teste": { name: "Teste 1 Hora", hours: 1, price: 2.00, fee: 0.0 },
        "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 4.50, fee: 0.50 },
        "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 90.00, fee: 30.0 }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return {}; }
}

function saveDatabase(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const questionAsync = (query) => new Promise((resolve) => rl.question(query, resolve));

async function startBot() {
  loadCommands();
  const config = loadConfig();
  console.log(`\n========================================`);
  console.log(`🤖 INICIALIZANDO ${config.BOT_NAME} - ${config.COMPANY_NAME}`);
  console.log(`========================================\n`);

  let defaultNum = config.OWNER_NUMBER;
  const hasSession = fs.existsSync('./session') && fs.readdirSync('./session').length > 0;

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
      } catch (err) { console.error('❌ Erro ao solicitar código:', err.message); }
    }, 4000);
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ Conexão fechada. Reconectando...`);
      if (shouldReconnect) setTimeout(() => startBot(), 4000);
    } else if (connection === 'open') {
      console.log(`\n✅ ${config.BOT_NAME} CONECTADO COM SUCESSO VIA LUNAR SYSTEM ENGINE!\n`);
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

      if (db.blacklistedUsers && (db.blacklistedUsers.includes(senderJid) || db.blacklistedUsers.includes(userNumber))) continue;

      const text = msg.message.conversation ||
                   msg.message.extendedTextMessage?.text ||
                   msg.message.imageMessage?.caption ||
                   '';

      const trimmedText = text.trim();
      const isOwner = db.ownerJid && (
        senderJid === db.ownerJid ||
        senderJid.split('@')[0] === db.ownerJid.split('@')[0]
      );

      // Sessões interativas (Setowner e Configs)
      if (ownerInteractiveSessions.has(senderJid)) {
        const session = ownerInteractiveSessions.get(senderJid);
        if (session.step === 'SETOWNER_KEY') {
          ownerInteractiveSessions.delete(senderJid);
          if (trimmedText === loadKey()) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await safeSendMessage(sock, from, { text: `⚜️ *CADASTRADO COM SUCESSO!*\n\n👑 Você foi reconhecido como o Dono Supremo!` }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { text: `🚫 *CHAVE INCORRETA!*` }, { quoted: msg });
          }
          continue;
        }
      }

      if (!trimmedText.startsWith('/')) continue;

      const commandName = trimmedText.split(' ')[0].slice(1).toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // Comandos nativos imunes e gateway
      if (commandName === 'dev') {
        const devText = `🤖 *INFORMATIONS & CREDITS — LUNAR SYSTEM ©* ⚜️\n\n` +
          `👑 *Desenvolvedor Chefe:* Montanha Dev\n` +
          `📱 *Contato Oficial:* +55 62 98252-0428\n` +
          `🛡️ *Equipe / Empresa:* Lunar System ©\n\n` +
          `✨ *Lunar System — Automação Profissional* 🚀`;
        await safeSendMessage(sock, from, { text: devText }, { quoted: msg });
        continue;
      }

      if (commandName === 'setowner') {
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        await safeSendMessage(sock, from, { text: `⚜️ *REGISTRO DE DONO SUPREMO*\n\n💬 Envie a Key secreta neste chat:` }, { quoted: msg });
        continue;
      }

      // Execução dos comandos modulares salvos nas pastas
      if (commands.has(commandName)) {
        const cmd = commands.get(commandName);
        try {
          await cmd.execute({ sock, from, isGroup, senderJid, userNumber, isOwner, msg, args, cfg, db, saveDatabase, ownerInteractiveSessions, commands });
        } catch (err) {
          console.error("Erro no comando /" + commandName + ":", err.message);
        }
      }

    }
  });
}

startBot();
