import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useProduct } from '../../providers/contextProduct';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ReactSwitch from 'react-switch';
import { notify } from '../functions';
import api from '../../providers/api';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const MemberConfig = () => {
  const { register, handleSubmit, errors, setValue } = useForm({
    mode: 'onChange',
  });

  const [requesting, setRequesting] = useState(false);
  const { uuidProduct } = useParams();
  const { product, setProduct } = useProduct();

  const [charCount, setCharCount] = useState(0);
  const [charCount2, setCharCount2] = useState(0);
  const maxChar = 1000;
  const maxChar2 = 300;

  const [anchorView, setAnchorView] = useState(false);

  const getAnchorView = () => {
    api.get(`/products/anchors/${uuidProduct}/anchor-view`).then(({ data }) => {
      setAnchorView(data.anchor_view);
    });
  };
  const handleCharCount = (e) => {
    let text = e.target.value;
    let currentCount = text.length;

    setCharCount(currentCount);
  };

  const handleCharCount2 = (e) => {
    let text = e.target.value;
    let currentCount = text.length;

    setCharCount2(currentCount);
  };

  const updateAnchorView = () => {
    const prevAnchor = anchorView;
    setAnchorView((prevAnchorView) => !prevAnchorView);
    api
      .put(`/products/anchors/${uuidProduct}/anchor-view`, {
        anchor_view: !prevAnchor,
      })
      .then(() => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch(() => {
        setAnchorView(prevAnchor);
        notify({ message: 'Erro ao salvar', type: 'error' });
      });
  };

  const onSubmit = (data) => {
    setRequesting(true);

    api
      .put(`/products/${uuidProduct}/general`, data)
      .then((response) => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setProduct(response.data);
      })
      .catch(() => {
        notify({ message: 'Erro', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  useEffect(() => {
    getAnchorView();
  }, []);

  useEffect(() => {
    if (product) {
      const description = product.description || '';
      const biography = product.biography || '';

      setCharCount(description.length);
      setCharCount2(biography.length);

      setValue('description', description);
      setValue('biography', biography);
    }
  }, [product, setValue]);

  return (
    <>
      <div className='mb-4'>
        <h4>Seções</h4>
        <p>Organize e ordene os módulos em seções verticais.</p>

        <ReactSwitch
          onChange={() => {
            updateAnchorView({ anchor_view: !anchorView });
          }}
          checked={anchorView}
          checkedIcon={false}
          uncheckedIcon={false}
          onColor='#0f1b35'
          onHandleColor='#fff'
          boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
          activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
          handleDiameter={24}
          height={30}
          width={56}
          className='react-switch'
        />
        {anchorView && (
          <Row className='mt-2'>
            <Col md={3}>
              <AlertDS
                variant='warning'
                text={
                  'Não se esqueça de configurar as Seções dentro da aba Seções em Conteúdo'
                }
              ></AlertDS>
            </Col>
          </Row>
        )}
      </div>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className='form-group'>
                {product.content_delivery === 'membership' && (
                  <>
                    <label htmlFor=''>
                      * Descrição na Área de Membros -{' '}
                      <small>
                        {charCount}/{maxChar} caracteres
                      </small>
                    </label>

                    <Form.Control
                      as='textarea'
                      ref={register({
                        required: 'Campo Obrigatório',
                      })}
                      name='description'
                      rows='3'
                      defaultValue={product.description || ''}
                      placeholder={`Máximo de ${maxChar} caracteres.`}
                      onChange={handleCharCount}
                      maxLength={maxChar}
                      isInvalid={errors.description}
                      className={
                        !errors.description
                          ? 'form-control'
                          : 'form-control is-invalid'
                      }
                    />
                    <div className='form-error'>
                      {errors.description && (
                        <span>{errors.description.message}</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {product.content_delivery === 'membership' && (
                <div className='form-group'>
                  <label htmlFor=''>
                    Biografia do produtor -{' '}
                    <small>
                      {charCount2}/{maxChar2} caracteres
                    </small>
                  </label>
                  <Form.Control
                    as='textarea'
                    ref={register()}
                    name='biography'
                    rows='3'
                    defaultValue={product.biography || ''}
                    onChange={handleCharCount2}
                    placeholder='Máximo de 300 carácteres.'
                    maxLength={maxChar2}
                    isInvalid={errors.biography}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className='mt-4'>
        <ButtonDS onClick={handleSubmit(onSubmit)} disabled={requesting}>
          {!requesting ? 'Salvar' : 'Salvando...'}
        </ButtonDS>
      </div>
    </>
  );
};

export default MemberConfig;
