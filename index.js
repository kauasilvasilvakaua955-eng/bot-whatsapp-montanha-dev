const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
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
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    cfg.PURINCASH_API = purincash.apiKey;
    cfg.PURINCASH_SECRET = purincash.apiSecret;
    cfg.GATEWAY_ACTIVE = "purincash";
    return cfg;
  } catch {
    return {
      BOT_NAME: "LUNAR BOT",
      OWNER_NAME: "MONTANHA DEV",
      OWNER_NUMBER: FIXED_OWNER_NUMBER,
      COMPANY_NAME: "LUNAR SYSTEM ©",
      GATEWAY_ACTIVE: "purincash",
      PURINCASH_API: purincash.apiKey,
      PURINCASH_SECRET: purincash.apiSecret,
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
      mutedUsers: {},
      wallets: {},
      groupRequests: {},
      autoAprovarGroups: {},
      autoHistoricoGroups: {},
      welcomeGroups: {},
      saidaGroups: {},
      antiLink1Groups: {},
      antiLink2Groups: {},
      antiLinkGeralGroups: {},
      antiSpamGroups: {},
      parceriaGroups: {},
      parceirosList: {},
      antiPalavraGroups: {},
      blockedWords: [],
      userXp: {},
      marryRegistry: {},
      groupSchedulesTimes: {},
      systemXpGroups: {},
      systemCasamentoGroups: {},
      systemBancoGroups: {},
      rentalPlans: {
        "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 2.00, feePercent: 10, type: "temp" },
        "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 30.00, feePercent: 30, type: "temp" },
        "60_dias": { name: "60 Dias de Aluguel", days: 60, price: 55.00, feePercent: 30, type: "temp" },
        "90_dias": { name: "90 Dias de Aluguel", days: 90, price: 80.00, feePercent: 30, type: "temp" },
        "3_meses": { name: "3 Meses de Aluguel", days: 90, price: 80.00, feePercent: 30, type: "temp" },
        "6_meses": { name: "6 Meses de Aluguel", days: 180, price: 150.00, feePercent: 40, type: "temp" },
        "1_ano": { name: "1 Ano de Aluguel", days: 365, price: 280.00, feePercent: 50, type: "temp" },
        "2_anos": { name: "2 Anos de Aluguel", days: 730, price: 500.00, feePercent: 50, type: "temp" },
        "3_anos": { name: "3 Anos de Aluguel", days: 1095, price: 700.00, feePercent: 50, type: "temp" },
        "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50, type: "permanente" }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    data.ownerNumber = FIXED_OWNER_NUMBER;
    if (!data.systemXpGroups) data.systemXpGroups = {};
    if (!data.systemCasamentoGroups) data.systemCasamentoGroups = {};
    if (!data.systemBancoGroups) data.systemBancoGroups = {};
    if (!data.parceriaGroups) data.parceriaGroups = {};
    if (!data.parceirosList) data.parceirosList = {};
    if (!data.rentalPlans) data.rentalPlans = {
      "1_dia": { name: "1 Dia de Aluguel", days: 1, price: 2.00, feePercent: 10, type: "temp" },
      "30_dias": { name: "30 Dias de Aluguel", days: 30, price: 30.00, feePercent: 30, type: "temp" },
      "60_dias": { name: "60 Dias de Aluguel", days: 60, price: 55.00, feePercent: 30, type: "temp" },
      "90_dias": { name: "90 Dias de Aluguel", days: 90, price: 80.00, feePercent: 30, type: "temp" },
      "3_meses": { name: "3 Meses de Aluguel", days: 90, price: 80.00, feePercent: 30, type: "temp" },
      "6_meses": { name: "6 Meses de Aluguel", days: 180, price: 150.00, feePercent: 40, type: "temp" },
      "1_ano": { name: "1 Ano de Aluguel", days: 365, price: 280.00, feePercent: 50, type: "temp" },
      "2_anos": { name: "2 Anos de Aluguel", days: 730, price: 500.00, feePercent: 50, type: "temp" },
      "3_anos": { name: "3 Anos de Aluguel", days: 1095, price: 700.00, feePercent: 50, type: "temp" },
      "permanente": { name: "Acesso Permanente", days: 9999, price: 150.00, feePercent: 50, type: "permanente" }
    };
    return data;
  } catch {
    return { ownerJid: null, ownerNumber: FIXED_OWNER_NUMBER, rentedGroups: {}, rentalPlans: {}, systemXpGroups: {}, systemCasamentoGroups: {}, systemBancoGroups: {}, parceriaGroups: {}, parceirosList: {} };
  }
}

function saveDatabase(data) {
  data.ownerNumber = FIXED_OWNER_NUMBER;
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Carregador Modular Recursivo Completo e Exaustivo de todos os menus e subpastas
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
        if (cmdModule) {
          if (cmdModule.name) {
            commands.set(cmdModule.name.toLowerCase(), cmdModule);
          }
          if (Array.isArray(cmdModule.aliases)) {
            for (const alias of cmdModule.aliases) {
              commands.set(alias.toLowerCase(), cmdModule);
            }
          }
        }
      } catch (err) {
        console.error(`Erro ao carregar o arquivo de comando ${fullPath}:`, err.message);
      }
    }
  }
}
loadCommandsRecursive(path.join(__dirname, 'commands'));

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
  console.log(`📂 Leitor Recursivo Exaustivo Concluído (${commands.size} comandos mapeados)`);
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
        if ((db.autoHistoricoGroups && db.autoHistoricoGroups[id]) || (db.welcomeGroups && db.welcomeGroups[id])) {
          for (const p of participants) {
            await safeSendMessage(sock, id, { text: `👋 Olá @${p.split('@')[0]}! Seja muito bem-vindo(a) ao grupo!`, mentions: [p] });
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
      if (!from.endsWith('@g.us')) continue; // 100% exclusivo para grupos (@g.us)

      const senderJid = msg.key.participant || msg.key.remoteJid;
      const userNumber = senderJid.split('@')[0].split(':')[0];
      const cfg = loadConfig();
      db = loadDatabase();

      if (db.blacklistedUsers?.includes(senderJid)) continue;

      // XP automático (Apenas se o sistema de XP estiver ON no grupo, default OFF)
      if (db.systemXpGroups && db.systemXpGroups[from] === true) {
        db.userXp = db.userXp || {};
        db.userXp[senderJid] = db.userXp[senderJid] || { xp: 0, level: 1 };
        db.userXp[senderJid].xp += Math.floor(Math.random() * 15) + 10;
        if (db.userXp[senderJid].xp >= db.userXp[senderJid].level * 150) {
          db.userXp[senderJid].level += 1;
          db.userXp[senderJid].xp = 0;
          await safeSendMessage(sock, from, { text: `🎉 Parabéns @${userNumber}! Nível *${db.userXp[senderJid].level}* alcançado!`, mentions: [senderJid] });
        }
        saveDatabase(db);
      }

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '';
      const trimmedText = text.trim();
      const isOwner = db.ownerJid && (senderJid === db.ownerJid || senderJid.split('@')[0] === db.ownerJid.split('@')[0]);

      // Verificação de Links, Modo Parceria e Antilinks
      if (!trimmedText.startsWith('/') && text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][-a-zA-Z0-90-9]+\.(com|net|org|br|gg|xyz|me|io|tk|ml|ga|cf|gq)[^\s]*)/i)) {
        try {
          const groupMeta = await sock.groupMetadata(from);
          const groupName = groupMeta.subject;
          const isAdmin = groupMeta.participants.some(p => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin'));

          if (!isAdmin) {
            db.parceriaGroups = db.parceriaGroups || {};
            db.parceirosList = db.parceirosList || {};

            if (db.parceriaGroups[from] === true) {
              // Modo Parceria Ativo
              const partnerData = db.parceirosList[from]?.[senderJid];
              if (partnerData && partnerData.active) {
                if (partnerData.usedToday < partnerData.limit) {
                  partnerData.usedToday += 1;
                  saveDatabase(db);
                  await safeSendMessage(sock, from, { delete: msg.key });
                  await sock.sendMessage(from, { text: `🔗 Link postado pelo parceiro @${userNumber} (${partnerData.usedToday}/${partnerData.limit} usados hoje).`, mentions: [senderJid] });
                } else {
                  // Limite excedido do parceiro
                  partnerData.violations = (partnerData.violations || 0) + 1;
                  saveDatabase(db);
                  await safeSendMessage(sock, from, { delete: msg.key });
                  if (partnerData.violations >= 10) {
                    partnerData.active = false;
                    saveDatabase(db);
                    await sock.groupParticipantsUpdate(from, [senderJid], 'demote').catch(() => {});
                    // Muta permanente simulado (registrado em mutedUsers)
                    db.mutedUsers = db.mutedUsers || {};
                    db.mutedUsers[senderJid] = { perm: true, time: 0 };
                    saveDatabase(db);
                    await sock.sendMessage(from, { text: `🚨 @${userNumber} insistiu em postar sem limite diário. A parceria foi revogada e o usuário foi mutado permanentemente!`, mentions: [senderJid] });
                  } else {
                    await sock.sendMessage(from, { text: `⚠️ @${userNumber}, seu limite diário de links excedeu/esgotou! Só amanhã para postar de novo. Caso insista (Tentativa ${partnerData.violations}/10), perderá a parceria e será mutado.`, mentions: [senderJid] });
                  }
                }
              } else {
                // Não é parceiro e modo parceria está ativo
                await safeSendMessage(sock, from, { delete: msg.key });
                db.partnerViolations = db.partnerViolations || {};
                db.partnerViolations[from] = db.partnerViolations[from] || {};
                db.partnerViolations[from][senderJid] = (db.partnerViolations[from][senderJid] || 0) + 1;
                const vCount = db.partnerViolations[from][senderJid];
                saveDatabase(db);

                if (vCount >= 10) {
                  db.mutedUsers = db.mutedUsers || {};
                  db.mutedUsers[senderJid] = { perm: true, time: 0 };
                  saveDatabase(db);
                  await sock.sendMessage(from, { text: `🚨 @${userNumber} atingiu 10 insistências enviando links sem parceria e foi mutado permanentemente! Apenas ADM com \`/unmute\` pode remover.`, mentions: [senderJid] });
                } else {
                  await sock.sendMessage(from, { text: `⚠️ É proibido links no grupo *${groupName}* sem ter parceria! (Insistência ${vCount}/10). Caso insista, será mutado pelo sistema.`, mentions: [senderJid] });
                }
              }
            } else {
              // Modo Parceria desligado, verifica antilinks tradicionais
              if (db.antiLink2Groups && db.antiLink2Groups[from]) {
                await safeSendMessage(sock, from, { delete: msg.key });
                await sock.groupParticipantsUpdate(from, [senderJid], 'remove').catch(() => {});
                await sock.sendMessage(from, { text: `🛡️ @${userNumber} enviou link e foi banido automaticamente (AntiLink 2).`, mentions: [senderJid] });
              } else if (db.antiLink1Groups && db.antiLink1Groups[from]) {
                await safeSendMessage(sock, from, { delete: msg.key });
                await sock.sendMessage(from, { text: `⚠️ @${userNumber}, o envio de links é proibido neste grupo!`, mentions: [senderJid] });
              } else if (db.antiLinkGeralGroups && db.antiLinkGeralGroups[from]) {
                await safeSendMessage(sock, from, { delete: msg.key });
                db.antiLinkGeralWarnings = db.antiLinkGeralWarnings || {};
                db.antiLinkGeralWarnings[from] = db.antiLinkGeralWarnings[from] || {};
                db.antiLinkGeralWarnings[from][senderJid] = (db.antiLinkGeralWarnings[from][senderJid] || 0) + 1;
                const warns = db.antiLinkGeralWarnings[from][senderJid];
                saveDatabase(db);
                if (warns >= 5) {
                  await sock.groupParticipantsUpdate(from, [senderJid], 'remove').catch(() => {});
                  await sock.sendMessage(from, { text: `🚨 @${userNumber} atingiu 5 avisos de link e foi banido!`, mentions: [senderJid] });
                } else {
                  await sock.sendMessage(from, { text: `⚠️ @${userNumber} AVISO (${warns}/5): Links são proibidos!`, mentions: [senderJid] });
                }
              }
            }
          }
        } catch {}
      }

      if (ownerInteractiveSessions.has(senderJid)) {
        if (trimmedText.toLowerCase().startsWith('/setowner')) continue;
        const session = ownerInteractiveSessions.get(senderJid);

        if (session.step === 'SETOWNER_KEY') {
          ownerInteractiveSessions.delete(senderJid);
          if (trimmedText === loadKey()) {
            db.ownerJid = senderJid;
            saveDatabase(db);
            await safeSendMessage(sock, from, { text: `⚜️ *REGISTRADO COM SUCESSO!* 👑` }, { quoted: msg });
          } else {
            await safeSendMessage(sock, from, { text: `🚫 *CHAVE INCORRETA!*` }, { quoted: msg });
          }
          continue;
        }

        if (session.step === 'CREATE_PLAN_ID') {
          session.planId = trimmedText.toLowerCase().replace(/\s+/g, '_');
          session.step = 'CREATE_PLAN_NAME';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `📝 Digite o nome do plano:` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CREATE_PLAN_NAME') {
          session.planName = trimmedText;
          session.step = 'CREATE_PLAN_DAYS';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `📅 Quantos dias? (\`9999\` para permanente):` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CREATE_PLAN_DAYS') {
          session.planDays = parseInt(trimmedText) || 30;
          session.step = 'CREATE_PLAN_PRICE';
          ownerInteractiveSessions.set(senderJid, session);
          await safeSendMessage(sock, from, { text: `💵 Digite o valor em Reais:` }, { quoted: msg });
          continue;
        }
        if (session.step === 'CREATE_PLAN_PRICE') {
          const price = parseFloat(trimmedText.replace(',', '.')) || 30.00;
          const isPerm = session.planDays >= 3650;
          const feePercent = session.planDays >= 365 ? 50 : (session.planDays >= 90 ? 40 : 30);
          db.rentalPlans[session.planId] = {
            name: session.planName,
            days: session.planDays,
            price: price,
            feePercent: feePercent,
            type: isPerm ? "permanente" : "temp"
          };
          saveDatabase(db);
          ownerInteractiveSessions.delete(senderJid);
          await safeSendMessage(sock, from, { text: `✅ *PLANO CRIADO COM SUCESSO!* Taxa Purin: ${feePercent}%` }, { quoted: msg });
          continue;
        }
      }

      if (!trimmedText.startsWith('/')) continue;

      const commandKey = trimmedText.split(' ')[0].toLowerCase();
      const args = trimmedText.split(' ').slice(1);

      // Validação rigorosa de sistemas OFF (default OFF)
      if (['/nivel', '/xp', '/rankingxp'].includes(commandKey)) {
        if (!db.systemXpGroups || db.systemXpGroups[from] !== true) {
          await safeSendMessage(sock, from, { text: `⚠️ O sistema de XP está desativado neste grupo (Default: OFF). Um administrador pode ativar com \`/sistemaxp on\`.` }, { quoted: msg });
          continue;
        }
      }

      if (['/casar', '/aceitarcasorio', '/rejeitarcasorio', '/divorciar', '/casal', '/meucasamento', '/menucasamento'].includes(commandKey)) {
        if (!db.systemCasamentoGroups || db.systemCasamentoGroups[from] !== true) {
          await safeSendMessage(sock, from, { text: `⚠️ O sistema de casamento está desativado neste grupo (Default: OFF). Um administrador pode ativar com \`/sistemacasamento on\`.` }, { quoted: msg });
          continue;
        }
      }

      if (['/banco', '/menubanco', '/depositar', '/dep', '/sacar', '/sac', '/investir', '/emprestimo', '/carteira'].includes(commandKey)) {
        if (!db.systemBancoGroups || db.systemBancoGroups[from] !== true) {
          await safeSendMessage(sock, from, { text: `⚠️ O sistema de banco está desativado neste grupo (Default: OFF). Um administrador pode ativar com \`/sistemabanco on\`.` }, { quoted: msg });
          continue;
        }
      }

      if (commandKey === '/setowner') {
        if (db.ownerJid) {
          await safeSendMessage(sock, from, { text: `⚠️ *DONO JÁ CADASTRADO!*` }, { quoted: msg });
          continue;
        }
        ownerInteractiveSessions.set(senderJid, { step: 'SETOWNER_KEY' });
        await safeSendMessage(sock, from, { text: `⚜️ *REGISTRO DE DONO* 👑\nDigite a Key:` }, { quoted: msg });
        continue;
      }

      if (commandKey === '/criaraluguel' && isOwner) {
        ownerInteractiveSessions.set(senderJid, { step: 'CREATE_PLAN_ID' });
        await safeSendMessage(sock, from, { text: `🛠️ *CRIAR PLANO* 💼\nDigite o ID único:` }, { quoted: msg });
        continue;
      }

      if (commandKey === '/gerarpagamento' && isOwner) {
        const val = parseFloat(args[0]) || 2.00;
        const res = await purincash.gerarPix(val, 30);
        await safeSendMessage(sock, from, { text: `💳 *PIX PURIN CASH — AUTOMÁTICO*\nValor: R$ ${res.valorTotal.toFixed(2)}\nCopia e Cola: \`${res.copiaEcola}\`` }, { quoted: msg });
        continue;
      }

      if (commandKey === '/alugar') {
        const planKey = args[0];
        if (!planKey || !db.rentalPlans[planKey]) {
          await safeSendMessage(sock, from, { text: `⚠️ Plano inválido. Use \`/aluguel\` para ver os planos.` }, { quoted: msg });
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
        const res = await purincash.gerarPix(plan.price, plan.feePercent);
        await safeSendMessage(sock, from, { text: `💳 *COBRANÇA GERADA — PURIN CASH*\nPlano: ${plan.name} \vert{} R$ ${res.valorTotal.toFixed(2)} (${plan.feePercent}% taxa depositada na sua Purin)\n\nCopia e Cola:\n\`{res.copiaEcola}\`` }, { quoted: msg });
        continue;
      }

      // Execução garantida via mapa de comandos modulares exaustivos
      if (commands.has(commandKey)) {
        const cmd = commands.get(commandKey);
        try {
          await cmd.execute(sock, msg, from, args, senderJid, userNumber, db, config);
        } catch (e) {
          console.error(`Erro ao executar o comando ${commandKey}:`, e);
          await safeSendMessage(sock, from, { text: `❌ Erro interno ao executar ${commandKey}.` });
        }
      }
    }
  });
}

startBot();
