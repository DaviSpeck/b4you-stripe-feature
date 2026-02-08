const Loader = ({
  title = 'Carregando...',
  style,
  fullscreen,
  show = true,
}) => {
  return (
    <>
      {show && (
        <div
          id='loader'
          style={style}
          className={fullscreen && 'loader-fullscreen'}
        >
          <div className='loader-content'>
            <i className='bx bx-loader-alt bx-spin' />
            <div>{title}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
