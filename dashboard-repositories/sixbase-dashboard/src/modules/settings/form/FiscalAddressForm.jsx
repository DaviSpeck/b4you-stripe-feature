import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';
import { PatternFormat } from 'react-number-format';
import cepPromise from 'cep-promise';

const FiscalAddressForm = ({ data, setData }) => {
  const [requesting, setRequesting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    clearErrors,
    setError,
    formState: { isValid, errors },
  } = useForm({ mode: 'onChange' });

  const getDelivery = (cep) => {
    cepPromise(cep)
      .then((r) => {
        setValue('street', r.street);
        setValue('neighborhood', r.neighborhood);
        setValue('city', r.city);
        setValue('state', r.state);
        clearErrors('zipcode');
      })
      .catch(() => {
        setError('zipcode', {
          type: 'manual',
          message: 'Insira um CEP válido',
        });
      });
  };

  const onSubmit = (formData) => {
    setRequesting(true);

    const body = {
      city: formData.city,
      state: formData.state,
      neighborhood: formData.neighborhood,
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      zipcode: formData.zipcode,
    };

    api
      .put('/users/profile/address', body)
      .then((response) => {
        setData((oldData) => ({ ...oldData, ...response.data }));
        notify({ message: 'Endereço salvo com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Falha ao salvar o endereço', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  useEffect(() => {
    if (data) {
      const formValues = {
        city: data.city || '',
        state: data.state || '',
        neighborhood: data.neighborhood || '',
        street: data.street || '',
        number: data.number || '',
        complement: data.complement || '',
        zipcode: (data.zipcode || '').replace('-', ''),
      };
      reset(formValues);
    }
  }, [data, reset]);

  return (
    <div>
      <h4 className='mb-4'>Endereço Fiscal</h4>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <label>CEP</label>
            <Controller
              name='zipcode'
              control={control}
              rules={{ required: true }}
              render={({ value, onChange }) => (
                <PatternFormat
                  value={value}
                  onValueChange={({ value }) => {
                    if (value.length === 8) getDelivery(value);
                    onChange(value);
                  }}
                  format='#####-###'
                  valueIsNumericString
                  className={`form-control ${
                    errors.zipcode ? 'is-invalid' : ''
                  }`}
                  placeholder='CEP'
                />
              )}
            />
            {errors.zipcode && (
              <p className='text-danger'>{errors.zipcode.message}</p>
            )}
          </Col>

          <Col md={6}>
            <label>Logradouro</label>
            <input
              name='street'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Número</label>
            <input
              name='number'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Complemento</label>
            <input
              name='complement'
              ref={register}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Bairro</label>
            <input
              name='neighborhood'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Cidade</label>
            <input
              name='city'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={4}>
            <label>Estado</label>
            <select name='state' ref={register} className='form-control'>
              {[
                'AC',
                'AL',
                'AP',
                'AM',
                'BA',
                'CE',
                'DF',
                'ES',
                'GO',
                'MA',
                'MT',
                'MS',
                'MG',
                'PA',
                'PB',
                'PR',
                'PE',
                'PI',
                'RJ',
                'RN',
                'RS',
                'RO',
                'RR',
                'SC',
                'SP',
                'SE',
                'TO',
              ].map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Col>
        </Row>

        <Row>
          <Col className='mt-3'>
            <ButtonDS
              variant='primary'
              size='sm'
              type='submit'
              disabled={!isValid || requesting}
              outline
            >
              {!requesting ? 'Salvar Informações' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      </form>
    </div>
  );
};

export default FiscalAddressForm;
