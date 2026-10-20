const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const QRCode = require('qrcode');
const purincash = require('./services/purincash');

const DB_PATH = path.join(__dirname, 'database.json');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const KEY_PATH = path.join(__dirname, 'Key_fullacess.json');

const ownerInteractiveSessions = new Map();
const spamTracker = new Map();
const tictactoeGames = new Map();
const tictactoeInvites = new Map();

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return { BOT_NAME: "LUNAR BOT", OWNER_NAME: "MONTANHA DEV", OWNER_NUMBER: "5562982520428", COMPANY_NAME: "LUNAR SYSTEM ©" };
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

function loadKey() {
  try {
    const data = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'));
    return data.secretKey || "mtn";
  } catch {
    return "mtn";
  }
}

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      ownerJid: null,
      ownerName: "MONTANHA DEV",
      ownerNumber: "5562982520428",
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
        "teste": { name: "Teste 1 Hora", hours: 1, price: 2.00, fee: 0.0 },
        "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 4.50, fee: 0.50 },
        "3_dias": { name: "3 Dias de Aluguel", days: 3, price: 12.00, fee: 1.00 },
        "5_dias": { name: "5 Dias de Aluguel", days: 5, price: 18.00, fee: 1.50 },
        "7_dias": { name: "7 Dias de Aluguel", days: 7, price: 25.00, fee: 2.00 },
        "15_dias": { name: "15 Dias de Aluguel", days: 15, price: 50.00, fee: 5.00 },
        "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 90.00, fee: 30.0 }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getBalance(db, userJid) {
  if (db.wallets[userJid] === undefined) {
    db.wallets[userJid] = 10;
    saveDatabase(db);
  }
  return db.wallets[userJid];
}

function updateBalance(db, userJid, amount) {
  const current = getBalance(db, userJid);
  db.wallets[userJid] = Math.max(0, current + amount);
  saveDatabase(db);
  return db.wallets[userJid];
}

function isGroupRented(rentedGroups, groupJid) {
  const group = rentedGroups[groupJid];
  if (!group || !group.expireAt) return false;
  return Date.now() < group.expireAt;
}

