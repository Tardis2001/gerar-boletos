const path = require('path');
const StringUtils = require('../utils/string');
const pad = StringUtils.pad;

const CodigoDeBarrasBuilder = require('../generators/barcode-builder');

class Sisprime {
  static NUMERO_SISPRIME = '084';
  static DIGITO_SISPRIME = '1';
  getTitulos() {
    return {};
  }

  exibirReciboDoPagadorCompleto() {
    return false;
  }

  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const carteira = beneficiario.getCarteira();
    const nossoNumero = beneficiario.getNossoNumero();

    if (!carteira) {
      throw new Error('Sisprime: Carteira é obrigatória');
    }

    if (!nossoNumero || nossoNumero.length > 15) {
      throw new Error(
        'Sisprime: Nosso número deve ter até 15 dígitos. ' +
          `Recebido: ${nossoNumero?.length || 0} dígitos`
      );
    }
    const campoLivre = [];

    const codigoFormatado = this.getCodigoFormatado(beneficiario);
    const nossoNumeroFormatado = this.getNossoNumeroFormatado(beneficiario);
    const carteiraFormatado = this.getCarteiraFormatado(beneficiario);

    campoLivre.push(beneficiario.getAgenciaFormatada());
    campoLivre.push(carteiraFormatado);
    campoLivre.push(nossoNumeroFormatado);
    campoLivre.push(codigoFormatado); // 7 primeiros
    campoLivre.push('0'); // Termina com 0

    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() {
    return [Sisprime.NUMERO_SISPRIME, Sisprime.DIGITO_SISPRIME].join('-');
  }

  getNumeroFormatado() {
    return Sisprime.NUMERO_SISPRIME;
  }

  getCarteiraFormatado(beneficiario) {
    return pad(beneficiario.getCarteira(), 2, '0');
  }

  getCarteiraTexto(beneficiario) {
    return pad(beneficiario.getCarteira(), 3, '0');
  }

  getCodigoFormatado(beneficiario) {
    return pad(beneficiario.getCodigoBeneficiario(), 7, '0');
  }

  getImagem() {
    return path.join(__dirname, 'logotipos/sisprime.png');
  }

  getNossoNumeroFormatado(beneficiario) {
    return pad(beneficiario.getNossoNumero(), 11, '0');
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const beneficiario = boleto.getBeneficiario();

    return [this.getNossoNumeroFormatado(beneficiario), beneficiario.getDigitoNossoNumero()].join(
      '-'
    );
  }

  getNome() {
    return 'Sisprime do Brasil - Cooperativa de Credito';
  }

  getImprimirNome() {
    return false;
  }

  getAgenciaECodigoBeneficiario(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const digitoCodigo = beneficiario.getDigitoCodigoBeneficiario();
    let codigo = this.getCodigoFormatado(beneficiario);

    if (digitoCodigo) {
      codigo += '-' + digitoCodigo;
    }

    return (
      beneficiario.getAgenciaFormatada() + '-' + beneficiario.getDigitoAgencia() + '/' + codigo
    );
  }

  static novoSisprime() {
    return new Sisprime();
  }
}

module.exports = Sisprime;
