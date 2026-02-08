import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';
import { PatternFormat } from 'react-number-format';
import cepPromise from 'cep-promise';

const PrizeAddressForm = ({ data, setData }) => {
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

  console.log(isValid);

  const getDelivery = (cep) => {
    cepPromise(cep)
      .then((r) => {
        console.log(r);
        setValue('street_prize', r.street);
        setValue('neighborhood_prize', r.neighborhood);
        setValue('city_prize', r.city);
        setValue('state_prize', r.state);
        clearErrors('zipcode_prize');
      })
      .catch(() => {
        setError('zipcode_prize', {
          type: 'manual',
          message: 'Insira um CEP válido',
        });
      });
  };

  const onSubmit = (formData) => {
    setRequesting(true);

    const body = {
      city: formData.city_prize,
      state: formData.state_prize,
      neighborhood: formData.neighborhood_prize,
      street: formData.street_prize,
      number: formData.number_prize,
      complement: formData.complement_prize,
      zipcode: formData.zipcode_prize,
    };

    api
      .put('/users/profile/address-prize', body)
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
      const prizeData = {
        city_prize: data.city_prize || '',
        state_prize: data.state_prize || '',
        neighborhood_prize: data.neighborhood_prize || '',
        street_prize: data.street_prize || '',
        number_prize: data.number_prize || '',
        complement_prize: data.complement_prize || '',
        zipcode_prize: (data.zipcode_prize || '').replace('-', ''),
      };
      reset(prizeData);
    }
  }, [data, reset]);

  return (
    <div>
      <div className='d-flex flex-column flex-md-row mb-4'>
        <h4>Endereço</h4>
        <p className='ml-0 ml-md-2'>(para entrega de premiação)</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <label>CEP</label>
            <Controller
              name='zipcode_prize'
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
                    errors.zipcode_prize ? 'is-invalid' : ''
                  }`}
                  placeholder='CEP'
                />
              )}
            />
            {errors.zipcode_prize && (
              <p className='text-danger'>{errors.zipcode_prize.message}</p>
            )}
          </Col>

          <Col md={6}>
            <label>Logradouro</label>
            <input
              name='street_prize'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Número</label>
            <input
              name='number_prize'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Complemento</label>
            <input
              name='complement_prize'
              ref={register}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Bairro</label>
            <input
              name='neighborhood_prize'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={3}>
            <label>Cidade</label>
            <input
              name='city_prize'
              ref={register({ required: true })}
              className='form-control'
              type='text'
            />
          </Col>

          <Col md={4}>
            <label>Estado</label>
            <select name='state_prize' ref={register} className='form-control'>
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
              disabled={Object.keys(errors).length > 0 || requesting}
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

export default PrizeAddressForm;
