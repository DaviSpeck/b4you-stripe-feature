import './style.scss';

const AlreadySent = ({ success }) => {
  return (
    <>
      <section id='page-identity'>
        {success ? (
          <>
            <div className='success text-center'>
              <i className='bx bx-check-shield' />
              <h2>Identidade Verificada!</h2>
              <div>
                <p>
                  A sua identidade já foi verificada por nossa equipe. Você está
                  apto a realizar saques para sua conta bancária.
                </p>
                <p>
                  <b>Qualquer dúvida entre em contato com o suporte.</b>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='analysis text-center'>
              <i className='bx bx-search-alt' />
              <h2>Documentos em análise...</h2>
              <div>
                <p>
                  Nossa equipe está verificando seus documentos, este processo
                  pode levar até 3 dias úteis. Se por acaso esse prazo acabou e
                  você não obteve retorno entre em contato com nosso suporte
                  para mais informações.
                </p>
                <p>
                  <b>
                    Você receberá o resultado da sua análise por e-mail, fique
                    atento.
                  </b>
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default AlreadySent;
