const Sandbox = () => {
  let env = 'production';

  let styles = {
    width: '100%',
    background: 'rgb(232, 62, 62)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '12px',
    padding: '5px 0',
    textAlign: 'center',
    position: 'fixed',
    top: 0,
    zIndex: 10000,
  };

  return (
    env === 'sandbox' && (
      <>
        <div id='bar-sandbox' style={styles}>
          Você está em um ambiente <b>sandbox.</b>
        </div>
      </>
    )
  );
};

export default Sandbox;
