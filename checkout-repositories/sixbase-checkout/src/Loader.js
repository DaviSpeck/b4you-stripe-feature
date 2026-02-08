const Loader = ({ title = 'Carregando...', spinner = true }) => {
  return (
    <div id='overlay-loader'>
      {spinner && <i className='la la-circle-notch la-spin mr-2' />}
      <span>{title}</span>
    </div>
  );
};

export default Loader;
