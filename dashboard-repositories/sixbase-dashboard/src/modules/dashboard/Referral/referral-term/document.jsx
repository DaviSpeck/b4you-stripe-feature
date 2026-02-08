import { useEffect, useRef } from 'react';

export function Document(props) {
  const observerEndDocument = useRef(null);

  const { isRead, onRead } = props;

  useEffect(() => {
    const observer = new IntersectionObserver(([entries]) => {
      !isRead && entries.isIntersecting && onRead(entries.isIntersecting);
    });

    if (observerEndDocument.current) {
      observer.observe(observerEndDocument.current);
    }

    return () => {
      if (observerEndDocument.current) {
        observer.unobserve();
      }
    };
  }, []);

  return (
    <div
      style={{
        borderRadius: '6px',
        height: '300px',
      }}
    >
      <div
        style={{
          overflowY: 'auto',
          height: '100%',
          padding: '16px',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
        }}
      >
        <h2
          style={{
            color: '#475569',
            paddingBottom: '16px',
            fontSize: '1rem',
            width: '100%',
            textAlign: 'center',
          }}
        >
          Regras do Programa de Indicação da Plataforma B4You
        </h2>
        <div>
          <div>
            <Document.Header headerTitle='1. FINALIDADE DO SISTEMA DE INDICAÇÃO' />
            <Document.Clause
              text={`
            1.1. O sistema de indicação da B4You foi desenvolvido com o objetivo
            de estimular o crescimento da comunidade de produtores, afiliados e
            parceiros por meio de indicações legítimas e externas à estrutura
            interna de uma empresa ou núcleo familiar.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='2. REGRAS GERAIS DE INDICAÇÃO' />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Document.Clause
                text={`
                2.1. A indicação deve ser exclusivamente direcionada a terceiros,
                ou seja, pessoas ou empresas independentes e sem vínculo direto
                com o indicante.
            `}
              />
              <p style={{ paddingLeft: '16px', textAlign: 'justify' }}>
                2.2. É considerada indicação legítima quando:
                <br />
                <Document.Subclause
                  text={`
                • Um produtor indica um afiliado;
                `}
                />
                <br />
                <Document.Subclause
                  text={`
                  • Um afiliado indica outro afiliado;
                `}
                />
                <br />
                <Document.Subclause
                  text={`
                  • Uma empresa indica outra empresa;
                `}
                />
                <br />
                <Document.Subclause
                  text={`
                  • Um profissional indica um parceiro de fora da sua organização.
                `}
                />
                <br />
              </p>
            </div>
          </div>
          <div>
            <Document.Header headerTitle='3. VEDAÇÃO AO BENEFÍCIO PRÓPRIO' />
            <p style={{ paddingLeft: '16px' }}>
              <span
                style={{
                  paddingLeft: '8px',
                  textAlign: 'justify',
                  display: 'block',
                }}
              >
                3.1. É terminantemente proibido utilizar o sistema de indicação
                para fins de benefício próprio, configurando fraude ou tentativa
                de manipulação de comissões.
              </span>
              <br />
              <Document.Subclause
                text={`     
                • Um colaborador indicar a própria empresa ou alguém do mesmo CNPJ
                ou grupo societário;
              `}
              />
              <br />
              <Document.Subclause
                text={`     
                • Um sócio, funcionário ou representante legal indicar outro
                funcionário da mesma empresa;
              `}
              />
              <br />
              <Document.Subclause
                text={`     
                • Indicar fornecedores diretos, prestadores de serviço fixos ou
                parceiros já vinculados formal ou informalmente;
              `}
              />
              <br />
              <Document.Subclause
                text={`     
                • Indicar o próprio cônjuge, filhos, pais, irmãos ou demais
                familiares que pertençam ao mesmo núcleo familiar e/ou morem
                juntos.
              `}
              />
            </p>
          </div>
          <div>
            <Document.Header headerTitle='4. AUDITORIA E PENALIDADES' />
            <Document.Clause
              text={`
              4.1. A B4You se reserva o direito de auditar qualquer indicação
              feita no sistema a qualquer momento.
            `}
            />
            <p style={{ paddingLeft: '16px' }}>
              4.2. Caso seja identificada alguma violação às regras destes
              termos:
              <br />
              <br />
              <Document.Subclause
                text={`
                • O valor da comissão será cancelado ou estornado;
              `}
              />
              <br />
              <Document.Subclause
                text={`
                • A conta poderá ser suspensa temporariamente ou permanentemente;
              `}
              />
              <br />
              <Document.Subclause
                text={`
                • Em casos reincidentes ou de má-fé evidente, o indicante poderá
                ser removido da plataforma e sofrer sanções legais.
              `}
              />
            </p>
          </div>
          <div>
            <Document.Header headerTitle='5. CONFIRMAÇÃO E ACEITE' />
            <Document.Clause
              text={`
                5.1. Ao utilizar o sistema de indicação, o usuário declara ter lido
                e aceito integralmente os presentes Termos, comprometendo-se a agir
                com ética, transparência e lealdade com a comunidade B4You.
              `}
            />
          </div>
          <div>
            <Document.Header headerTitle='6. OBJETIVO DO PROGRAMA' />
            <Document.Clause
              text={`
              O Programa de Indicações da B4You tem como finalidade incentivar a
              recomendação de novos usuários à plataforma mediante o pagamento de
              comissões, conforme os critérios estabelecidos neste regulamento.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='7. CÁLCULO DA COMISSÃO' />{' '}
            <Document.Clause
              text={`              
              7.1. A comissão é de 10% (dez por cento) sobre o valor da taxa de
              intermediação efetivamente recebida pela B4You em cada venda
              realizada por contas indicadas.
            `}
            />
            <Document.Clause
              text={`              
              7.2. Exemplo: numa venda de R$ 1.000,00, com taxa padrão de 6,9% +
              R$ 2,00, a receita da B4You será de R$ 71,00. O valor da comissão
              será de 10% sobre esse montante, ou seja, R$ 7,10.
            `}
            />
            <Document.Clause
              text={`              
              7.3. A comissão incide exclusivamente sobre valores líquidos
              efetivamente recebidos pela B4You, não integrando o valor da venda
              ou o preço total do produto/serviço.
            `}
            />
            <Document.Clause
              text={`                
              7.4. O cálculo desconsidera vendas canceladas, estornadas ou não
              aprovadas.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='8. FORMA DE PAGAMENTO' />
            <Document.Clause
              text={`                
              8.1. O repasse das comissões será realizado fora do split de
              pagamento da plataforma, por meio de transferência direta, conforme
              dados bancários ou meio indicado pelo usuário.
            `}
            />
            <Document.Clause
              text={`                
              8.2. A B4You se reserva o direito de alterar a forma de repasse,
              inclusive inserindo o comissionado no split de pagamentos, caso seja
              tecnicamente viável e vantajoso para ambas as partes.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='9. PRAZO DE PAGAMENTO' />
            <Document.Clause
              text={`                
              9.1. As comissões serão apuradas mensalmente e liberadas após 30
              dias do encerramento do mês-calendário, sendo disponibilizadas na
              carteira virtual do usuário ou mediante outra forma de saque.
            `}
            />
            <Document.Clause
              text={`                
              9.2. Exemplo: comissões geradas entre 1º e 31 de janeiro serão pagas
              na primeira semana de março.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='10. PRAZO DE ELEGIBILIDADE À COMISSÃO' />
            <Document.Clause
              text={`                
              10.1. O chamado &quot;comissionador&quot; terá direito às comissões
              geradas por contas indicadas por um período de 12 (doze) meses
              contados da data de cadastro da conta indicada.
            `}
            />
            <Document.Clause
              text={`                
              10.2. Após este período, cessará automaticamente o direito ao
              recebimento de novas comissões, sem necessidade de aviso prévio.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='11. CRITÉRIOS DE PRIORIDADE EM INDICAÇÕES' />
            <Document.Clause
              text={`                
              11.1. Em caso de conflito de indicações entre usuários, prevalecerá
              a comissão para o usuário que indicou o produtor da conta (dono do
              produto).
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='12. BLOQUEIO DO PROGRAMA DE INDICAÇÕES' />
            <p style={{ paddingLeft: '16px', textAlign: 'justify' }}>
              12.1. A B4You poderá, a seu exclusivo critério, suspender ou
              cancelar o programa de indicações de determinado usuário, nas
              seguintes hipóteses:
              <br />
              <br />
              <Document.Subclause
                text={`
                • Indícios de fraude, duplicidade de contas ou má-fé;
              `}
              />
              <br />
              <Document.Subclause
                text={`
                • Indicações de baixa qualidade ou inconsistentes;
              `}
              />
              <br />
              <Document.Subclause
                text={`
                • Atividades que prejudiquem a imagem ou operação da B4You;
              `}
              />
              <br />
              <Document.Subclause
                text={`
                • Tentativas de burlar o rastreamento de indicações (ex: cookie
                stuffing).
              `}
              />
              <br />
            </p>
            <Document.Clause
              text={`                
              12.2. Nesses casos, não haverá pagamento de comissões pendentes,
              tampouco indenização de qualquer natureza.
            `}
            />
            <Document.Clause
              text={`                
              12.3. A B4You reserva-se o direito de não disponibilizar o programa
              de indicações a determinados produtores, conforme critérios internos
              de elegibilidade.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='13. ISENÇÃO DE RESPONSABILIDADE TRIBUTÁRIA DA B4YOU' />
            <Document.Clause
              text={`                
              13.1. O valor da comissão é tratado como custo operacional da B4You,
              deduzido da receita efetivamente percebida pela empresa com
              intermediação.
            `}
            />
            <Document.Clause
              text={`                
              13.2. O comissionado reconhece que a B4You não é responsável por
              qualquer recolhimento de tributos ou contribuições incidentes sobre
              os valores recebidos por ele a título de comissão, incluindo, mas
              não se limitando a, IRPF, ISS, INSS, PIS, COFINS e CSLL.
            `}
            />
            <Document.Clause
              text={`                
              13.3. O comissionado, ao aderir ao programa, assume integral
              responsabilidade pelo correto cumprimento de suas obrigações
              fiscais, declarando-se ciente de que os valores recebidos a esse
              título configuram renda própria, devendo ser corretamente declarados
              junto à autoridade tributária competente.
            `}
            />
            <Document.Clause
              text={`                
              13.4. O valor comissionado não compõe base de cálculo da receita
              bruta da B4You, por tratar-se de valor repassado a terceiro, em nome
              próprio e por conta própria.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='14. ALTERAÇÕES NO PROGRAMA' />
            <Document.Clause
              text={`                
              14.1. A B4You poderá modificar, suspender ou encerrar o programa de
              indicações a qualquer momento, sem necessidade de aviso prévio.
            `}
            />
            <p style={{ paddingLeft: '16px' }}>
              14.2. As alterações podem incluir, mas não se limitam a:
              <br />
              <br />
              <Document.Subclause
                text={`
                • Redução ou alteração da porcentagem de comissão;
              `}
              />
              <Document.Subclause
                text={`
                • Mudança na base de cálculo ou forma de pagamento; • Modificação
                no período de vigência das comissões.
              `}
              />
            </p>
            <Document.Clause
              text={`
              14.3. A continuidade no uso do programa após eventuais alterações
              implicará aceite automático dos novos termos.
            `}
            />
          </div>
          <div>
            <Document.Header headerTitle='15. DISPOSIÇÕES GERAIS' />
            <Document.Clause
              text={`
              15.1. Este regulamento constitui acordo integral entre as partes
              sobre o programa de indicações e substitui quaisquer comunicações
              anteriores.
            `}
            />
            <Document.Clause
              text={`
              15.2. Em caso de controvérsia, fica eleito o foro da comarca de
              Balneário Camboriú – SC, com renúncia de qualquer outro, por mais
              privilegiado que seja.
            `}
            />
            {!isRead && <div ref={observerEndDocument} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/display-name
Document.Header = function (props) {
  const { headerTitle } = props;

  return (
    <span
      style={{
        display: 'block',
        color: '#475569',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        paddingBottom: '8px',
      }}
    >
      {headerTitle}
    </span>
  );
};

// eslint-disable-next-line react/display-name
Document.Clause = function (props) {
  const { text } = props;
  return <p style={{ paddingLeft: '16px', textAlign: 'justify' }}>{text}</p>;
};

// eslint-disable-next-line react/display-name
Document.Subclause = function (props) {
  const { text } = props;
  return (
    <span
      style={{
        paddingLeft: '16px',
        textAlign: 'justify',
        display: 'block',
      }}
    >
      {text}
    </span>
  );
};
