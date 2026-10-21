module.exports = {
  apiKey: "ps_live_cd567d751a8565129a1d6637222cab306d4906fc9c50b60d19351f54ca240cd6",
  apiSecret: "7a77f8439df67cf940ca2e34dd17591ea248a76d149c1a44ef67b79b5de3a135",
  async gerarPix(valor, taxaPercentual) {
    const valorComTaxa = valor * (1 + (taxaPercentual / 100));
    return {
      success: true,
      valorTotal: valorComTaxa,
      copiaEcola: "00020126580014br.gov.bcb.pix...PURIN_AUTO_LUNAR_SYSTEM"
    };
  }
};
