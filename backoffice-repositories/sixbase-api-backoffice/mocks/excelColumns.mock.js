const salesDetailedColumns = [
  {
    header: 'ID PAY42',
    key: 'id_pay42',
    width: 20,
  },
  {
    header: 'PRODUTOR',
    key: 'full_name',
    width: 30,
  },
  {
    header: 'CPF CLIENTE',
    key: 'document_number',
    width: 30,
  },
  {
    header: 'PRODUTO',
    key: 'product_name',
    width: 30,
  },
  {
    header: 'TIPO PRODUTO',
    key: 'product_type',
    width: 30,
  },
  {
    header: 'TIPO VENDA',
    key: 'sale_type',
    width: 30,
  },
  {
    header: 'NOME OFERTA',
    key: 'offer_name',
    width: 30,
  },
  {
    header: 'DATA DA COMPRA',
    key: 'created_at',
    width: 30,
  },
  {
    header: 'DATA DA ATUALIZAÇÃO',
    key: 'updated_at',
    width: 30,
  },
  {
    header: 'STATUS',
    key: 'status',
    width: 30,
  },
  {
    header: 'PAGO EM',
    key: 'paid_at',
    width: 30,
  },
  {
    header: 'MÉTODO DE PAGAMENTO',
    key: 'payment_method',
    width: 30,
  },
  {
    header: 'QUANTIDADE DE PARCELAS',
    key: 'installments',
    width: 30,
  },
  {
    header: 'VALOR DA OFERTA',
    key: 'offer_price',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'VALOR PAGO',
    key: 'paid_price',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'RECEITA TARIFA VARIÁVEL',
    key: 'gross_percentage',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'RECEITA TARIFA FIXA',
    key: 'gross_fixed',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'RECEITA PARCELAMENTO',
    key: 'installment_amount',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'AFILIADO',
    key: 'affiliate_name',
    width: 30,
  },
  {
    header: 'COMISSÃO AFILIADO',
    key: 'affiliate_commission',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'COMISSÃO PRODUTOR',
    key: 'producer_commission',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'COMISSÃO COPRODUTORES',
    key: 'coproducers_commissions',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'CUSTO TOTAL',
    key: 'cost_total',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'ADQUIRENTE',
    key: 'provider',
    width: 30,
  },
  {
    header: 'ID ADQUIRENTE',
    key: 'provider_id',
    width: 30,
  },
  {
    header: 'RUA',
    key: 'street',
    width: 30,
  },
  {
    header: 'NUMERO',
    key: 'number',
    width: 30,
  },
  {
    header: 'COMPLEMENTO',
    key: 'complement',
    width: 30,
  },
  {
    header: 'BAIRRO',
    key: 'neighborhood',
    width: 30,
  },
  {
    header: 'CIDADE',
    key: 'city',
    width: 30,
  },
  {
    header: 'ESTADO',
    key: 'state',
    width: 30,
  },
  {
    header: 'CEP',
    key: 'zipcode',
    width: 30,
  },
];

const salesSimplifiedColumns = [
  {
    header: 'ID CHARGE',
    key: 'uuid',
    width: 30,
  },
  {
    header: 'ID PAY42',
    key: 'id_pay42',
    width: 20,
  },
  {
    header: 'ADQUIRENTE',
    key: 'provider',
    width: 20,
  },
  {
    header: 'ID ADQUIRENTE',
    key: 'provider_id',
    width: 30,
  },
  {
    header: 'CPF CLIENTE',
    key: 'document_number',
    width: 30,
  },
  {
    header: 'EMAIL CLIENTE',
    key: 'email',
    width: 30,
  },
  {
    header: 'DATA DA COMPRA',
    key: 'created_at',
    width: 30,
  },
  {
    header: 'STATUS',
    key: 'status',
    width: 30,
  },
  {
    header: 'PAGO EM',
    key: 'paid_at',
    width: 30,
  },
  {
    header: 'MÉTODO DE PAGAMENTO',
    key: 'payment_method',
    width: 30,
  },
  {
    header: 'QUANTIDADE DE PARCELAS',
    key: 'installments',
    width: 30,
  },
  {
    header: 'VALOR PAGO',
    key: 'price',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'RECEITA TARIFA VARIÁVEL',
    key: 'fee_variable_amount',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'RECEITA TARIFA FIXA',
    key: 'fee_fixed',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'RECEITA TARIFA PARCELAMENTO',
    key: 'interest_installment_amount',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'VALOR EM COMISSÕES',
    key: 'commissions',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'VALOR DE REEMBOLSO',
    key: 'refund_amount',
    width: 30,
    style: {
      numFmt: 'R$#0.#0',
    },
  },
];

const usersColumns = [
  {
    header: 'NOME',
    key: 'full_name',
    width: 20,
  },
  {
    header: 'EMAIL',
    key: 'email',
    width: 30,
  },
  {
    header: 'TOTAL A REPASSAR',
    key: 'amount',
    width: 30,
  },
  {
    header: 'TOTAL A LIBERAR',
    key: 'pending',
    width: 30,
  },
  {
    header: 'TOTAL A REPASSAR + TOTAL A LIBERAR',
    key: 'total',
    width: 30,
  },
  {
    header: 'SALDO PAGARME PENDENTE',
    key: 'pagarme_balance_pending',
    width: 30,
  },
  {
    header: 'SALDO PAGARME DISPONIVEL',
    key: 'pagarme_balance_available',
    width: 30,
  },
];

module.exports = {
  salesDetailedColumns,
  salesSimplifiedColumns,
  usersColumns,
};
