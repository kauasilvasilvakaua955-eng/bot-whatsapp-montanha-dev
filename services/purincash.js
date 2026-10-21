const axios = require('axios');

class PurinCashService {
  constructor() {
    this.apiKey = "ps_live_cd567d751a8565129a1d6637222cab306d4906fc9c50b60d19351f54ca240cd6";
    this.apiSecret = "7a77f8439df67cf940ca2e34dd17591ea248a76d149c1a44ef67b79b5de3a135";
  }

  calcularTaxaAvulsa(valorBase) {
    let taxaFixa = 0;
    let taxaPercentual = 0;
    let descricaoTaxa = "";

    if (valorBase >= 1.50 && valorBase <= 3.00) {
      taxaFixa = 0.50;
      descricaoTaxa = "R$ 0.50 (Fixo para valores entre R$ 1.50 e R$ 3.00)";
    } else if (valorBase > 3.00 && valorBase < 50.00) {
      taxaPercentual = 10;
      descricaoTaxa = "10% (Para valores acima de R$ 3.00 até R$ 50.00)";
    } else if (valorBase >= 50.00 && valorBase < 100.00) {
      taxaPercentual = 15;
      descricaoTaxa = "15% (Para valores acima de R$ 50.00 até R$ 100.00)";
    } else if (valorBase >= 100.00) {
      taxaPercentual = 30;
      descricaoTaxa = "30% (Para valores de R$ 100.00 ou mais)";
    } else {
      taxaFixa = 0.50;
      descricaoTaxa = "R$ 0.50 (Taxa mínima aplicada)";
    }

    const valorTaxa = taxaFixa + (valorBase * (taxaPercentual / 100));
    const valorTotal = valorBase + valorTaxa;

    return {
      valorBase,
      taxaFixa,
      taxaPercentual,
      valorTaxa,
      valorTotal,
      descricaoTaxa
    };
  }

  async gerarPix(valorBase, feePercentOrCustom = 30) {
    const calc = this.calcularTaxaAvulsa(valorBase);
    const copiaEcola = `00020126580014br.gov.bcb.pix0136montanhadev-lunar-system-pix-key5204000053039865802BR5925MONTANHA DEV LUNAR SYSTEM6009GOIANIA62070503***6304ABCD`;
    return {
      valorBase: calc.valorBase,
      valorTotal: calc.valorTotal,
      valorTaxa: calc.valorTaxa,
      descricaoTaxa: calc.descricaoTaxa,
      copiaEcola
    };
  }
}

module.exports = new PurinCashService();
