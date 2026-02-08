function verifyRegionByZipcode(cep) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    return 'CEP inválido';
  }
  const regioes = [
    {
      nome: 'Norte',
      sigla: 'NO',
      faixas: [
        [66000000, 68899999], // Pará
        [68900000, 68999999], // Amapá
        [69000000, 69299999], // Amazonas 1
        [69300000, 69399999], // Roraima
        [69400000, 69899999], // Amazonas 2
        [69900000, 69999999], // Acre
        [76800000, 76999999], // Rondônia
        [77000000, 77999999], // Tocantins
      ],
    },
    {
      nome: 'Nordeste',
      sigla: 'NE',
      faixas: [
        [40000000, 48999999], // Bahia
        [49000000, 49999999], // Sergipe
        [50000000, 56999999], // Pernambuco
        [57000000, 57999999], // Alagoas
        [58000000, 58999999], // Paraíba
        [59000000, 59999999], // Rio Grande do Norte
        [60000000, 63999999], // Ceará
        [64000000, 64999999], // Piauí
        [65000000, 65999999], // Maranhão
      ],
    },
    {
      nome: 'Centro-Oeste',
      sigla: 'CO',
      faixas: [
        [70000000, 72799999], // Distrito Federal 1
        [72800000, 72999999], // Goiás 1
        [73000000, 73699999], // Distrito Federal 2
        [73700000, 76799999], // Goiás 2
        [78000000, 78899999], // Mato Grosso
        [79000000, 79999999], // Mato Grosso do Sul
      ],
    },
    {
      nome: 'Sudeste',
      sigla: 'SE',
      faixas: [
        [0, 19999999], // São Paulo
        [20000000, 28999999], // Rio de Janeiro
        [29000000, 29999999], // Espírito Santo
        [30000000, 39999999], // Minas Gerais
      ],
    },
    {
      nome: 'Sul',
      sigla: 'SU',
      faixas: [
        [80000000, 87999999], // Paraná
        [88000000, 89999999], // Santa Catarina
        [90000000, 99999999], // Rio Grande do Sul
      ],
    },
  ];

  const cepNumero = parseInt(cepLimpo, 10);
  for (const regiao of regioes) {
    for (const faixa of regiao.faixas) {
      if (cepNumero >= faixa[0] && cepNumero <= faixa[1]) {
        return regiao.sigla;
      }
    }
  }

  return 'Região não encontrada';
}

module.exports = { verifyRegionByZipcode };
