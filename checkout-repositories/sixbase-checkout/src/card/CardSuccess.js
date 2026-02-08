const CardSuccess = ({ fullName }) => {
  return (
    <div className='card-success'>
      <header>
        <i className='la la-thumbs-up great' />
        <h4>Compra Realizada</h4>
      </header>
      <p>
        {fullName.split(' ')[0]}, parabéns! Sua compra foi realizada com
        sucesso, <b>não feche esta página.</b>
      </p>
      <div className='redirecting'>
        <i className='la la-circle-notch la-spin mr-2' />
        <span>Redirecionando...</span>
      </div>
    </div>
  );
};

export default CardSuccess;
