const { endpointsMidia, endpointsUtilidades, callLunarGet } = require('../../services/lunarApi');

module.exports = {
  name: 'utilitarios',
  aliases: ['util', 'comandosnovos', 'lunar'],
  category: 'util',
  async execute(sock, msg, from, args, senderJid, userNumber, config) {
    const subCommand = args[0]?.toLowerCase();
    const query = args.slice(1).join(' ');

    // Se nenhum submenu foi informado, exibe o menu separado por categorias
    if (!subCommand) {
      const menuText = `╔══════════════════════════════╗\n` +
                       `║  🌙 *LUNAR SYSTEM © - UTILITY* 🌙\n` +
                       `╚══════════════════════════════╝\n\n` +
                       `📌 *PREFIXO:* \`${config.prefix}\`\n\n` +
                       `📥 *DOWNLOADS E MÍDIA*\n` +
                       `› \`${config.prefix}utilitarios play <url/termo>\` - YouTube Áudio\n` +
                       `› \`${config.prefix}utilitarios playvid <url/termo>\` - YouTube Vídeo\n` +
                       `› \`${config.prefix}utilitarios tiktok <url>\` - TikTok s/ marca\n` +
                       `› \`${config.prefix}utilitarios instagram <url>\` - Instagram\n` +
                       `› \`${config.prefix}utilitarios facebook <url>\` - Facebook\n` +
                       `› \`${config.prefix}utilitarios kwai <url>\` - Kwai\n` +
                       `› \`${config.prefix}utilitarios pinterest <termo>\` - Pinterest\n` +
                       `› \`${config.prefix}utilitarios spotify <termo/url>\` - Spotify\n\n` +
                       `🛠️ *UTILIDADES E IA*\n` +
                       `› \`${config.prefix}utilitarios letra <música>\` - Letra de música\n` +
                       `› \`${config.prefix}utilitarios logo1 <texto>\` - Gerador Logo 1\n` +
                       `› \`${config.prefix}utilitarios logo2 <t1> | <t2>\` - Gerador Logo Dupla\n\n` +
                       `✨ *Digite ${config.prefix}utilitarios <comando> <parâmetro> para executar.*`;

      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
      return;
    }

    // Execução dos comandos via submenu /utilitarios
    try {
      if (['play', 'playvid', 'tiktok', 'instagram', 'facebook', 'kwai', 'pinterest', 'spotify'].includes(subCommand)) {
        if (!query) {
          await sock.sendMessage(from, { text: `⚠️ Informe o link ou termo para o comando *${subCommand}*. Exemplo:\n\`${config.prefix}utilitarios ${subCommand} [link/termo]\`` }, { quoted: msg });
          return;
        }

        await sock.sendMessage(from, { text: `⏳ Processando solicitação de *${subCommand}* via Lunar API...` }, { quoted: msg });

        let endpointUrl = '';
        if (subCommand === 'play') endpointUrl = endpointsMidia.play(query);
        else if (subCommand === 'playvid') endpointUrl = endpointsMidia.playvid(query);
        else if (subCommand === 'tiktok') endpointUrl = endpointsMidia.tiktok(query);
        else if (subCommand === 'instagram') endpointUrl = endpointsMidia.instagram(query);
        else if (subCommand === 'facebook') endpointUrl = endpointsMidia.facebook(query);
        else if (subCommand === 'kwai') endpointUrl = endpointsMidia.kwai(query);
        else if (subCommand === 'pinterest') endpointUrl = endpointsMidia.pinterest(query);
        else if (subCommand === 'spotify') endpointUrl = endpointsMidia.spotify(query);

        const res = await callLunarGet(endpointUrl);
        const mediaUrl = res.mediaUrl || res.url || res.resultado;

        if (!mediaUrl) {
          await sock.sendMessage(from, { text: `❌ Não foi possível obter o arquivo para o comando ${subCommand}.` }, { quoted: msg });
          return;
        }

        if (subCommand === 'play' || subCommand === 'spotify') {
          await sock.sendMessage(from, { audio: { url: mediaUrl }, mimetype: 'audio/mp4', ptt: false }, { quoted: msg });
        } else if (subCommand === 'pinterest') {
          await sock.sendMessage(from, { image: { url: mediaUrl }, caption: `📌 *Pinterest — Lunar System*` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { video: { url: mediaUrl }, caption: `🎬 *${subCommand.toUpperCase()} — Lunar System*` }, { quoted: msg });
        }

      } else if (subCommand === 'letra') {
        if (!query) {
          await sock.sendMessage(from, { text: `⚠️ Informe o nome da música. Exemplo:\n\`${config.prefix}utilitarios letra [nome]\`` }, { quoted: msg });
          return;
        }
        await sock.sendMessage(from, { text: `🎤 Buscando letra via Lunar API...` }, { quoted: msg });
        const res = await callLunarGet(endpointsUtilidades.letra(query));
        const letraText = res.letra || res.lyrics || res.resultado || JSON.stringify(res);
        await sock.sendMessage(from, { text: `🎤 *LETRA DA MÚSICA — LUNAR SYSTEM*\n\n${letraText}` }, { quoted: msg });

      } else if (subCommand === 'logo1') {
        if (!query) {
          await sock.sendMessage(from, { text: `⚠️ Informe o texto da logo. Exemplo:\n\`${config.prefix}utilitarios logo1 Montanha\`` }, { quoted: msg });
          return;
        }
        await sock.sendMessage(from, { text: `🅰️ Gerando logo 1 via Lunar API...` }, { quoted: msg });
        const res = await callLunarGet(endpointsUtilidades.logo1(query));
        const mediaUrl = res.mediaUrl || res.url || res.resultado;
        if (mediaUrl) {
          await sock.sendMessage(from, { image: { url: mediaUrl }, caption: `🅰️ *Logo Gerada — Lunar System*` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `❌ Erro ao gerar logo.` }, { quoted: msg });
        }

      } else if (subCommand === 'logo2') {
        const parts = query.split('|');
        const t1 = parts[0]?.trim();
        const t2 = parts[1]?.trim();
        if (!t1 || !t2) {
          await sock.sendMessage(from, { text: `⚠️ Informe os dois textos separados por |. Exemplo:\n\`${config.prefix}utilitarios logo2 Lunar | System\`` }, { quoted: msg });
          return;
        }
        await sock.sendMessage(from, { text: `🅱️ Gerando logo dupla via Lunar API...` }, { quoted: msg });
        const res = await callLunarGet(endpointsUtilidades.logo2(t1, t2));
        const mediaUrl = res.mediaUrl || res.url || res.resultado;
        if (mediaUrl) {
          await sock.sendMessage(from, { image: { url: mediaUrl }, caption: `🅱️ *Logo Dupla Gerada — Lunar System*` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `❌ Erro ao gerar logo dupla.` }, { quoted: msg });
        }

      } else {
        await sock.sendMessage(from, { text: `❌ Subcomando desconhecido. Digite \`${config.prefix}utilitarios\` para ver os menus disponíveis.` }, { quoted: msg });
      }

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erro na Lunar API: ${e.message}` }, { quoted: msg });
    }
  }
};
