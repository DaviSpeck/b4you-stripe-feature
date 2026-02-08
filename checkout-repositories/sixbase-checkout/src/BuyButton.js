const Loading = () => {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>
      <div className='loader-black'></div>
    </div>
  );
};

const BuyButton = ({
  customerDataSent,
  verified_id,
  terms,
  has_terms,
  loading = true,
}) => {
  // customerDataSent = true; // remover depois
  return (
    <section>
      <button
        className='btn w-100 py-3 mt-0 text-break'
        type='submit'
        disabled={
          !customerDataSent || !verified_id || (has_terms && !terms) || loading
        }
      >
        {loading ? <Loading /> : <span>Comprar Agora</span>}
      </button>
      {!customerDataSent && (
        <span className='alert-fields-invalid'>
          Preencha <b>TODOS</b> os campos corretamente
        </span>
      )}
    </section>
  );
};

export default BuyButton;
