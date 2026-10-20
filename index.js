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
const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbEDNzxFCCoUo724eo45';

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
    return JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8')).secretKey || "mtn";
  } catch {
    return "mtn";
  }
}

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      ownerJid: null,
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
    if (!data.rentalPlans) {
      data.rentalPlans = {
        "teste": { name: "Teste 1 Hora", days: 0, hours: 1, price: 2.00, feePercent: 0, type: "teste" },
        "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 4.50, feePercent: 10, type: "temp" },
        "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 90.00, feePercent: 30, type: "temp" },
        "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50, type: "permanente" }
      };
    }
    return data;
  } catch {
    return {};
  }
}

function saveDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function safeSendMessage(sock, jid, content, options = {}) {
  try {
    return await sock.sendMessage(jid, content, options);
  } catch {
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

      // SESSÕES INTERATIVAS DO DONO E SETOWNER
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
            await safeSendMessage(sock, from, { text: `🚫 *CHAVE INCORRETA!* A chave secreta informada não confere.` }, { quoted: msg });
          }
          continue;
        }

        if (session.step === 'CREATE_PLAN_ID') {
          session.planId = trimmedText.toLowerCase().replace(/\s+/g, '_');
          session.step = 'CREATE_PLAN_NAME';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `📝 Digite o **Nome Exibido** do plano (ex: Plano Trimestral):` }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_NAME') {
          session.planName = trimmedText;
          session.step = 'CREATE_PLAN_DAYS';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `📅 Quantos **Dias** durará o plano? (Digite \`9999\` para Plano Permanente):` }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_DAYS') {
          const days = parseInt(trimmedText);
          if (isNaN(days) || days <= 0) {
            await safeSendMessage(sock, from, { text: `⚠️ Informe um número válido de dias.` }, { quoted: msg });
            continue;
          }
          session.planDays = days;
          session.step = 'CREATE_PLAN_PRICE';
          ownerInteractiveSessions.set(senderJid, session);
          
          const isPerm = days >= 3650;
          const minText = isPerm ? "Mínimo obrigatório de R$ 150,00 para planos permanentes!" : "Digite o valor em Reais:";
          await safeSendMessage(sock, from, { text: `💵 ${minText}` }, { quoted: msg });
          continue;
        }

        if (session.step === 'CREATE_PLAN_PRICE') {
          const price = parseFloat(trimmedText.replace(',', '.'));
          const isPerm = session.planDays >= 3650;

          if (isNaN(price) || price <= 0) {
            await safeSendMessage(sock, from, { text: `⚠️ Valor inválido.` }, { quoted: msg });
            continue;
          }

          if (isPerm && price < 150.00) {
            await safeSendMessage(sock, from, { text: `🚫 *VALOR PROIBIDO!* O valor mínimo para planos permanentes deve ser de pelo menos **R$ 150,00**.\nDigite um valor válido:` }, { quoted: msg });
            continue;
          }

          let feePercent = 10; // Abaixo de 30 dias
          let pType = "temp";

          if (session.planDays > 30 && session.planDays < 3650) {
            feePercent = 30; // Acima de 30 dias
          } else if (session.planDays >= 3650) {
            feePercent = 50; // Permanente
            pType = "permanente";
          } else if (session.planDays <= 1) {
            feePercent = 10;
          }

          db.rentalPlans[session.planId] = {
            name: session.planName,
            days: session.planDays,
            price: price,
            feePercent: feePercent,
            type: pType
          };
          saveDatabase(db);
          ownerInteractiveSessions.delete(senderJid);

          await safeSendMessage(sock, from, { 
            text: `✅ *PLANO CRIADO COM SUCESSO!*\n\n` +
                  `📦 ID: \`${session.planId}\`\n` +
                  `🏷️ Nome: ${session.planName}\n` +
                  `⏳ Duração: ${session.planDays} dias\n` +
                  `💵 Preço: R$ ${price.toFixed(2)}\n` +
                  `📊 Taxa de Serviço Automática (Sua Comissao): *${feePercent}%*` 
          }, { quoted: msg });
          continue;
        }
      }

      if (!trimmedText.startsWith('/')) continue;

      const command = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // COMANDO FIXO E IMUNE /DEV COM O LINK DO CANAL OFICIAL
      if (command === '/dev') {
        const devText = `🤖 *INFORMATIONS & CREDITS — LUNAR SYSTEM ©* ⚜️\n\n` +
          `👑 *Desenvolvedor Chefe:* Montanha Dev\n` +
          `📱 *Contato Oficial:* +55 62 98252-0428\n` +
          `🛡️ *Empresa / Equipe:* Lunar System ©\n\n` +
          `📢 *Canal Oficial de Atualizações (Entre para receber melhorias e novas versões):*\n` +
          `👉 ${CHANNEL_LINK}\n\n` +
          `⚠️ *Aviso:* Este bot está em constante atualização e mudança no GitHub. Mantenha sempre seu repositório atualizado!\n\n` +
          `✨ *Lunar System — Automação Profissional* 🚀`;

        await safeSendMessage(sock, from, { text: devText }, { quoted: msg });
        continue;
      }

      // COMANDO /SETOWNER
      if (command === '/setowner') {
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        const reqKeyMsg = `⚜️ *REGISTRO DE DONO SUPREMO — ${cfg.BOT_NAME}* 👑\n\n` +
          `🛡️ Para cadastrar seu número como Dono Supremo do bot, é necessária a confirmação da chave secreta de acesso.\n\n` +
          `💬 *Envie a Key secreta neste chat agora para prosseguir:*`;
        
        await safeSendMessage(sock, from, { text: reqKeyMsg }, { quoted: msg });
        continue;
      }

      // GESTÃO DE ALUGUEL E CRIAÇÃO DE PLANOS
      if (command === '/criaraluguel' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CREATE_PLAN_ID' });
        await safeSendMessage(sock, from, { text: `🛠️ *CRIADOR DE PLANO DE ALUGUEL* 💼\n\nDigite o **ID único** do plano (ex: \`trimestral\`, \`anual\`, \`permanente\`, sem espaços):` }, { quoted: msg });
        continue;
      }

      if (command === '/listarlugueisconfig' || command === '/aluguelconfig') {
        const plans = db.rentalPlans || {};
        let rep = `📋 *TABELA DE PLANOS DE ALUGUEL ATIVOS* 💼\n\n`;
        for (const [key, p] of Object.entries(plans)) {
          rep += `🆔 ID: \`${key}\`\n` +
            `🏷️ Nome: ${p.name}\n` +
            `⏳ Duração: ${p.days === 9999 ? 'Permanente' : p.days + ' dias'}\n` +
            `💵 Preço: R$ ${p.price.toFixed(2)}\n` +
            `📊 Taxa Automática (Sua Comissao): *${p.feePercent}%*\n` +
            `──────────────────────────\n`;
        }
        await safeSendMessage(sock, from, { text: rep }, { quoted: msg });
        continue;
      }

      // COMANDOS DE GATEWAY
      if (command === '/purincash') {
        const purinInfo = `💳 *GATEWAY DE PAGAMENTOS — PURINCASH* 🏦\n\n` +
          `🔹 *Sobre:* Infraestrutura de PIX e pagamentos em tempo real.\n` +
          `🛠️ *Como integrar:*\n` +
          `1️⃣ Acesse \`https://purincash.com/\` e crie sua conta.\n` +
          `2️⃣ Copie sua API Key e seu Secret.\n` +
          `3️⃣ Use \`/setapi <chave>\` e \`/setsecret <secret>\``;
        await safeSendMessage(sock, from, { text: purinInfo }, { quoted: msg });
        continue;
      }

      if (command === '/magnuspay') {
        const magnusInfo = `💳 *GATEWAY DE PAGAMENTOS — MAGNUSPAY* 🏦\n\n` +
          `🔹 *Sobre:* Gateway parceiro focado em automações.\n` +
          `🛠️ Acesse \`https://magnuspay.com.br/\` para obter suas credenciais.`;
        await safeSendMessage(sock, from, { text: magnusInfo }, { quoted: msg });
        continue;
      }

      if (command === '/setapi' && isOwner) {
        cfg.PURINCASH_API = args[0] || '';
        saveConfig(cfg);
        await safeSendMessage(sock, from, { text: `✅ API Key salva com sucesso!` }, { quoted: msg });
        continue;
      }

      if (command === '/setsecret' && isOwner) {
        cfg.PURINCASH_SECRET = args[0] || '';
        saveConfig(cfg);
        await safeSendMessage(sock, from, { text: `✅ Secret Key salva com sucesso!` }, { quoted: msg });
        continue;
      }

      // MENU DO DONO
      if (command === '/menudono') {
        if (!isOwner) {
          await safeSendMessage(sock, from, { text: "❌ Comando restrito ao Dono Supremo!" }, { quoted: msg });
          continue;
        }

        const donoMenu = `🤖 *${cfg.BOT_NAME} — PAINEL DO DONO* 👑\n\n` +
          `💼 💰 GESTÃO DE ALUGUEL & TAXAS\n` +
          `› \`/criaraluguel\` - Cria novo plano (Mensal, Anual, Permanente)\n` +
          `› \`/aluguelconfig\` - Lista todos os planos e taxas\n\n` +
          `💳 💸 GATEWAYS DE PAGAMENTO\n` +
          `› \`/purincash\` / \`/magnuspay\` - Info de gateways\n` +
          `› \`/setapi\` / \`/setsecret\` - Configura credenciais\n\n` +
          `🛡️ ⚜️ SISTEMA\n` +
          `› \`/dev\` - Créditos e canal oficial de updates\n\n` +
          `✦ ${cfg.COMPANY_NAME} ✨`;

        await safeSendMessage(sock, from, { text: donoMenu }, { quoted: msg });
        continue;
      }

      // MENU PRINCIPAL
      if (command === '/menu') {
        const menuText = `🤖 *${cfg.BOT_NAME} — MENU PRINCIPAL* ⚜️\n\n` +
          `💎 📋 MENUS & UTILITÁRIOS\n` +
          `› \`/menu\` - Exibe este menu\n` +
          `› \`/menudono\` - Painel do dono\n` +
          `› \`/dev\` - Créditos e canal oficial de atualizações\n` +
          `› \`/purincash\` / \`/magnuspay\` - Info de pagamentos\n\n` +
          `✦ ${cfg.COMPANY_NAME} ✨`;

        await safeSendMessage(sock, from, { text: menuText }, { quoted: msg });
        continue;
      }

    }
  });
}

startBot();
