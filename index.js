const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_PATH = path.join(__dirname, 'dados', 'src', 'config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {
      botName: "LUNAR BOT",
      ownerName: "MONTANHA DEV",
      ownerNumber: "5562982520428",
      lidOwner: "",
      companyName: "LUNAR SYSTEM ©",
      prefix: "#",
      gatewayActive: "purincash"
    };
  }
}

const commands = new Map();
function loadCommandsRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      loadCommandsRecursive(fullPath);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      try {
        delete require.cache[require.resolve(fullPath)];
        const cmdModule = require(fullPath);
        if (cmdModule && cmdModule.name) {
          commands.set(cmdModule.name.toLowerCase(), cmdModule);
          if (Array.isArray(cmdModule.aliases)) {
            for (const alias of cmdModule.aliases) {
              commands.set(alias.toLowerCase(), cmdModule);
            }
          }
        }
      } catch (err) {
        console.error(`Erro ao carregar comando ${fullPath}:`, err.message);
      }
    }
  }
}
loadCommandsRecursive(path.join(__dirname, 'comandos'));

async function startBot() {
  const config = loadConfig();
  console.log(`\n========================================`);
  console.log(`🤖 INICIALIZANDO ${config.botName} — ${config.companyName}`);
  console.log(`📂 Estrutura e engine baseadas no modelo Nazuna carregadas (${commands.size} comandos)`);
  console.log(`========================================\n`);

  let defaultNum = config.ownerNumber;
  const hasSession = fs.existsSync(path.join(__dirname, 'dados', 'session')) && fs.readdirSync(path.join(__dirname, 'dados', 'session')).length > 0;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const questionAsync = (query) => new Promise((resolve) => rl.question(query, resolve));

  if (!hasSession) {
    const inputNum = await questionAsync(`📱 Digite o número do WhatsApp para conexão (ex: 5562982520428): `);
    if (inputNum && inputNum.trim().length > 8) {
      defaultNum = inputNum.trim().replace(/\D/g, '');
      config.ownerNumber = defaultNum;
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    }
  }
  rl.close();

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'dados', 'session'));
  const { version } = await fetchLatestBaileysVersion();

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
      }
    } else if (connection === 'open') {
      console.log(`\n✅ ${config.botName} CONECTADO COM SUCESSO (ENGINE NAZUNA STYLE)!\n`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      if (!from.endsWith('@g.us')) continue; // 100% exclusivo para grupos (@g.us)

      const senderJid = msg.key.participant || msg.key.remoteJid;
      const userNumber = senderJid.split('@')[0].split(':')[0];
      const cfg = loadConfig();

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '';
      const trimmedText = text.trim();

      if (!trimmedText.startsWith(cfg.prefix)) continue;

      const body = trimmedText.slice(cfg.prefix.length).trim();
      const args = body.split(' ');
      const commandKey = args[0].toLowerCase();
      const commandArgs = args.slice(1);

      if (commands.has(commandKey)) {
        const cmd = commands.get(commandKey);
        try {
          await cmd.execute(sock, msg, from, commandArgs, senderJid, userNumber, cfg);
        } catch (e) {
          console.error(`Erro ao executar o comando ${commandKey}:`, e);
          await sock.sendMessage(from, { text: `❌ Erro interno ao executar o comando \`${commandKey}\`.` }, { quoted: msg });
        }
      }
    }
  });
}

startBot();
