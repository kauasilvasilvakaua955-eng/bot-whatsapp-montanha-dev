const fs = require('fs');
const path = require('path');
const readline = require('readline');

const KEY_PATH = path.join(__dirname, 'Key_fullacess.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`\n========================================`);
console.log(`🔑 ALTERAÇÃO DE CHAVE DE ACESSO — LUNAR SYSTEM`);
console.log(`========================================\n`);

rl.question('💬 Digite a nova chave de acesso (Key) do dono: ', (answer) => {
  const newKey = answer.trim();

  if (!newKey) {
    console.log('❌ A chave não pode estar vazia!');
    rl.close();
    process.exit(1);
  }

  const keyData = {
    secretKey: newKey,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(KEY_PATH, JSON.stringify(keyData, null, 2));
    console.log('\n========================================');
    console.log(`✅ CHAVE ATUALIZADA COM SUCESSO!`);
    console.log(`🔑 Nova Key salva: ${newKey}`);
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Erro ao salvar a chave:', err.message);
  }

  rl.close();
  
  console.log('🚀 Iniciando o bot com a nova chave...\n');
  require('./index.js');
});
