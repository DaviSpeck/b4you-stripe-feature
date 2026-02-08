import React from 'react';
import { Col, Row } from 'react-bootstrap';

const TransactionSuccess = () => {
  // verificar se existe upsell, se existir, rediciona cliente para o upsell.
  // caso contrario, mostra o resumo da transação em Delivery

  return;
  <Row>
    <Col>
      <h4>Compra Realizada</h4>
      <p>[nome], parabéns! Sua compra foi feita com sucesso.</p>
      <p>
        <b>Não feche esta página,</b> em alguns segundos você será
        redirecionado...
      </p>
      <i className='la la-loader-alt-2' />
    </Col>
  </Row>;
};

export default TransactionSuccess;
