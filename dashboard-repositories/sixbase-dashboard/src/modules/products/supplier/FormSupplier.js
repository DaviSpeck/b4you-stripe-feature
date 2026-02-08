import { useEffect, useState } from 'react';
import {
  Col,
  Form,
  FormLabel,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import Switch from 'react-switch';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const FormSupplier = ({ supplier, setEdit, fetchSupplier, uuidProduct }) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [inputValueSupplier, setInputValueSupplier] = useState(0);
  const [inputReceivesShipping, setInputReceivesShipping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  const { uuidProduct: paramsUuidProduct } = useParams();
  const productUuid = uuidProduct || paramsUuidProduct;

  const fetchOptions = async (query) => {
    try {
      const { data } = await api.get(
        `/products/${uuidProduct}/suppliers/find?email=${query}`
      );

      const newOptions = data.map((item) => ({
        label: `${item.email} - ${item.full_name}`,
        value: item.id,
      }));

      setOptions(newOptions);
    } catch (error) {
      return error;
    }
  };

  const handleCancel = () => {
    setEdit(false);
    setInputValue('');
    setInputValueSupplier(0);
    setInputReceivesShipping(false);
    setSelectedValue(null);
  };

  const createSupplier = async () => {
    try {
      setLoading(true);

      const data = {
        id_supplier: selectedValue.value,
        receives_shipping_amount: inputReceivesShipping,
        amount: inputValueSupplier,
      };

      await api.post(`/products/${uuidProduct}/suppliers/default`, data);

      notify({
        message: 'Fornecedor salvo com sucesso',
        type: 'success',
      });

      setEdit(false);
      await fetchSupplier();
    } catch (error) {
      notify({
        message: error?.response?.data?.message || 'Erro ao salvar fornecedor',
        type: 'error',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const editSupplier = async (id) => {
    try {
      setLoading(true);

      const data = {
        receives_shipping_amount: inputReceivesShipping,
        amount: inputValueSupplier,
      };

      await api.put(`/products/${uuidProduct}/suppliers/default/${id}`, data);

      notify({
        message: 'Fornecedor atualizado com sucesso',
        type: 'success',
      });

      setEdit(false);
      await fetchSupplier();
    } catch (error) {
      notify({
        message: error?.response?.data?.message || 'Erro ao editar fornecedor',
        type: 'error',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!supplier) {
      await createSupplier();
    } else {
      await editSupplier(supplier.id);
    }
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
  };

  useEffect(() => {
    if (inputValue && inputValue.includes('@')) {
      fetchOptions(inputValue);
    }
  }, [inputValue]);

  useEffect(() => {
    if (supplier) {
      setInputValue(`${supplier.email} - ${supplier.full_name}`);
      setInputValueSupplier(supplier.amount);
      setInputReceivesShipping(supplier.receives_shipping_amount);
      setSelectedValue({
        label: `${supplier.email} - ${supplier.full_name}`,
        value: supplier.id,
      });
    }
  }, [supplier]);

  return (
    <Col md={12}>
      <Row>
        <Col md={12}>
          <Row>
            <Col lg={6} md={12}>
              <Form.Group className='mt-3'>
                <FormLabel for='email'>Email</FormLabel>

                {!supplier ? (
                  <Select
                    options={options}
                    onInputChange={handleInputChange}
                    inputValue={inputValue}
                    onChange={handleChange}
                    isClearable
                    noOptionsMessage={() => {
                      return 'Nenhuma opção disponível';
                    }}
                    placeholder='Digite o e-mail do fornecedor'
                  />
                ) : (
                  <Form.Control
                    type='text'
                    name='email'
                    value={inputValue}
                    disabled
                    style={{
                      cursor: 'not-allowed',
                      backgroundColor: '#f8f9fa',
                    }}
                  />
                )}
              </Form.Group>
            </Col>

            <Col lg={6} md={12}>
              <Form.Group className='mt-3'>
                <div>
                  <FormLabel for='value_supplier'>
                    Valor da Comissão{' '}
                    {inputReceivesShipping && (
                      <span
                        className='text-muted'
                        style={{ fontSize: '0.9em' }}
                      >
                        (opcional)
                      </span>
                    )}
                  </FormLabel>

                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id={`tooltip-top`}>
                        Também é possível editar o valor do fornecedor direto na
                        oferta.
                      </Tooltip>
                    }
                  >
                    <i
                      className='fa fa-info-circle'
                      style={{
                        fontSize: '1.2em',
                        marginLeft: '5px',
                        cursor: 'pointer',
                      }}
                    />
                  </OverlayTrigger>
                </div>

                <CurrencyInput
                  className='form-control'
                  name='value_supplier'
                  placeholder='R$ 0,00'
                  value={inputValueSupplier}
                  decimalsLimit={2}
                  decimalSeparator=','
                  groupSeparator='.'
                  prefix='R$ '
                  onChange={(_, value) => {
                    setInputValueSupplier(value);
                  }}
                />
                <div className='d-flex align-items-center mt-3'>
                  <Switch
                    checked={inputReceivesShipping}
                    onChange={setInputReceivesShipping}
                    onColor='#4CAF50'
                    offColor='#ccc'
                    checkedIcon={false}
                    uncheckedIcon={false}
                    height={20}
                    width={40}
                  />
                  <span className='ml-2'>Recebe frete?</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className='mt-3 px-2'>
            <ButtonDS
              className='mr-2'
              size='md'
              disabled={
                loading ||
                !selectedValue ||
                (!inputReceivesShipping && !inputValueSupplier)
              }
              onClick={handleSubmit}
            >
              Salvar Fornecedor
            </ButtonDS>

            <ButtonDS
              disabled={loading}
              size='md'
              variant='danger'
              onClick={handleCancel}
            >
              Cancelar
            </ButtonDS>
          </Row>
        </Col>
      </Row>
    </Col>
  );
};

export default FormSupplier;
