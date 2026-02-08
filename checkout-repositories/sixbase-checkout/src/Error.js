const Error = ({ title, message }) => {
  return (
    <>
      <div className='error'>
        <i className='la la-times' />
        <span className='title'>
          {title ? title : 'Algo de errado não está certo.'}
        </span>
        {message && <span className='text'></span>}
      </div>
    </>
  );
};

export default Error;
