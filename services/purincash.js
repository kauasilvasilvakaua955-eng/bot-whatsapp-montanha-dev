const axios = require('axios');
const fs = require('fs');
const path = require('path');

function getConfig() {
  try {
    const configPath = path.join(__dirname, '../config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return { PURINCASH_API: '', PURINCASH_SECRET: '' };
  }
}

async function createPixCharge(amount, description) {
  const cfg = getConfig();
  // Simulação estruturada da API da PurinCash com suporte a webhook e brCode
  return {
    id: 'charge_' + Date.now(),
    brCode: '00020101021226820014br.gov.bcb.pix2560pix.purincash.com/qr/v2/cob/mock_' + Date.now() + '5204000053039865405' + amount.toFixed(2) + '5802BR5913LUNAR SYSTEM6009SAO PAULO6304'
  };
}

async function getWalletBalance() {
  return { formatted: '150,00' };
}

async function monitorPayment(chargeId, onSuccess, onExpire) {
  setTimeout(() => {
    if (typeof onSuccess === 'function') onSuccess();
  }, 10000);
}

module.exports = { createPixCharge, getWalletBalance, monitorPayment };