async function safeSendMessage(sock, jid, content, options = {}) {
  try {
    return await sock.sendMessage(jid, content, options);
  } catch (err) {
    return null;
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const questionAsync = (query) => new Promise((resolve) => rl.question(query, resolve));

async function startBot() {
  const config = loadConfig();
  console.log(`\n========================================`);
  console.log(`🤖 INICIALIZANDO ${config.BOT_NAME} -${config.COMPANY_NAME}`);
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
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ Conexão fechada. Reconectando automaticamente...`);
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

      // SESSÕES INTERATIVAS DO DONO E SETOWNER COM CHAVE SECRETA
      if (ownerInteractiveSessions.has(senderJid)) {
        const session = ownerInteractiveSessions.get(senderJid);

        if (session.step === 'SETOWNER_KEY') {
          const typedKey = trimmedText;
          const validKey = loadKey();
          ownerInteractiveSessions.delete(senderJid);

          if (typedKey === validKey) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await safeSendMessage(sock, from, { text: `⚜️ *CADASTRADO COM SUCESSO!*\n\n👑 Você foi reconhecido como o Dono Supremo de ${cfg.BOT_NAME}!` }, { quoted: msg });
            await safeSendMessage(sock, from, { text: `🤖 Olá chefe(a) 👑, estou a suas ordens ⚜️🚀` }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { text: `🚫 *CHAVE INCORRETA!* A chave secreta informada não confere com o arquivo de segurança.` }, { quoted: msg });
          }
          continue;
        }

        if (session.step === 'CONFIG_BOT_NAME') {
          cfg.BOT_NAME = trimmedText;
          saveConfig(cfg);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ Nome do bot alterado para: *${trimmedText}*` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CONFIG_OWNER_NAME') {
          cfg.OWNER_NAME = trimmedText;
          saveConfig(cfg);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ Nome do Owner alterado para: *${trimmedText}*` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CONFIG_COMPANY_NAME') {
          cfg.COMPANY_NAME = trimmedText;
          saveConfig(cfg);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ Nome da Equipe alterado para: *${trimmedText}*` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CONFIG_SET_API') {
          cfg.PURINCASH_API = trimmedText;
          saveConfig(cfg);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ API Key da PurinCash configurada com sucesso!` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CONFIG_SET_SECRET') {
          cfg.PURINCASH_SECRET = trimmedText;
          saveConfig(cfg);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ Secret Key da PurinCash configurada com sucesso!` }, { quoted: msg });
          continue;
        }
      }

      // PROTEÇÕES AVANÇADAS EM GRUPOS
      if (isGroup && !isOwner) {
        const settings = db.groupSettings[from] || {};

        // Anti-Fake (DDI diferente de 55)
        if (settings.antifakes && !userNumber.startsWith('55')) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
          await sock.groupParticipantsUpdate(from, [senderJid], 'remove').catch(() => {});
          await safeSendMessage(sock, from, { text: `🛡️ 🚫 @${userNumber} foi banido automaticamente (Anti-Fakes: Apenas números do Brasil +55 são permitidos).`, mentions: [senderJid] });
          continue;
        }

        // Anti-Spam
        if (settings.antispam) {
          const now = Date.now();
          if (!spamTracker.has(senderJid)) spamTracker.set(senderJid, []);
          const userMsgs = spamTracker.get(senderJid).filter(t => now - t < 3000);
          userMsgs.push(now);
          spamTracker.set(senderJid, userMsgs);

          if (userMsgs.length >= 5) {
            await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            await safeSendMessage(sock, from, { text: `🛡️ ⚠️ @${userNumber} teve a mensagem apagada por motivo de Anti-Spam!`, mentions: [senderJid] });
            continue;
          }
        }

        // Filtros Anti específicos
        if (settings.antimensagens && (msg.message.conversation || msg.message.extendedTextMessage)) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.antifotos && msg.message.imageMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.anti_audios && msg.message.audioMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.antilocalizacao && msg.message.locationMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.antiarquivos && msg.message.documentMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.antifigurinhas && msg.message.stickerMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.anticatalogos && msg.message.productMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.antienquetes && msg.message.pollCreationMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
        if (settings.anticontatos && msg.message.contactMessage) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {}); continue;
        }
      }

      if (!trimmedText.startsWith('/')) continue;

      const command = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // COMANDO FIXO E IMUNE /DEV
      if (command === '/dev') {
        const devText = `🤖 *INFORMATIONS & CREDITS — LUNAR SYSTEM ©* ⚜️\n\n` +
          `👑 *Desenvolvedor Chefe:* Montanha Dev\n` +
          `📱 *Contato Oficial:* +55 62 98252-0428\n` +
          `🛡️ *Equipe / Empresa:* Lunar System ©\n\n` +
          `⚠️ *Aviso Legal:* Este bot foi desenvolvido para ser comercializado e distribuído exclusivamente através dos canais oficiais do criador. Caso não tenha adquirido ou recebido através de um vídeo oficial do Montanha Dev, desconfie e entre em contato imediatamente!\n\n` +
          `✨ *Lunar System — Automação Profissional* 🚀`;

        await safeSendMessage(sock, from, { text: devText }, { quoted: msg });
        continue;
      }

      // COMANDO /SETOWNER COM CHAVE SECRETA
      if (command === '/setowner') {
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        const reqKeyMsg = `⚜️ *REGISTRO DE DONO SUPREMO — ${cfg.BOT_NAME}* 👑\n\n` +
          `🛡️ Para cadastrar seu número como Dono Supremo do bot, é necessária a confirmação da chave secreta de acesso.\n\n` +
          `💬 *Envie a Key secreta neste chat agora para prosseguir:*`;
        
        await safeSendMessage(sock, from, { text: reqKeyMsg }, { quoted: msg });
        continue;
      }

      // COMANDOS DE GATEWAY: PURINCASH E MAGNUSPAY
      if (command === '/purincash') {
        const purinInfo = `💳 *GATEWAY DE PAGAMENTOS — PURINCASH* 🏦\n\n` +
          `🔹 *Sobre:* A PurinCash é a infraestrutura ideal para receber via PIX, cartão e boleto com alta conversão e API em tempo real.\n` +
          `💵 *Taxas e Custos:* R$ 0,50 por venda aprovada.\n\n` +
          `🛠️ *Como integrar e pegar a API Key:*\n` +
          `1️⃣ Acesse o site oficial: \`https://purincash.com/\`\n` +
          `2️⃣ Crie sua conta gratuita com os dados da sua loja.\n` +
          `3️⃣ No seu painel, vá em Integrações / API e copie sua \`API Key\` e seu \`Secret\`.\n` +
          `4️⃣ Cadastre no bot usando os comandos:\n` +
             `   👉 \`/setapi <sua_api_key>\`\n` +
             `   👉 \`/setsecret <seu_secret>\`\n\n` +
          `✨ *Lunar System © Integration* 🚀`;

        await safeSendMessage(sock, from, { text: purinInfo }, { quoted: msg });
        continue;
      }

      if (command === '/magnuspay') {
        const magnusInfo = `💳 *GATEWAY DE PAGAMENTOS — MAGNUSPAY* 🏦\n\n` +
          `🔹 *Sobre:* MagnusPay é o gateway focado em PMEs com PIX integrado, cripto e suporte a cartões de crédito.\n` +
          `💵 *Taxas e Custos:* 1% + R$ 0,50 por PIX recebido (com opção de repasse automático ao pagador).\n\n` +
          `🛠️ *Como integrar:*\n` +
          `1️⃣ Acesse o site oficial: \`https://magnuspay.com.br/\`\n` +
          `2️⃣ Abra sua conta gratuita em segundos.\n` +
          `3️⃣ Obtenha suas credenciais de API no painel de desenvolvedor.\n\n` +
          `✨ *Lunar System © Integration* 🚀`;

        await safeSendMessage(sock, from, { text: magnusInfo }, { quoted: msg });
        continue;
      }

      if (command === '/setapi' && isOwner) {
        if (!args[0]) {
          ownerInteractiveSessions.set(senderJid, { step: 'CONFIG_SET_API' });
          await safeSendMessage(sock, from, { text: `⚙️ Envie a nova **API Key** da PurinCash:` }, { quoted: msg });
        } else {
          cfg.PURINCASH_API = args[0];
          saveConfig(cfg);
          await safeSendMessage(sock, from, { text: `✅ API Key atualizada com sucesso!` }, { quoted: msg });
        }
        continue;
      }

      if (command === '/setsecret' && isOwner) {
        if (!args[0]) {
          ownerInteractiveSessions.set(senderJid, { step: 'CONFIG_SET_SECRET' });
          await safeSendMessage(sock, from, { text: `⚙️ Envie o novo **Secret** da PurinCash:` }, { quoted: msg });
        } else {
          cfg.PURINCASH_SECRET = args[0];
          saveConfig(cfg);
          await safeSendMessage(sock, from, { text: `✅ Secret Key atualizada com sucesso!` }, { quoted: msg });
        }
        continue;
      }

      // COMANDOS DE EDIÇÃO DAS INFORMAÇÕES DO BOT
      if (command === '/editbotname' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CONFIG_BOT_NAME' });
        await safeSendMessage(sock, from, { text: `🤖 Envie o novo **Nome do Bot**:` }, { quoted: msg });
        continue;
      }
      if (command === '/editownername' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CONFIG_OWNER_NAME' });
        await safeSendMessage(sock, from, { text: `👑 Envie o novo **Nome do Owner**:` }, { quoted: msg });
        continue;
      }
      if (command === '/editequipe' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CONFIG_COMPANY_NAME' });
        await safeSendMessage(sock, from, { text: `⚜️ Envie o novo **Nome da Empresa/Equipe**:` }, { quoted: msg });
        continue;
      }

      // MENU DO DONO & CONFIGURAÇÕES
      if (command === '/menudono') {
        if (!isOwner) {
          await safeSendMessage(sock, from, { text: "❌ Comando restrito ao Dono Supremo!" }, { quoted: msg });
          continue;
        }

        const donoMenu = `🤖 *${cfg.BOT_NAME} — PAINEL DO DONO* 👑\n\n` +
          `💎 ⚙️ CONFIGURAÇÕES E IDENTIDADE\n` +
          `› \`/editbotname\` - Altera o nome do bot\n` +
          `› \`/editownername\` - Altera o nome do owner\n` +
          `› \`/editequipe\` - Altera o nome da equipe\n\n` +
          `💳 💸 GATEWAYS DE PAGAMENTO\n` +
          `› \`/purincash\` - Documentação e tutorial PurinCash\n` +
          `› \`/magnuspay\` - Documentação MagnusPay\n` +
          `› \`/setapi\` - Configura a API Key\n` +
          `› \`/setsecret\` - Configura o Secret Key\n\n` +
          `🛡️ ⚜️ GERENCIAMENTO & SISTEMA\n` +
          `› \`/dev\` - Exibe créditos oficiais e imunes\n` +
          `› \`/listalugueis\` - Lista grupos alugados\n` +
          `› \`/ang\` - Dispara comunicado global\n\n` +
          `✦ ${cfg.COMPANY_NAME} ✨`;

        await safeSendMessage(sock, from, { text: donoMenu }, { quoted: msg });
        continue;
      }

      // PROTEÇÕES AVANÇADAS CONFIGURAÇÃO EM GRUPO (ADM)
      if (isGroup && ['/antispam', '/antifakes', '/antimensagens', '/antifotos', '/anti_audios', '/antilocalizacao', '/antiarquivos', '/antifigurinhas', '/anticatalogos', '/antienquetes', '/anticontatos'].includes(command)) {
        const groupMetadata = await sock.groupMetadata(from).catch(() => null);
        const participants = groupMetadata?.participants || [];
        const senderParticipant = participants.find(p => p.id === senderJid);
        const isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

        if (!isSenderAdmin && !isOwner) {
          await safeSendMessage(sock, from, { text: "⚠️ Apenas administradores podem configurar proteções!" }, { quoted: msg });
          continue;
        }

        const stateArg = args[0]?.toLowerCase();
        if (stateArg !== 'on' && stateArg !== 'off') {
          await safeSendMessage(sock, from, { text: `⚠️ Uso correto: \`${command} on\` ou \`${command} off\`` }, { quoted: msg });
          continue;
        }

        if (!db.groupSettings[from]) db.groupSettings[from] = {};
        const settingKey = command.replace('/', '');
        db.groupSettings[from][settingKey] = (stateArg === 'on');
        saveDatabase(db);

        await safeSendMessage(sock, from, { text: `🛡️ Proteção \`${settingKey}\` alterada com sucesso para: *${stateArg.toUpperCase()}* 🟢` });
        continue;
      }

      // MENU PRINCIPAL
      if (command === '/menu') {
        const menuText = `🤖 *${cfg.BOT_NAME} — MENU PRINCIPAL* ⚜️\n\n` +
          `💎 📋 MENUS & UTILITÁRIOS\n` +
          `› \`/menu\` - Exibe este menu principal\n` +
          `› \`/menudono\` - Painel de controle do dono\n` +
          `› \`/dev\` - Informações e créditos oficiais\n` +
          `› \`/purincash\` - Info e docs de pagamentos\n` +
          `› \`/magnuspay\` - Info MagnusPay\n\n` +
          `🛡️ ⚙️ PROTEÇÕES AVANÇADAS (ADM)\n` +
          `› \`/antispam <on/off>\` - Anti-flood\n` +
          `› \`/antifakes <on/off>\` - Bloqueio de DDI gringo\n` +
          `› \`/anti fotos <on/off>\` - Bloqueio de mídias\n\n` +
          `✦ ${cfg.COMPANY_NAME} ✨`;

        await safeSendMessage(sock, from, { text: menuText }, { quoted: msg });
        continue;
      }

    }
  });
}

startBot();
