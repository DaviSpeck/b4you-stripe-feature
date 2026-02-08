import styles from './Step02.module.css';



export function Step03({
    setCurrentStep,
    currentStep,
    offer,
    shippingOptions,
    setSelectedOption,
    selectedOption,
    currency,
}){
    const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';
    return (
        <>
          <div
            className={styles.div01}
            style={{
            display: currentStep === 3 ? '' : 'none',
            '--hex-color': hexColor,
            }}
        >
                <div className={styles.frame37254}>
                    <div className={styles.frame37253}>
                    <span className={styles.text08}>3</span>
                    </div>
                    <span className={styles.text09}>
                    <span>Método de Envio</span>
                    </span>
                </div>
                
                <div className={styles.checkboxgroupitem}>
                    

                    <div className='mb-4 mt-2'>
                      {shippingOptions && shippingOptions.length > 0 ? (
                        <div>
                          {shippingOptions.map((option, index) => (
                            <div
                              key={index}
                              className='border p-3 rounded mt-2 d-flex justify-content-between align-items-center'
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedOption(index)}
                            >
                              <div className='d-flex align-items-center'>
                                <input
                                  type='radio'
                                  name='shippingOption'
                                  value={option.name}
                                  checked={selectedOption === index}
                                  onChange={() => setSelectedOption(index)}
                                  className='mr-2 me-2'
                                />
                                <span className='text-muted'>
                                  {option.label}
                                </span>
                              </div>
                              <span className='text-muted'>
                                {currency(option.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='bg-light text-muted mt-3 p-3 rounded'>
                          Preencha seu endereço de entrega para visualizar
                          métodos de entrega.
                        </div>
                      )}
                    </div>

                </div>

                <div className={styles.frame6}
                    onClick={() => setCurrentStep(4)} 
                >
                    <span className={styles.text35}>
                        
                    <span>Continuar</span>
                    </span>
                    <img
                    src='/external/arrowrighti317-fko.svg'
                    alt='arrowrightI317'
                    className={styles.arrowright}
                    />
              </div>
            </div> 
        <div className={styles.div01} style={{ display: currentStep === 4 ? '' : 'none' }}            >
                <div className={styles.frame37254}>
                <div className={styles.frame37253ok}>
                    <span className={styles.text08ok}>3</span>
                </div>
                <span className={styles.text09ok}>
                    <span>
                    Método de Envio&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                </span>

                <div onClick={() => setCurrentStep(3)} className={styles.edit}>
                    <img src='/external/edit_icon.png' alt='edit' />
                </div>
            </div>
            <span className={styles.text11}>
            <span>Método de Envio</span>
            </span>
            <div className={styles.formOk}>eeeeeeee</div>
        </div>
      
      <div className={styles.div01} style={{ display: currentStep < 3 ? '' : 'none' }} >
        <div className={styles.frame37254}>
          <div className={styles.frame37253Unstarted}>
            <span className={styles.text08Unstarted}>3</span>
          </div>
          <span className={styles.text09Unstarted}>
            <span>Método de Envio</span>
          </span>
        </div>
        <span className={styles.text11}>
          <span>Digite aqui seu endereço para entrega.</span>
        </span>
      </div>
        </>
    );
}