import { Avatar } from '@material-ui/core';
import cepPromise from 'cep-promise';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Col,
  FormControl,
  FormGroup,
  Modal,
  NavDropdown,
  Row,
} from 'react-bootstrap';
import Confetti from 'react-confetti';
import { useForm } from 'react-hook-form';
import { Label } from 'react-konva';
import { Link } from 'react-router-dom';
import logo from '../images/logo-horizontal-header-dark.svg';
import ButtonDS from '../jsx/components/design-system/ButtonDS';
import { notify } from '../modules/functions';
import api from '../providers/api';
import { useCollaborator } from '../providers/contextCollaborator';
import { useUser } from '../providers/contextUser';
import './style.scss';
import { NewSidebar } from './layouts/sidebar/newSidebar';
import NotificationsBell from './components/NotificationsBell';

export const ProgressBarReward = () => {
  const { user } = useUser();

  const [showConfetti, setShowConfetti] = useState(false);
  const [reward, setReward] = useState(null);

  const calculateReward = () => {
    if (!user || user.reward == null) return null;

    let selectedString = '10M';
    let suffix = 'M';
    let max = 10000000;
    let shortTotal = user?.reward / 1000000;
    let progressList = [user?.reward / max, 1, 1, 1, 1, 1];

    if (user?.reward < 5000000) {
      selectedString = '5M';
      max = 5000000;
      suffix = 'M';
      shortTotal = user?.reward / 1000000;
      progressList = [0, user?.reward / max, 1, 1, 1, 1];
    }
    if (user?.reward < 1000000) {
      selectedString = '1M';
      max = 1000000;
      suffix = 'M';
      shortTotal = user?.reward / 1000000;
      progressList = [0, 0, user?.reward / max, 1, 1, 1];
    }
    if (user?.reward < 500000) {
      selectedString = '500K';
      max = 500000;
      suffix = 'K';
      shortTotal = user?.reward / 1000;
      progressList = [0, 0, 0, user?.reward / max, 1, 1];
    }
    if (user?.reward < 50000) {
      selectedString = '50K';
      max = 50000;
      suffix = 'K';
      shortTotal = user?.reward / 1000;
      progressList = [0, 0, 0, 0, user?.reward / max, 1];
    }
    if (user?.reward < 10000) {
      selectedString = '10K';
      max = 10000;
      suffix = 'K';
      shortTotal = user?.reward / 1000;
      progressList = [0, 0, 0, 0, 0, user?.reward / max];
    }
    if (user?.reward < 1000) {
      suffix = '';
      shortTotal = user?.reward;
    }

    let percent = (user?.reward / max) * 100;
    if (percent > 100) {
      percent = 100;
    }

    if (localStorage.getItem(`prevLastGoal-2-${user.uuid}`) === null) {
      localStorage.setItem(`prevLastGoal-2-${user.uuid}`, selectedString);
    }
    if (
      localStorage.getItem(`prevLastGoal-2-${user.uuid}`) &&
      localStorage.getItem(`prevLastGoal-2-${user.uuid}`) !== selectedString
    ) {
      localStorage.setItem(`prevLastGoal-2-${user.uuid}`, selectedString);
      setShowConfetti(true);
      setInterval(function () {
        setShowConfetti(false);
      }, 7000);
    }

    return {
      total: user?.reward,
      max,
      suffix,
      percent,
      selectedString,
      shortTotal,
      progressList,
    };
  };

  const calculatePercentage = (total) => {
    return total * 100;
  };

  const setLabelPercentage = (total) => {
    if (total === 0) {
      return 'light';
    }
    if (total !== 100 && total < 100) {
      return 'progression';
    }
    return 'done';
  };

  useEffect(() => {
    if (user && user.reward !== null) {
      setReward(calculateReward());
    }
  }, [user]);

  return (
    <a
      href='https://ajuda.b4you.com.br/post/724/premiacoes-b4you'
      target='_blank'
    >
      <div id='progress-bar'>
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        <div className='top'>
          <i
            className={`bx bx${showConfetti ? 's' : ''}-star ${showConfetti ? 'confetti' : ''
              }`}
          ></i>
          <div className='progress-number'>{reward?.percent.toFixed(0)}%</div>
          <div className='goal'>
            R$ {reward?.shortTotal.toFixed(2) + reward?.suffix} de R${' '}
            {reward?.selectedString}
          </div>
        </div>
        <div className='bottom'>
          <div className='list-progress'>
            <div className='progrees-item'>
              <div className='label'>10K</div>
              <progress
                value={calculatePercentage(reward?.progressList[5])}
                max='100'
                className={setLabelPercentage(reward?.progressList[5] * 100)}
              />
            </div>
            <div className='progrees-item'>
              <div className='label'>50K</div>
              <progress
                value={calculatePercentage(reward?.progressList[4])}
                max='100'
                className={setLabelPercentage(reward?.progressList[4] * 100)}
              />
            </div>
            <div className='progrees-item'>
              <div className='label'>500K</div>
              <progress
                value={calculatePercentage(reward?.progressList[3])}
                max='100'
                className={setLabelPercentage(reward?.progressList[3] * 100)}
              />
            </div>
            <div className='progrees-item'>
              <div className='label'>1M</div>
              <progress
                value={calculatePercentage(reward?.progressList[2])}
                max='100'
                className={setLabelPercentage(reward?.progressList[2] * 100)}
              />
            </div>
            <div className='progrees-item'>
              <div className='label'>5M</div>
              <progress
                value={calculatePercentage(reward?.progressList[1])}
                max='100'
                className={setLabelPercentage(reward?.progressList[1] * 100)}
              />
            </div>
            <div className='progrees-item'>
              <div className='label'>10M</div>
              <progress
                value={calculatePercentage(reward?.progressList[0])}
                max='100'
                className={setLabelPercentage(reward?.progressList[0] * 100)}
              />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

const userIsNotVerifiedOnPaymentProvider = (user) => {
  if (!user) return true;

  const {
    verified_pagarme,
    verified_company_pagarme,
    verified_company_pagarme_3,
    verified_pagarme_3,
  } = user;

  return ![
    verified_pagarme,
    verified_pagarme_3,
    verified_company_pagarme,
    verified_company_pagarme_3,
  ].includes(3);
};

const delivery = [
  {
    label: 'CEP',
    name: 'zipcode',
    required: 'CEP é obrigatório',
    isCep: true,
  },
  {
    label: 'Rua',
    name: 'street',
    required: 'Rua é obrigatório',
  },
  {
    label: 'Número',
    name: 'number',
    required: 'Número é obrigatório',
  },
  { label: 'Complemento', name: 'complement' },
  {
    label: 'Bairro',
    name: 'neighborhood',
    required: 'Bairro é obrigatório',
  },
  {
    label: 'Cidade',
    name: 'city',
    required: 'Cidade é obrigatório',
  },
  {
    label: 'País',
    name: 'country',
    required: 'País é obrigatório',
  },
  {
    label: 'Estado',
    name: 'state',
    required: 'Estado é obrigatório',
    isSelect: true,
  },
];

const Layout = ({ children }) => {
  const { user, setUser } = useUser();
  const { collaborator } = useCollaborator();
  const [requesting, setRequesting] = useState(false);
  const [toggleDisplay, setToggleDisplay] = useState(true);
  const history = useHistory();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showVerifyChoice, setShowVerifyChoice] = useState(false);
  const [shouldAskAddress, setShouldAskAddress] = useState(false);

  useEffect(() => {
    const status = localStorage.getItem('status-display');
    if (status === 'false') {
      setToggleDisplay(false);
    }

    if (children.props.path === '/') {
      localStorage.setItem(`status-display`, true);
      setToggleDisplay(true);
    }
  }, [children.props.path]);

  const statusProgress = () => {
    localStorage.setItem(`status-display`, false);
    setToggleDisplay(false);
  };

  const { register, handleSubmit, errors, formState, setValue, trigger, reset } =
    useForm({
      mode: 'onChange'
    });

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user?.address?.zipcode) {
      reset(user.address);
    }

    const hasZipcode = !!user?.address?.zipcode;

    if (!hasZipcode) {
      setShouldAskAddress(true);
    } else {
      setShouldAskAddress(false);
    }
  }, [user]);

  const onSubmit = (data) => {
    setRequesting(true);
    const dataToSend = {
      zipcode: data.zipcode,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      country: data.country,
    };

    if (dataToSend.complement === '') {
      delete dataToSend.complement;
    }

    api
      .put('/users/profile/address', dataToSend)
      .then(async () => {
        const { data } = await api.get('/auth/me');
        setUser(data);
        notify({
          message: 'Endereço salvo com sucesso',
          type: 'success',
        });
        let redirectPath = localStorage.getItem('redirectPathManager');
        if (
          redirectPath &&
          redirectPath !== '/acessar' &&
          redirectPath !== '/dashboard'
        ) {
          localStorage.removeItem('redirectPathManager');
          history.replace(redirectPath);
          return;
        }
      })
      .catch(() => {
        notify({
          message: 'Falha ao salvar o endereço',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  const getDelivery = (cep) => {
    cepPromise(cep)
      .then((r) => {
        setValue('street', r.street);
        setValue('neighborhood', r.neighborhood);
        setValue('city', r.city);
        setValue('state', r.state);
        trigger(['street', 'neighborhood', 'city', 'state']);
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      {shouldAskAddress && (
        <Modal show={shouldAskAddress} className='centered'>
          <Modal.Header>
            <Modal.Title>Preencha seu endereço</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className='mb-4'>
              Preencha as informações com o endereço da sua empresa ou onde você
              mora.
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                {delivery.length > 0 &&
                  delivery.map((input) => (
                    <Col md={6} key={input.name}>
                      <FormGroup>
                        <Label>{input.label}:</Label>

                        {input.isSelect ? (
                          <select
                            className='form-control'
                            name={input.name}
                            ref={register({ required: input.required })}
                          >
                            <option value='AC'>AC</option>
                            <option value='AL'>AL</option>
                            <option value='AP'>AP</option>
                            <option value='AM'>AM</option>
                            <option value='BA'>BA</option>
                            <option value='CE'>CE</option>
                            <option value='DF'>DF</option>
                            <option value='ES'>ES</option>
                            <option value='GO'>GO</option>
                            <option value='MA'>MA</option>
                            <option value='MT'>MT</option>
                            <option value='MS'>MS</option>
                            <option value='MG'>MG</option>
                            <option value='PA'>PA</option>
                            <option value='PB'>PB</option>
                            <option value='PR'>PR</option>
                            <option value='PE'>PE</option>
                            <option value='PI'>PI</option>
                            <option value='RJ'>RJ</option>
                            <option value='RN'>RN</option>
                            <option value='RS'>RS</option>
                            <option value='RO'>RO</option>
                            <option value='RR'>RR</option>
                            <option value='SC'>SC</option>
                            <option value='SP'>SP</option>
                            <option value='SE'>SE</option>
                            <option value='TO'>TO</option>
                          </select>
                        ) : !input.isCep ? (
                          <FormControl
                            name={input.name}
                            ref={register({ required: input.required })}
                          />
                        ) : (
                          <FormControl
                            name={input.name}
                            ref={register({ required: input.required })}
                            onChange={(e) => {
                              if (e.target.value.length === 8) {
                                getDelivery(e.target.value);
                              }
                            }}
                          />
                        )}
                        {errors[input.name] && (
                          <p style={{ color: 'red' }}>
                            {errors[input.name]?.message || input.required}
                          </p>
                        )}
                      </FormGroup>
                    </Col>
                  ))}

                <Col md={12}>
                  <ButtonDS
                    type='submit'
                    disabled={!formState.isValid}
                    className={'ml-auto mt-2'}
                  >
                    {requesting ? 'Carregando...' : 'Salvar endereço'}
                  </ButtonDS>
                </Col>
              </Row>
            </form>
          </Modal.Body>
        </Modal>
      )}
      <Modal
        show={showVerifyChoice}
        onHide={() => setShowVerifyChoice(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Como você quer se cadastrar?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className='mb-3'>Escolha o tipo de cadastro para continuar:</p>

          <div className='d-flex flex-column flex-md-row'>
            <Link
              to='/verificar-identidade' // fluxo atual de PF
              onClick={() => setShowVerifyChoice(false)}
              className='mr-md-2 mb-2'
            >
              <ButtonDS variant='primary' className='w-100'>
                Sou Pessoa Física (PF)
              </ButtonDS>
            </Link>

            <Link
              to='/configuracoes?tab=cnpj' // fluxo atual de PJ
              onClick={() => setShowVerifyChoice(false)}
            >
              <ButtonDS variant='primary' className='w-100'>
                Sou Pessoa Jurídica (PJ)
              </ButtonDS>
            </Link>
          </div>
        </Modal.Body>
      </Modal>

      {collaborator && (
        <div id='collaborator-header'>
          <div>
            Conta selecionada: <b>{collaborator.full_name}</b>
          </div>
        </div>
      )}

      {userIsNotVerifiedOnPaymentProvider(user) && (
        <div id='collaborator-header' className='collaborator-header-warning'>
          <div className='d-flex justify-content-center align-items-center'>
            <div className='text'>Finalize o seu cadastro para vender</div>
            <ButtonDS
              size='xs'
              className='ml-2'
              variant='warning'
              onClick={() => setShowVerifyChoice(true)}
            >
              Verificar
            </ButtonDS>
          </div>
        </div>
      )}

      <main id='master-main'>
        <div
          id='header-profile'
          style={{
            top:
              (user && !user.birth_date) ||
                userIsNotVerifiedOnPaymentProvider(user)
                ? '35px'
                : '0px',
          }}
        >
          <div className='mobile'>
            <div
              className='top1 d-flex w-100 justify-content-between aling-items-center'
              onClick={(e) =>
                e.target.classList.contains('top1') && setToggleDisplay(true)
              }
            >
              <div className='d-flex pd-2 mr-1 align-items-center'>
                <div
                  className={`hamburguer pointer`}
                  onClick={() => {
                    setIsMobileSidebarOpen((currentValue) => !currentValue);
                  }}
                >
                  <i className={`bx bx-menu-alt-left`}></i>
                </div>
                <Link to='/'>
                  <img src={logo} />
                </Link>
              </div>

              <div className='right d-flex align-items-center'>
                <NotificationsBell />
                <NavDropdown
                  className='p-0'
                  title={
                    <div className='d-flex align-items-center p-0 avatar'>
                      <div className='user mr-2 '>
                        <Avatar
                          src={user && user.profile_picture}
                          className='avatar'
                        />
                      </div>
                      <div
                        className='d-flex justify-content-center font-w500 user-name'
                        style={{ color: `#1F2633` }}
                      >
                        {user?.first_name}
                      </div>
                    </div>
                  }
                >
                  <NavDropdown.Item href='https://membros.b4you.com.br'>
                    <i className='bx bx-desktop mr-2 fs-16'></i>
                    <span className='fs-14'>Área de membros</span>
                  </NavDropdown.Item>

                  <NavDropdown.Item>
                    <Link to='/configuracoes'>
                      <i class='bx bx-cog mr-2 fs-16'></i>
                      <span className='fs-14'>Configurações</span>
                    </Link>
                  </NavDropdown.Item>

                  <NavDropdown.Divider></NavDropdown.Divider>

                  <NavDropdown.Item as={Link} to='/sair'>
                    <i class='bx bx-log-out mr-2 fs-16'></i>
                    <span className='fs-14'>Sair</span>
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            </div>

            <div
              className='bot w-100 justify-content-center align-items-center'
              style={{
                display: toggleDisplay ? `flex` : `none`,
              }}
            >
              <div
                className='d-flex align-items-center p-3'
                style={{ visibility: `hidden` }}
              >
                <i className='bx bx-chevron-up' style={{ fontSize: 21 }}></i>
              </div>
              <ProgressBarReward />
              <div
                className='d-flex align-items-center wrap-arrow-goal pointer'
                onClick={() => statusProgress(false)}
              >
                <i
                  className='bx bx-chevron-up'
                  style={{ fontSize: 21, color: `#0f1b35` }}
                ></i>
              </div>
            </div>
          </div>

          <div className='desktop d-flex justify-content-between'>
            <div style={{ maxWidth: `min-content` }}>
              <ProgressBarReward />
            </div>

            <div className='right d-flex align-items-center'>
              <NotificationsBell />

              <NavDropdown
                className='p-0'
                title={
                  <div className='d-flex align-items-center p-0 avatar'>
                    <div className='user mr-2 '>
                      <Avatar
                        src={user && user.profile_picture}
                        className='avatar'
                      />
                    </div>
                    <div
                      className='d-flex justify-content-center font-w500 user-name'
                      style={{ color: `#1F2633` }}
                    >
                      {user?.first_name}
                    </div>
                  </div>
                }
              >
                <NavDropdown.Item href='https://membros.b4you.com.br'>
                  <i className='bx bx-desktop mr-2 fs-16'></i>
                  <span className='fs-14'>Área de membros</span>
                </NavDropdown.Item>

                <NavDropdown.Item>
                  <Link to='/configuracoes'>
                    <i class='bx bx-cog mr-2 fs-16'></i>
                    <span className='fs-14'>Configurações</span>
                  </Link>
                </NavDropdown.Item>

                <NavDropdown.Divider></NavDropdown.Divider>

                <NavDropdown.Item as={Link} to='/sair'>
                  <i class='bx bx-log-out mr-2 fs-16'></i>
                  <span className='fs-14'>Sair</span>
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </div>
        </div>

        <NewSidebar
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <div
          className={`container-fluid ${(userIsNotVerifiedOnPaymentProvider(user) && ` spacingTop`) ||
            (user && !user.birth_date && ` spacingTop`) ||
            (!toggleDisplay && window.innerWidth <= 1000 && ` removeSpacing`)
            }`}
        >
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
