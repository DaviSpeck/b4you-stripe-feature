const CardRenovationSuccess = ({ fullName }) => {
  return (
    <div className='card-success'>
      <header>
        <i className='la la-thumbs-up great' />
        <h4>Renovação Realizada</h4>
      </header>
      <p>
        {fullName.split(' ')[0]}, parabéns! Sua assinatura foi renovada com
        sucesso
      </p>
    </div>
  );
};

export default CardRenovationSuccess;
