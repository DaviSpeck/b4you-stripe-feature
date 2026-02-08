import ptBR from 'date-fns/locale/pt-BR';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  FormLabel,
  InputGroup,
  OverlayTrigger,
  Row,
  Tab,
  Tabs,
  Tooltip,
} from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import DataTable from 'react-data-table-component';
import { registerLocale } from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import Switch from 'react-switch';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import { useUser } from '../../../providers/contextUser';
import Loader from '../../../utils/loader';
import regexUrl from '../../../utils/regex-url';
import NoDataComponentContent from '../../NoDataComponentContent';
import ModalOfferCheckout from './modal-offer-checkout';
import PlansList from './plans';
import { Upsells } from './upsells';

const discounts = [5, 10, 15, 20, 30, 35, 40, 45, 50, 55, 60];

const columns = memoizeOne(
  (uuidProduct, activeOffer, ButtonDS, suppliers, setSuppliers, notify) => [
    {
      name: 'Fornecedor',
      cell: ({ email }) => email,
      sortable: false,
      minWidth: '260px',
    },
    {
      name: `Comissão`,
      cell: (item) => {
        const [edit, setEdit] = useState(false);
        const [valueNewAmount, setValueNewAmount] = useState(item.amount);

        const newAmount = () => {
          api
            .put(
              `/products/offers/${uuidProduct}/${activeOffer.uuid}/suppliers/${item.id}`,
              { amount: valueNewAmount }
            )
            .then(() => {
              const newItem = suppliers.find(
                (element) => element.id === item.id
              );
              newItem.amount = valueNewAmount;

              notify({
                message: 'Sucesso ao alterar comissão',
                type: 'success',
              });
            })
            .catch(() => {
              notify({
                message: 'Falha ao alterar comissão',
                type: 'error',
              });
            })
            .finally(() => setEdit(false));
        };

        return (
          <div className='d-flex justify-content-between w-100'>
            <div className='d-flex align-items-center'>
              {!edit ? (
                <>
                  <div className='d-flex' style={{ minWidth: 20 }}>
                    R$
                  </div>
                  {valueNewAmount}
                </>
              ) : (
                <CurrencyInput
                  className='form-control'
                  name='value_supplier'
                  placeholder={item.amount}
                  value={valueNewAmount}
                  decimalsLimit={2}
                  decimalSeparator=','
                  groupSeparator='.'
                  prefix='R$ '
                  onChange={(_, value) => {
                    setValueNewAmount(value);
                  }}
                />
              )}
            </div>
            <div className='d-flex align-items-center'>
              {!edit ? (
                <ButtonDS
                  size={'icon'}
                  className='ml-2'
                  onClick={() => setEdit(true)}
                  outline
                  style={{ width: 22, height: 22 }}
                >
                  <i className='bx bxs-pencil' style={{ fontSize: 14 }}></i>
                </ButtonDS>
              ) : (
                <>
                  <ButtonDS
                    size={'icon'}
                    className='ml-2'
                    onClick={() => newAmount()}
                    outline
                    variant='success'
                    style={{ width: 22, height: 22 }}
                  >
                    <i className='bx bx-check'></i>
                  </ButtonDS>
                  <ButtonDS
                    size={'icon'}
                    className='ml-1'
                    onClick={() => setEdit(false)}
                    outline
                    variant='danger'
                    style={{ width: 22, height: 22 }}
                  >
                    <i className='bx bx-x'></i>
                  </ButtonDS>
                </>
              )}
            </div>
          </div>
        );
      },
      minWidth: '200px',
    },
    {
      name: 'Recebe Frete',
      cell: (item) => {
        const [receivesShipping, setReceivesShipping] = useState(
          item.receives_shipping_amount
        );
        const [loading, setLoading] = useState(false);

        const toggleShipping = () => {
          const newValue = !receivesShipping;

          // Se o novo valor for FALSE e o amount for 0 ou vazio, força para 0.01
          const correctedAmount =
            !newValue && (!item.amount || parseFloat(item.amount) === 0)
              ? 0.01
              : item.amount;

          setReceivesShipping(newValue);
          setLoading(true);

          api
            .put(
              `/products/offers/${uuidProduct}/${activeOffer.uuid}/suppliers/${item.id}`,
              {
                receives_shipping_amount: newValue,
                amount: correctedAmount,
              }
            )
            .then(() => {
              item.receives_shipping_amount = newValue;
              item.amount = correctedAmount; // atualiza também localmente se foi alterado
              notify({
                message: 'Fornecedor atualizado com sucesso',
                type: 'success',
              });
            })
            .catch(() => {
              setReceivesShipping(!newValue); // rollback
              notify({
                message: 'Erro ao atualizar frete',
                type: 'error',
              });
            })
            .finally(() => setLoading(false));
        };
        return (
          <Switch
            checked={receivesShipping}
            onChange={toggleShipping}
            disabled={loading}
            onColor='#4CAF50'
            offColor='#ccc'
            checkedIcon={false}
            uncheckedIcon={false}
            height={20}
            width={40}
          />
        );
      },
      center: true,
      minWidth: '150px',
    },
    {
      name: `Remover`,
      cell: (item) => {
        const [removing, setRemoving] = useState(false);

        const handleRemove = () => {
          setRemoving(true);
          api
            .delete(
              `/products/offers/${uuidProduct}/${activeOffer.uuid}/suppliers/${item.id}`
            )
            .then(() => {
              setSuppliers((prev) =>
                prev.filter((element) => element.id !== item.id)
              );

              notify({
                message: 'Sucesso ao remover fornecedor',
                type: 'success',
              });
            })
            .catch(() => {
              notify({
                message: 'Falha ao remover fornecedor',
                type: 'error',
              });
            })
            .finally(() => {
              setRemoving(false);
            });
        };

        return (
          <ButtonDS
            variant='danger'
            size='icon'
            disabled={removing}
            onClick={handleRemove}
          >
            {removing ? (
              <i className='bx bx-loader-alt bx-spin'></i>
            ) : (
              <i className='bx bx-trash-alt'></i>
            )}
          </ButtonDS>
        );
      },
      center: true,
    },
  ]
);

export default function ModalOfferForm({
  activeOffer,
  setActiveOffer,
  classrooms,
  products,
  uuidProduct,
  setShowModal,
  notify,
  setNav,
  nav,
}) {
  const [tabContent, setTabContent] = useState('general');
  const { user } = useUser();
  const [requesting, setRequesting] = useState(false);
  const [inputReceivesShipping, setInputReceivesShipping] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [inputValueSupplier, setInputValueSupplier] = useState(0);
  const [selectedValue, setSelectedValue] = useState(null);
  const [addingSupplier, setAddingSupplier] = useState(false);

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [isOfferActive, setIsOfferActive] = useState(
    activeOffer ? activeOffer.active : true
  );
  const [isCounterActive, setIsCounterActive] = useState(
    activeOffer && activeOffer.counter && activeOffer.counter.active === true
      ? true
      : false
  );

  const [isCounterThreeStepsActive, setIsCounterThreeStepsActive] = useState(
    activeOffer &&
      activeOffer.counter_three_steps &&
      activeOffer.counter_three_steps.active === true
      ? true
      : false
  );

  const [hasUpsell, setHasUpsell] = useState(
    activeOffer ? (activeOffer.thankyou_page_upsell ? true : false) : false
  );
  const [, setValidSubmit] = useState(true);
  const [removing, setRemoving] = useState(false);

  const [refundSuppliers, setRefundSuppliers] = useState(
    activeOffer ? activeOffer.refund_suppliers : false
  );

  const hasTwoCardsFeature = user?.features?.includes('two_cards');

  const [startsAt, setStartsAt] = useState(null);
  const [endsAt, setEndsAt] = useState(null);

  const { product } = useProduct();

  const minimumOfferPrice = 5;
  const maximumOfferPrice = 200000;

  const [terms, setTerms] = useState(activeOffer?.terms || false);
  const [showCnpj, setShowCnpj] = useState(activeOffer?.show_cnpj || false);
  const [urlTerms, setUrlTerms] = useState(activeOffer?.url_terms || '');
  const [errorTerms, setErrorTerms] = useState(
    !regexUrl(activeOffer?.url_terms)
  );

  const [skuList, setSkuList] = useState([]);
  const [inputValueSku, setInputValueSku] = useState('');
  const [isUpsellNative, setIsUpsellNative] = useState(false);
  const [isUpsellActive, setIsUpsellActive] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const handleAddSku = () => {
    if (inputValueSku.trim() === '') return;

    setSkuList((prevList) => [
      ...prevList,
      { sku: inputValueSku.trim(), quantity: 1, price: 1 },
    ]);
    setInputValueSku('');
  };

  const handleEdit = (index, field, value) => {
    const updatedList = [...skuList];
    updatedList[index][field] = field === 'quantity' ? Number(value) : value;
    if (field === 'price') {
      const parsedValue = parseFloat(value) || 1;
      updatedList[index][field] = parsedValue;
    }
    setSkuList(updatedList);
  };

  const [popup, setPopup] = useState({
    active: false,
    mouseMove: false,
    closePage: false,
    afterTime: false,
    coupon: null,
    popup_delay: 0,
    popup_title: '',
    popup_discount_text: '',
    popup_button_text: '',
    popup_secondary_text: '',
    hex_color_bg: '#DB0000',
    hex_color_text: '#FFFFFF',
    hex_color_button: '#51B55B',
    hex_color_button_text: '#FFFFFF',
  });
  const [activePopup, setActivePopup] = useState(false);
  const [activeMoveMouse, setActiveMoveMouse] = useState(false);
  const [activeClosePage, setActiveClosePage] = useState(false);
  const [activeAfterTime, setActiveAfterTime] = useState(false);
  const [selectedCoupom, setSelectedCoupom] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    watch,
    errors,
    setValue,
  } = useForm({
    mode: 'onChange',
  });

  const allow_affiliate = watch('allow_affiliate');
  const toggle_commission = watch('toggle_commission');
  const counter_seconds = watch('counter_seconds');
  const counter_label = watch('counter_label');
  const counter_label_end = watch('counter_label_end');
  const counter_color = watch('counter_color');
  const free_sample = watch('free_sample');
  const counter_seconds_three_steps = watch('counter_seconds_three_steps');
  const installments_without_interest = watch('installments_without_interest');
  const counter_label_three_steps = watch('counter_label_three_steps');
  const counter_label_end_three_steps = watch('counter_label_end_three_steps');

  registerLocale('pt-BR', ptBR);
  moment.locale('pt-br');

  const [dimensions, setDimensions] = useState(() => ({
    length: activeOffer?.dimensions?.length || '',
    width: activeOffer?.dimensions?.width || '',
    height: activeOffer?.dimensions?.height || '',
    weight: activeOffer?.dimensions?.weight || '',
  }));

  const [metadata, setMetadata] = useState(
    activeOffer?.metadata || ''
  );

  const handleMetadataChange = (e) => {
    setMetadata(e.target.value);
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setDimensions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = (data) => {
    if (terms && errorTerms) return;
    setRequesting('post');
    let fields = data;
    fields.metadata = metadata || null;

    fields.terms = terms;
    fields.url_terms = urlTerms;
    fields.show_cnpj = showCnpj;

    fields.active = isOfferActive;
    fields.refund_suppliers = refundSuppliers;

    if (startsAt) {
      fields.start_offer = moment(startsAt).format('DD/MM/YYYY HH:mm:ss');
    } else {
      fields.start_offer = null;
    }
    if (endsAt) {
      fields.end_offer = moment(endsAt).format('DD/MM/YYYY HH:mm:ss');
    } else {
      fields.end_offer = null;
    }

    if (fields.price) {
      fields.price = isNaN(fields.price)
        ? fields.price.replace('.', '').replace(',', '.')
        : fields.price;
    }

    if (fields.upsell_product) {
      if (fields.upsell_product === 'none') {
        fields.upsell = null;
        fields.upsell_product = null;
      }
    }

    if (fields.discount_pix === '0') {
      fields.discount_pix = null;
    }
    if (fields.discount_billet === '0') {
      fields.discount_billet = null;
    }
    if (fields.discount_card === '0') {
      fields.discount_card = null;
    }

    if (fields.affiliate_commission) {
      fields.affiliate_commission = parseFloat(fields.affiliate_commission);
    }

    if (fields.enable_two_cards_payment) {
      fields.enable_two_cards_payment =
        fields.enable_two_cards_payment === 'true';
    }

    if (fields.installments_without_interest && parseInt(fields.installments_without_interest) >= 2) {
      fields.student_pays_interest = 'false';
    }

    if (fields.installments_without_interest === '0') {
      fields.installments_without_interest = null;
    }

    if (isCounterActive) {
      const counter = {
        active: isCounterActive,
        seconds: counter_seconds,
        label: counter_label,
        label_end: counter_label_end,
        color: counter_color,
      };
      fields = { ...fields, counter };
    } else {
      const counter = {
        active: false,
        seconds: 0,
        label: '',
        label_end: '',
        color: counter_color,
      };
      fields = { ...fields, counter };
    }

    if (isCounterThreeStepsActive) {
      const counter_three_steps = {
        active: isCounterThreeStepsActive,
        seconds: counter_seconds_three_steps,
        label: counter_label_three_steps,
        label_end: counter_label_end_three_steps,
      };
      fields = { ...fields, counter_three_steps };
    } else {
      const counter_three_steps = {
        active: false,
        seconds: 0,
        label: '',
        label_end: '',
      };
      fields = { ...fields, counter_three_steps };
    }

    if (skuList) {
      if (skuList.length > 0) {
        fields.bling_sku = JSON.stringify(skuList);
      } else {
        fields.bling_sku = null;
      }
    }

    // if (skuList) {
    //   if (skuList.length > 0) {
    //     fields.bling_sku = JSON.stringify(skuList);
    //   } else if (inputValueSku) {
    //     fields.bling_sku = inputValueSku;
    //   } else {
    //     fields.bling_sku = null;
    //   }
    // }

    if (inputValueSku) {
      fields.bling_sku = inputValueSku;
    }

    const requiredTextFieldsFilled =
      popup.popup_title && popup.popup_discount_text && popup.popup_button_text;

    if (activePopup && !selectedCoupom) {
      notify({
        message: 'Selecione um cupom para o popup',
        type: 'error',
      });
      setRequesting(false);
      return;
    }

    if (activePopup && !requiredTextFieldsFilled) {
      notify({
        message: 'Preencha todos os campos de texto obrigatórios do popup',
        type: 'error',
      });
      setRequesting(false);
      return;
    }

    fields.popup = {
      ...popup,
      active: activePopup,
      mouseMove: activeMoveMouse,
      closePage: activeClosePage,
      afterTime: activeAfterTime,
      coupon: selectedCoupom ? selectedCoupom : null,
    };

    fields.dimensions = {
      length: Number(dimensions.length) || null,
      width: Number(dimensions.width) || null,
      height: Number(dimensions.height) || null,
      weight: Number(dimensions.weight) || null,
    };

    if (!activeOffer) {
      api
        .post(`/products/offers/${uuidProduct}`, fields)
        .then((response) => {
          setActiveOffer(response.data);
          notify({ message: 'Salvo com sucesso', type: 'success' });
          setHasUpsell(true);
          setRequesting(false);
        })
        .catch((err) => {
          if (err.response) {
            const { message } = err.response.data;
            notify({ message, type: 'error' });
          } else {
            notify({ message: 'Falha ao salvar', type: 'error' });
          }

          setRequesting(false);
        });
    } else {
      api
        .put(`/products/offers/${uuidProduct}/${activeOffer.uuid}`, fields)
        .then((r) => {
          setValue('is_upsell_native', fields.is_upsell_native);
          setShowModal(false);
          notify({ message: 'Salvo com sucesso', type: 'success' });
          setRequesting(false);
          setHasUpsell(true);
          setActiveOffer((prev) => ({
            ...prev,
            is_upsell_native: fields.is_upsell_native,
            thankyou_page_upsell: r.data.thankyou_page_upsell,
          }));
        })
        .catch((err) => {
          if (err.response) {
            const { message } = err.response.data;
            notify({ message, type: 'error' });
          } else {
            notify({ message: 'Falha ao salvar', type: 'error' });
          }
          setRequesting(false);
        });
    }
  };

  const handleRemoveOffer = () => {
    setRequesting('delete');
    setRemoving(true);

    api
      .delete(`/products/offers/${uuidProduct}/${activeOffer.uuid}`)
      .then(() => {
        setShowModal(false);
        notify({ message: 'Removido com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Erro ao remover', type: 'error' });
      })
      .finally(() => {
        setRequesting(false);
        setRemoving(false);
      });
  };

  const addNewSupplier = () => {
    setAddingSupplier(true);
    api
      .post(`/products/offers/${uuidProduct}/${activeOffer.uuid}/suppliers`, {
        amount: inputValueSupplier,
        receives_shipping_amount: inputReceivesShipping,
        id_supplier: selectedValue.value,
      })
      .then((r) => {
        setSuppliers((prev) => [...prev, r.data]);
        notify({
          message: 'Sucesso ao convidar fornecedor',
          type: 'success',
        });
        setSelectedValue(null);
        setInputValueSupplier(0);
        setInputReceivesShipping(false);
        setInputValue('');
      })
      .catch((err) => {
        notify({
          message:
            err?.response?.data?.message || 'Falha ao convidar fornecedor',
          type: 'error',
        });
      })
      .finally(() => {
        setAddingSupplier(false);
      });
  };

  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
  };

  const fetchOptions = async (query) => {
    api
      .get(
        `/products/offers/${uuidProduct}/${activeOffer.uuid}/suppliers/find?email=${query}`
      )
      .then((r) => {
        const newOptions = r.data.map((item) => ({
          label: `${item.email} - ${item.full_name}`,
          value: item.id,
        }));
        setOptions(newOptions);
      })
      .catch((err) => err);
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  // const handleAddSku = () => {
  //   if (inputValueSku.trim() === '') return;

  //   setSkuList((prevList) => [
  //     ...prevList,
  //     { sku: inputValueSku.trim(), quantity: 1, price: 1 },
  //   ]);
  //   setInputValueSku('');
  // };

  // const handleEdit = (index, field, value) => {
  //   const updatedList = [...skuList];
  //   updatedList[index][field] = field === 'quantity' ? Number(value) : value;
  //   if (field === 'price') {
  //     const parsedValue = parseFloat(value) || 1;
  //     updatedList[index][field] = parsedValue;
  //   }
  //   setSkuList(updatedList);
  // };

  useEffect(() => {
    if (activeOffer) {
      api
        .get(`/products/offers/${uuidProduct}/${activeOffer.uuid}/suppliers`)
        .then((r) => setSuppliers(r.data))
        .catch((err) => err);

      setIsUpsellNative(activeOffer.is_upsell_native);
      setIsUpsellActive(activeOffer.is_upsell_active ?? true);

      let fields = { ...activeOffer };

      fields.allow_affiliate = activeOffer.allow_affiliate ? true : false;
      fields.toggle_commission = activeOffer.toggle_commission ? true : false;
      fields.affiliate_commission =
        parseFloat(activeOffer.affiliate_commission) || 1;

      fields.affiliate_visible = activeOffer.affiliate_visible ? true : false;
      fields.type = activeOffer?.type?.id;

      if (activeOffer?.metadata) {
        setMetadata(
        typeof activeOffer.metadata === 'string'
          ? activeOffer.metadata
          : JSON.stringify(activeOffer.metadata, null, 2)
        );
      } else {
        setMetadata('');
      }

      if (activeOffer.start_offer) {
        setStartsAt(
          moment(activeOffer.start_offer, 'DD/MM/YYYY HH:mm:ss').toDate()
        );
      }
      if (activeOffer.end_offer) {
        setEndsAt(
          moment(activeOffer.end_offer, 'DD/MM/YYYY HH:mm:ss').toDate()
        );
      }
      if (activeOffer.discount_pix === null) {
        fields.discount_pix = 0;
      }
      if (activeOffer.discount_billet === null) {
        fields.discount_billet = 0;
      }
      if (activeOffer.discount_card === null) {
        fields.discount_card = 0;
      }
      if (fields.counter && fields.counter.active) {
        setIsCounterActive(fields.counter.active);
      }

      if (fields.counter_three_steps && fields.counter_three_steps.active) {
        setIsCounterThreeStepsActive(fields.counter_three_steps.active);
      }

      if (activeOffer.bling_sku) {
        setInputValueSku(activeOffer.bling_sku);
      }
      if (fields.bling_sku) {
        let skuList;
        try {
          skuList = JSON.parse(fields.bling_sku);
        } catch (error) {
          skuList = fields.bling_sku.split(',').map((sku) => ({
            sku: sku.trim(),
            quantity: 1,
          }));
        }
        setSkuList(skuList);
      }
      if (fields.popup) {
        setActivePopup(fields.popup.active);
        setActiveMoveMouse(fields.popup.mouseMove);
        setActiveClosePage(fields.popup.closePage);
        setActiveAfterTime(fields.popup.afterTime);
        setSelectedCoupom(fields.popup.coupon);
        setPopup({
          active: fields.popup.active,
          mouseMove: fields.popup.mouseMove,
          closePage: fields.popup.closePage,
          afterTime: fields.popup.afterTime,
          coupon: fields.popup.coupon,
          popup_delay: fields.popup.popup_delay,
          popup_title: fields.popup.popup_title,
          popup_discount_text: fields.popup.popup_discount_text,
          popup_button_text: fields.popup.popup_button_text,
          popup_secondary_text: fields.popup.popup_secondary_text,
          hex_color_bg: fields.popup.hex_color_bg,
          hex_color_text: fields.popup.hex_color_text,
          hex_color_button: fields.popup.hex_color_button,
          hex_color_button_text: fields.popup.hex_color_button_text,
        });
      }

      reset({
        ...fields,
        name: fields.name,
        description: fields.description,
        alternative_name: fields.alternative_name,
        price: fields.price,
        classroom_id: fields.classroom ? fields.classroom.uuid : null,
        allow_affiliate: fields.allow_affiliate,
        toggle_commission: fields.toggle_commission,
        affiliate_commission: fields.affiliate_commission,
        affiliate_visible: fields.affiliate_visible ? 'true' : 'false',
        discount_card: fields.discount_card,
        discount_pix: fields.discount_pix,
        discount_billet: fields.discount_billet,
        thankyou_page_upsell: fields.thankyou_page_upsell,
        installments: fields.installments,
        installments_without_interest: fields.installments_without_interest || '0',
        payment_methods: fields.payment_methods,
        student_pays_interest: fields.student_pays_interest,
        payment_type: fields.payment_type,
        sales_page_url: fields.sales_page_url,
        require_address: fields.require_address,
        shipping_type: fields.shipping_type,
        allow_shipping_region: fields.allow_shipping_region,
        shipping_price: fields.shipping_price,
        shipping_price_no: fields.shipping_price_no,
        shipping_price_ne: fields.shipping_price_ne,
        shipping_price_co: fields.shipping_price_co,
        shipping_price_so: fields.shipping_price_so,
        shipping_price_su: fields.shipping_price_su,
        counter_active: fields.counter ? fields.counter.active : false,
        counter_seconds: fields.counter ? fields.counter.seconds : 0,
        counter_label: fields.counter ? fields.counter.label : '',
        counter_label_end: fields.counter ? fields.counter.label_end : '',
        counter_color: fields.counter ? fields.counter.color : '#7ed321',
        quantity: fields.quantity,
        free_sample: fields.free_sample ? 'true' : 'false',
        shipping_text: fields.shipping_text,
        allow_coupon: fields.allow_coupon,
        enable_two_cards_payment: fields.enable_two_cards_payment
          ? 'true'
          : 'false',
        bling_sku: fields.bling_sku,
        is_upsell_active: fields.is_upsell_active,
        is_upsell_native: fields.is_upsell_native,
        counter_active_three_steps: fields.counter_three_steps
          ? fields.counter_three_steps.active
          : false,
        counter_seconds_three_steps: fields.counter_three_steps
          ? fields.counter_three_steps.seconds
          : 0,
        counter_label_three_steps: fields.counter_three_steps
          ? fields.counter_three_steps.label
          : '',
        counter_label_end_three_steps: fields.counter_three_steps
          ? fields.counter_three_steps.label_end
          : '',
        tiny_sku: fields.tiny_sku,

      });
    } else {
      reset({});
    }
  }, [activeOffer]);

  useEffect(() => {
    if (free_sample === 'true') {
      if (watch('shipping_type') === '0') {
        if (activeOffer && activeOffer.shipping_type !== 0) {
          setValue('shipping_type', activeOffer.shipping_type);
        } else {
          setValue('shipping_type', '1');
        }
      }
    } else {
      if (activeOffer && activeOffer.shipping_type !== 0) {
        setValue('shipping_type', activeOffer.shipping_type);
      } else {
        setValue('shipping_type', '0');
      }
    }
  }, [free_sample]);

  useEffect(() => {
    if (installments_without_interest) {
      const installments = parseInt(installments_without_interest);
      if (installments === 1) {
        setValue('student_pays_interest', 'true');
      } else if (installments >= 2) {
        setValue('student_pays_interest', 'false');
      }
    }
  }, [installments_without_interest, setValue]);

  useEffect(() => {
    if (errors.price) {
      notify({
        message: 'Preencha o campo Preço na aba Pagamento',
        type: 'error',
      });
    }
  }, [errors]);

  useEffect(() => {
    if (inputValue && inputValue.includes('@')) {
      fetchOptions(inputValue);
    }
  }, [inputValue]);

  return (
    <form
      autoComplete='off'
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Tabs
        defaultActiveKey='general'
        className='mb-4 tabs-offer-new'
        variant='pills'
        onSelect={(option) => setTabContent(option)}
      >
        <Tab
          eventKey='general'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bxs-cog' />
              <span className='ml-2'>Geral</span>
            </div>
          }
        >
          <Row>
            {activeOffer && (
              <Col md={12}>
                <div className='form-group' id='produt-uuid-wrap'>
                  <label for='uuid-offer-input'>ID da oferta</label>
                  <div className='d-flex'>
                    <Form.Control
                      id='uuid-offer-input'
                      type='url'
                      value={activeOffer.uuid}
                      readOnly
                      onClick={() => {
                        let copyText =
                          document.querySelector('#uuid-offer-input');
                        copyText.select();
                        document.execCommand('copy');
                        notify({
                          message: 'ID copiado com sucesso',
                          type: 'success',
                        });
                      }}
                      style={{ borderRadius: '8px 0px 0px 8px' }}
                    />
                    <Button
                      variant={'primary'}
                      onClick={() => {
                        let copyText =
                          document.querySelector('#uuid-offer-input');
                        copyText.select();
                        document.execCommand('copy');
                        notify({
                          message: 'ID copiado com sucesso',
                          type: 'success',
                        });
                      }}
                      className='d-flex align-items-center'
                      style={{ borderRadius: '0px 8px 8px 0px', padding: 12 }}
                    >
                      <i
                        className='bx bx-copy-alt'
                        style={{ fontSize: 21 }}
                      ></i>
                    </Button>
                  </div>
                </div>
              </Col>
            )}

            <Col md={12}>
              <Form.Group>
                <div className='d-flex align-items-center'>
                  <Switch
                    onChange={() => {
                      setIsOfferActive(!isOfferActive);
                    }}
                    checked={isOfferActive}
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
                  <span className='ml-2'>
                    {isOfferActive ? (
                      <span>Essa oferta está ativa</span>
                    ) : (
                      <span className='text-danger'>
                        Essa oferta <b>NÃO</b> está ativa
                      </span>
                    )}
                  </span>
                </div>
              </Form.Group>
            </Col>
            {activeOffer && activeOffer.has_bling && (
              <Col md={12}>
                <Form.Group>
                  <label htmlFor='bling_sku'>BLING SKU</label>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id='tooltip-top'>
                        Insira um SKU e clique no botão para adicioná-lo à
                        tabela.
                      </Tooltip>
                    }
                  >
                    <i
                      style={{ paddingTop: '4px', cursor: 'help' }}
                      className='bx bx-info-circle ml-1'
                    ></i>
                  </OverlayTrigger>
                  <InputGroup>
                    <Form.Control
                      name='bling_sku'
                      type='text'
                      onChange={(e) => setInputValueSku(e.target.value)}
                      ref={register({
                        pattern: {
                          value: /^[A-Za-z0-9/-]+$/,
                          message:
                            'Apenas letras, números, / e - são permitidos',
                        },
                      })}
                      isInvalid={errors.bling_sku}
                      value={inputValueSku}
                    />
                    {/* <Button
                      variant='primary'
                      style={{ borderRadius: '0px 8px 8px 0px', padding: 12 }}
                      onClick={handleAddSku}
                      className='d-flex align-center'
                    >
                      <i className='bx bx-plus' style={{ fontSize: 21 }}></i>
                    </Button> */}
                  </InputGroup>
                  <div className='form-error'>
                    {errors.bling_sku && (
                      <span>{errors.bling_sku.message}</span>
                    )}
                  </div>
                </Form.Group>
                {/* {skuList.length > 0 && (
                  <>
                    <Table striped bordered hover size='sm'>
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Quantidade</th>
                          <th>Preço Unitário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skuList.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <Form.Control
                                type='text'
                                value={item.sku}
                                onChange={(e) =>
                                  handleEdit(index, 'sku', e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <Form.Control
                                type='number'
                                value={item.quantity}
                                min='1'
                                onChange={(e) =>
                                  handleEdit(index, 'quantity', e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <Form.Group>
                                <label htmlFor={`item_price_${index}`}>
                                  Preço
                                </label>
                                <Controller
                                  control={control}
                                  name={`item_price_${index}`}
                                  defaultValue={item.price || 0}
                                  render={({ onChange, ...rest }, props) => (
                                    <CurrencyInput
                                      {...rest}
                                      {...props}
                                      className='form-control'
                                      decimalSeparator=','
                                      thousandSeparator='.'
                                      value={item.price || ''}
                                      onChangeEvent={(
                                        _e,
                                        _maskedValue,
                                        floatValue
                                      ) => {
                                        handleEdit(index, 'price', floatValue);
                                        onChange(floatValue);
                                      }}
                                    />
                                  )}
                                  rules={{ required: 'Campo obrigatório.' }}
                                />
                                <div className='form-error'>
                                  <span>
                                    {errors?.[`item_price_${index}`]?.message}
                                  </span>
                                </div>
                              </Form.Group>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Button
                      variant='danger'
                      style={{
                        padding: '4px 8px',
                        float: 'right',
                        marginLeft: 'auto',
                      }}
                      onClick={() => setSkuList([])}
                    >
                      Limpar SKUs
                    </Button>
                  </>
                )} */}
              </Col>
            )}
            {activeOffer && activeOffer.has_tiny && (
              <Col md={12}>
                <Form.Group>
                  <label htmlFor=''>TINY SKU</label>
                  <Form.Control
                    ref={register}
                    name='tiny_sku'
                    type='tiny_sku'
                    isInvalid={errors.tiny_sku}
                  />
                  <div className='form-error'>
                    {errors.tiny_sku && <span> {errors.tiny_sku.message}</span>}
                  </div>
                </Form.Group>
              </Col>
            )}
            <Col md={12}>
              <Form.Group>
                <div
                  style={{
                    display: 'flex',
                    justifyItems: 'center',
                  }}
                >
                  <label htmlFor=''>Nome Oferta</label>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id={`tooltip-top-invisible-offer`}>
                        Ao preencher o campo, você pode ter uma versão
                        simplificada ou personalizada do nome da sua oferta no
                        checkout, podendo ser utilizado para melhor
                        identificação interna ou para uma melhor exibição para o
                        seu cliente.
                      </Tooltip>
                    }
                  >
                    <i
                      style={{ paddingTop: '4px', cursor: 'help' }}
                      className='bx bx-info-circle ml-1'
                    ></i>
                  </OverlayTrigger>
                </div>
                {activeOffer && activeOffer.has_tiny && (
                  <Col md={12}>
                    <Form.Group>
                      <label htmlFor=''>TINY SKU</label>
                      <Form.Control
                        ref={register}
                        name='tiny_sku'
                        type='tiny_sku'
                        isInvalid={errors.tiny_sku}
                      />
                      <div className='form-error'>
                        {errors.tiny_sku && (
                          <span> {errors.tiny_sku.message}</span>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                )}
                <Form.Control
                  ref={register({
                    required: 'Campo obrigatório.',
                    minLength: {
                      value: 3,
                      message: 'Deve conter no mínimo 3 digitos.',
                    },
                  })}
                  name='name'
                  type='name'
                  isInvalid={errors.name}
                />
                <div className='form-error'>
                  {errors.name && <span> {errors.name.message}</span>}
                </div>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <div
                  style={{
                    display: 'flex',
                    justifyItems: 'center',
                  }}
                >
                  <label htmlFor=''>Descrição da Oferta</label>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id={`tooltip-top-invisible-offer`}>
                        Ao preencher o texto você adicionará detalhes relevantes
                        sobre o seu produto no checkout, ajudando a esclarecer
                        informações para os clientes e melhorar a experiência de
                        compra.
                      </Tooltip>
                    }
                  >
                    <i
                      style={{ paddingTop: '4px', cursor: 'help' }}
                      className='bx bx-info-circle ml-1'
                    ></i>
                  </OverlayTrigger>
                </div>
                <Form.Control
                  ref={register({
                    minLength: {
                      value: 3,
                      message: 'Deve conter no mínimo 3 digitos.',
                    },
                  })}
                  name='description'
                  type='description'
                  isInvalid={errors.description}
                />
                <div className='form-error'>
                  {errors.description && (
                    <span> {errors.description.message}</span>
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <label htmlFor=''>Nome Alternativo</label>
                <Form.Control
                  ref={register({
                    minLength: {
                      value: 3,
                      message: 'Deve conter no mínimo 3 digitos.',
                    },
                  })}
                  name='alternative_name'
                  type='alternative_name'
                  isInvalid={errors.alternative_name}
                />
                <div className='form-error'>
                  {errors.alternative_name && (
                    <span> {errors.alternative_name.message}</span>
                  )}
                </div>
              </Form.Group>
            </Col>
            {product.type === 'video' && (
              <Col md={12}>
                <Form.Group>
                  <label htmlFor=''>Turma</label>
                  <Form.Control ref={register} as='select' name='classroom_id'>
                    {classrooms.map((item, index) => {
                      return (
                        <option
                          value={item.uuid}
                          key={index}
                          selected={
                            activeOffer
                              ? item?.uuid === activeOffer?.classroom?.uuid
                              : false
                          }
                        >
                          {item.label}
                        </option>
                      );
                    })}
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            <Col md={12}>
              <Form.Group>
                <label htmlFor='allow_affiliate'>Afiliados</label>
                <Form.Control ref={register} as='select' name='allow_affiliate'>
                  <option value={`false`}>Não Podem Vender</option>
                  <option value={`true`}>Podem Vender</option>
                </Form.Control>
              </Form.Group>
            </Col>
            {allow_affiliate === 'true' && (
              <Col md={12}>
                <Form.Group>
                  <label>Comissão por oferta</label>
                  <Form.Control
                    ref={register}
                    as='select'
                    name='toggle_commission'
                  >
                    <option value={`true`}>Sim</option>
                    <option value={`false`}>Não</option>
                  </Form.Control>
                </Form.Group>
                {toggle_commission === 'true' && (
                  <Form.Group>
                    <label>Comissão</label>
                    <Controller
                      as={CurrencyInput}
                      control={control}
                      name='affiliate_commission'
                      suffix='%'
                      selectAllOnFocus
                      className={
                        errors.affiliate_commission
                          ? 'form-control is-invalid'
                          : 'form-control'
                      }
                      rules={{
                        required: true,
                        validate: (value) => {
                          if (isNaN(value)) {
                            if (
                              parseFloat(value.replace('%', '')) > 0 &&
                              parseFloat(value.replace('%', '')) <= 100
                            ) {
                              return true;
                            } else {
                              return false;
                            }
                          } else {
                            if (value > 0 && value <= 100) {
                              return true;
                            }
                            return false;
                          }
                        },
                      }}
                      precision='0'
                      maxLength={4}
                    />
                  </Form.Group>
                )}
                <Form.Group>
                  <label
                    htmlFor='affiliate_visible'
                    className='d-flex align-items-center'
                  >
                    Oferta visível
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Tooltip id={`tooltip-top-invisible-offer`}>
                          Ao desabilitar esta opção o seu afiliado ganhará a
                          comissão da oferta normalmente, porém não poderá
                          divulgar esse link isoladamente. Essa função é
                          aplicada, principalmente, para determinados produtos
                          que são vendidos em conjunto e só há lucro quando essa
                          oferta é vendida juntamente com outra, como em casos
                          de produtos com descontos que são aplicados em Order
                          Bump e Upsell, podendo ser usada por outra razão a
                          critério do produtor.
                        </Tooltip>
                      }
                    >
                      <i className='bx bx-info-circle ml-2'></i>
                    </OverlayTrigger>
                  </label>
                  <Form.Control
                    ref={register}
                    as='select'
                    name='affiliate_visible'
                  >
                    <option value={`true`}>Sim</option>
                    <option value={`false`}>Não</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            {product.type !== 'physical' && (
              <Col md={12}>
                <Form.Group>
                  <label htmlFor='require_address'>Endereço no checkout</label>
                  <Form.Control
                    ref={register}
                    as='select'
                    name='require_address'
                    defaultValue={'false'}
                  >
                    <option value={'true'}>Sim</option>
                    <option value={'false'}>Não</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            <Col md={12}>
              <Form.Group>
                <label htmlFor='require_address'>Permitir Cupom</label>
                <Form.Control
                  ref={register}
                  as='select'
                  name='allow_coupon'
                  defaultValue={'true'}
                >
                  <option value={'true'}>Sim</option>
                  <option value={'false'}>Não</option>
                </Form.Control>
              </Form.Group>
            </Col>
            {hasTwoCardsFeature && product.payment_type !== 'subscription' && (
              <Col md={12}>
                <Form.Group>
                  <label htmlFor='enable_two_cards_payment'>
                    Permitir Compra com Dois Cartões
                  </label>
                  <Form.Control
                    ref={register}
                    as='select'
                    name='enable_two_cards_payment'
                    defaultValue={'false'}
                  >
                    <option value={'true'}>Sim</option>
                    <option value={'false'}>Não</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            {product.type === 'physical' && (
              <>
                <Col md={6}>
                  <Form.Group>
                    <label htmlFor='shipping_type'>Frete</label>
                    {watch('free_sample') === 'true' ? (
                      <Form.Control
                        ref={register}
                        as='select'
                        name='shipping_type'
                      >
                        <option value={'1'}>
                          Fixo - Dividido com afiliado
                        </option>
                        <option value={'2'}>
                          Fixo - Dividido com co-produtor
                        </option>
                        <option value={'3'}>
                          Fixo - Apenas para o produtor
                        </option>
                      </Form.Control>
                    ) : (
                      <Form.Control
                        ref={register}
                        as='select'
                        name='shipping_type'
                      >
                        <option value={'0'}>Grátis</option>
                        <option value={'1'}>
                          Fixo - Dividido com afiliado
                        </option>
                        <option value={'2'}>
                          Fixo - Dividido com co-produtor
                        </option>
                        <option value={'3'}>
                          Fixo - Apenas para o produtor
                        </option>
                      </Form.Control>
                    )}
                  </Form.Group>
                </Col>
              </>
            )}
            {product.type === 'physical' &&
              watch('allow_shipping_region') !== '1' &&
              (watch('free_sample') === 'true' ||
                watch('shipping_type') !== '0') && (
                <Col md={6}>
                  <Form.Group>
                    <label htmlFor='shipping_price'>Preço do frete</label>
                    <Controller
                      control={control}
                      name='shipping_price'
                      defaultValue={0}
                      render={({ onChange, ...rest }, props) => (
                        <CurrencyInput
                          {...rest}
                          {...props}
                          className={
                            errors.shipping_price
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
                          decimalSeparator=','
                          thousandSeparator='.'
                          onChangeEvent={(_e, _masked, floatValue) => {
                            onChange(floatValue);
                          }}
                        />
                      )}
                      rules={{
                        required:
                          watch('allow_shipping_region') === '1'
                            ? 'Campo obrigatório.'
                            : false,
                        validate: (value) => {
                          if (free_sample === 'true') {
                            if (
                              value >= minimumOfferPrice &&
                              value < maximumOfferPrice
                            ) {
                              return true;
                            } else {
                              return false;
                            }
                          } else {
                            return value > 0;
                          }
                        },
                      }}
                    />
                    <div className='form-error'>
                      <span>{errors?.shipping_price?.message}</span>
                    </div>
                  </Form.Group>
                </Col>
              )}
            {product.type === 'physical' && (
              <>
                {watch('shipping_type') !== '0' && (
                  <>
                    <Col md={12}>
                      <label htmlFor='allow_shipping_region'>
                        Frete por região
                      </label>
                      <Form.Group>
                        <Form.Control
                          ref={register}
                          as='select'
                          name='allow_shipping_region'
                        >
                          <option value={'0'}>Não</option>
                          <option value={'1'}>Sim</option>
                        </Form.Control>
                      </Form.Group>
                      {watch('allow_shipping_region') === '1' && (
                        <>
                          <Row>
                            <Col md={3}>
                              <Form.Group>
                                <label htmlFor='shipping_price_no'>
                                  Região Norte
                                </label>
                                <Controller
                                  control={control}
                                  id='shipping_price_no'
                                  name='shipping_price_no'
                                  defaultValue={0}
                                  render={({ onChange, ...rest }, props) => (
                                    <CurrencyInput
                                      {...rest}
                                      {...props}
                                      className={
                                        errors.shipping_price_no
                                          ? 'form-control is-invalid'
                                          : 'form-control'
                                      }
                                      decimalSeparator=','
                                      thousandSeparator='.'
                                      onChangeEvent={(
                                        _e,
                                        _masked,
                                        floatValue
                                      ) => {
                                        onChange(floatValue);
                                      }}
                                    />
                                  )}
                                  rules={{
                                    required: 'Campo obrigatório.',
                                    validate: (value) => {
                                      if (free_sample === 'true') {
                                        if (
                                          value >= minimumOfferPrice &&
                                          value < maximumOfferPrice
                                        ) {
                                          return true;
                                        } else {
                                          return false;
                                        }
                                      } else {
                                        return value > 0;
                                      }
                                    },
                                  }}
                                />
                                <div className='form-error'>
                                  <span>{errors?.shipping_price?.message}</span>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group>
                                <label htmlFor='shipping_price_ne'>
                                  Região Nordeste
                                </label>
                                <Controller
                                  control={control}
                                  name='shipping_price_ne'
                                  defaultValue={0}
                                  render={({ onChange, ...rest }, props) => (
                                    <CurrencyInput
                                      {...rest}
                                      {...props}
                                      className={
                                        errors.shipping_price_ne
                                          ? 'form-control is-invalid'
                                          : 'form-control'
                                      }
                                      decimalSeparator=','
                                      thousandSeparator='.'
                                      onChangeEvent={(
                                        _e,
                                        _masked,
                                        floatValue
                                      ) => {
                                        onChange(floatValue);
                                      }}
                                    />
                                  )}
                                  rules={{
                                    required: 'Campo obrigatório.',
                                    validate: (value) => {
                                      if (free_sample === 'true') {
                                        if (
                                          value >= minimumOfferPrice &&
                                          value < maximumOfferPrice
                                        ) {
                                          return true;
                                        } else {
                                          return false;
                                        }
                                      } else {
                                        return value > 0;
                                      }
                                    },
                                  }}
                                />
                                <div className='form-error'>
                                  <span>{errors?.shipping_price?.message}</span>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group>
                                <label htmlFor='shipping_price_co'>
                                  Centro Oeste
                                </label>
                                <Controller
                                  control={control}
                                  name='shipping_price_co'
                                  defaultValue={0}
                                  render={({ onChange, ...rest }, props) => (
                                    <CurrencyInput
                                      {...rest}
                                      {...props}
                                      className={
                                        errors.shipping_price_co
                                          ? 'form-control is-invalid'
                                          : 'form-control'
                                      }
                                      decimalSeparator=','
                                      thousandSeparator='.'
                                      onChangeEvent={(
                                        _e,
                                        _masked,
                                        floatValue
                                      ) => {
                                        onChange(floatValue);
                                      }}
                                    />
                                  )}
                                  rules={{
                                    required: 'Campo obrigatório.',
                                    validate: (value) => {
                                      if (free_sample === 'true') {
                                        if (
                                          value >= minimumOfferPrice &&
                                          value < maximumOfferPrice
                                        ) {
                                          return true;
                                        } else {
                                          return false;
                                        }
                                      } else {
                                        return value > 0;
                                      }
                                    },
                                  }}
                                />
                                <div className='form-error'>
                                  <span>{errors?.shipping_price?.message}</span>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group>
                                <label htmlFor='shipping_price_so'>
                                  Região Sudeste
                                </label>
                                <Controller
                                  control={control}
                                  name='shipping_price_so'
                                  defaultValue={0}
                                  render={({ onChange, ...rest }, props) => (
                                    <CurrencyInput
                                      {...rest}
                                      {...props}
                                      className={
                                        errors.shipping_price_so
                                          ? 'form-control is-invalid'
                                          : 'form-control'
                                      }
                                      decimalSeparator=','
                                      thousandSeparator='.'
                                      onChangeEvent={(
                                        _e,
                                        _masked,
                                        floatValue
                                      ) => {
                                        onChange(floatValue);
                                      }}
                                    />
                                  )}
                                  rules={{
                                    required: 'Campo obrigatório.',
                                    validate: (value) => {
                                      if (free_sample === 'true') {
                                        if (
                                          value >= minimumOfferPrice &&
                                          value < maximumOfferPrice
                                        ) {
                                          return true;
                                        } else {
                                          return false;
                                        }
                                      } else {
                                        return value > 0;
                                      }
                                    },
                                  }}
                                />
                                <div className='form-error'>
                                  <span>{errors?.shipping_price?.message}</span>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group>
                                <label htmlFor='shipping_price_su'>
                                  Região Sul
                                </label>
                                <Controller
                                  control={control}
                                  name='shipping_price_su'
                                  defaultValue={0}
                                  render={({ onChange, ...rest }, props) => (
                                    <CurrencyInput
                                      {...rest}
                                      {...props}
                                      className={
                                        errors.shipping_price_su
                                          ? 'form-control is-invalid'
                                          : 'form-control'
                                      }
                                      decimalSeparator=','
                                      thousandSeparator='.'
                                      onChangeEvent={(
                                        _e,
                                        _masked,
                                        floatValue
                                      ) => {
                                        onChange(floatValue);
                                      }}
                                    />
                                  )}
                                  rules={{
                                    required: 'Campo obrigatório.',
                                    validate: (value) => {
                                      if (free_sample === 'true') {
                                        if (
                                          value >= minimumOfferPrice &&
                                          value < maximumOfferPrice
                                        ) {
                                          return true;
                                        } else {
                                          return false;
                                        }
                                      } else {
                                        return value > 0;
                                      }
                                    },
                                  }}
                                />
                                <div className='form-error'>
                                  <span>{errors?.shipping_price?.message}</span>
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Col>
                  </>
                )}

                <Col md={6}>
                  <Form.Group>
                    <label htmlFor=''>Quantidade</label>
                    <Form.Control
                      ref={register({
                        required: 'Digite um número.',
                        validate: {
                          positive: (value) => parseInt(value) > 0,
                        },
                      })}
                      name='quantity'
                      type='number'
                      defaultValue={'1'}
                      isInvalid={errors.quantity}
                    />
                    <div className='form-error'>
                      {errors.quantity && (
                        <span> {errors.quantity.message}</span>
                      )}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <label htmlFor='free_sample'>Oferta Amostra Grátis</label>
                    <Form.Control ref={register} as='select' name='free_sample'>
                      <option value={'false'}>Não</option>
                      <option value={'true'}>Sim</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </>
            )}
            {product.payment_type === 'subscription' && (
              <Col md={12} className='form-group'>
                <label htmlFor=''>Método de Pagamento</label>
                <Form.Control
                  as='select'
                  name='payment_methods'
                  ref={register}
                  className='form-control'
                  defaultValue={
                    product.payment_type === 'single'
                      ? 'credit_card,billet,pix'
                      : 'credit_card,pix'
                  }
                >
                  {product.payment_type === 'single' ? (
                    <>
                      <option value='credit_card,billet,pix'>
                        Cartão de crédito, boleto e Pix
                      </option>
                      <option value='credit_card,billet'>
                        Cartão de crédito e boleto
                      </option>
                      <option value='credit_card,pix'>
                        Cartão de crédito e Pix
                      </option>
                    </>
                  ) : (
                    <>
                      <option value='credit_card,pix'>
                        Cartão de crédito e Pix
                      </option>
                    </>
                  )}
                  <option value='credit_card'>Apenas cartão de crédito</option>
                  <option value='pix'>Apenas Pix</option>
                </Form.Control>
              </Col>
            )}
          </Row>
        </Tab>
        {product.payment_type === 'subscription' && (
          <Tab
            eventKey='subs-plans'
            title={
              <span>
                <i className='bx bxs-analyse mr-1'></i> Planos de Assinatura
              </span>
            }
          >
            <Row>
              <Col>
                <div className='plans-list'>
                  <PlansList
                    nav={nav}
                    setNav={setNav}
                    activeOffer={activeOffer}
                    setActiveOffer={setActiveOffer}
                    products={products}
                    setValidSubmit={setValidSubmit}
                    uuidProduct={uuidProduct}
                  />
                </div>
              </Col>
            </Row>
          </Tab>
        )}

        <Tab
          eventKey='price'
          color='danger'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-dollar-circle mr-1'></i>
              <span className='ml-2'>Pagamento</span>
            </div>
          }
        >
          <Row>
            {product.payment_type === 'single' && (
              <Col md={6} className='mb-2'>
                <Form.Group>
                  <label htmlFor=''>Preço</label>
                  <Controller
                    control={control}
                    name='price'
                    defaultValue={0}
                    render={({ onChange, ...rest }, props) => (
                      <CurrencyInput
                        {...rest}
                        {...props}
                        className={
                          errors.price
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                        decimalSeparator=','
                        thousandSeparator='.'
                        onChangeEvent={(_e, _masked, floatValue) => {
                          onChange(floatValue);
                        }}
                        disabled={watch('free_sample') === 'true'}
                      />
                    )}
                    rules={{
                      required: 'Campo obrigatório.',
                      validate: (value) => {
                        if (free_sample === 'true') {
                          return value >= 0;
                        }
                        if (
                          value >= minimumOfferPrice &&
                          value < maximumOfferPrice
                        ) {
                          return true;
                        } else {
                          return false;
                        }
                      },
                    }}
                  />
                  <div className='form-error'>
                    {errors.price && <span> {errors.price.message}</span>}
                  </div>
                </Form.Group>
              </Col>
            )}
          </Row>
          {product.payment_type === 'single' && (
            <Row className='mb-2'>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Desconto Cartão</Form.Label>
                  <Form.Control name='discount_card' as='select' ref={register}>
                    <option key={`discount_card_0`} value={0}>
                      Sem desconto
                    </option>
                    {discounts.map((d) => (
                      <option key={`discount_card_${d}`} value={d}>
                        {d} %
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Desconto PIX</Form.Label>
                  <Form.Control name='discount_pix' as='select' ref={register}>
                    <option key={`discount_pix_0`} value={0}>
                      Sem desconto
                    </option>
                    {discounts.map((d) => (
                      <option key={`discount_pix_${d}`} value={d}>
                        {d} %
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Desconto Boleto</Form.Label>
                  <Form.Control
                    name='discount_billet'
                    as='select'
                    ref={register}
                  >
                    <option key={`discount_billet_0`} value={0} selected>
                      Sem desconto
                    </option>
                    {discounts.map((d) => (
                      <option key={`discount_billet_${d}`} value={d}>
                        {d} %
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            {product.payment_type === 'single' && (
              <Col md={6} className='form-group'>
                <label htmlFor=''>Método de Pagamento</label>
                <Form.Control
                  as='select'
                  name='payment_methods'
                  ref={register}
                  className='form-control'
                  defaultValue={
                    product.payment_type === 'single'
                      ? 'credit_card,billet,pix'
                      : 'credit_card,pix'
                  }
                >
                  {product.payment_type === 'single' ? (
                    <>
                      <option value='credit_card,billet,pix'>
                        Cartão de crédito, boleto e Pix
                      </option>
                      <option value='credit_card,billet'>
                        Cartão de crédito e boleto
                      </option>
                      <option value='credit_card,pix'>
                        Cartão de crédito e Pix
                      </option>
                    </>
                  ) : (
                    <>
                      <option value='credit_card,pix'>
                        Cartão de crédito e Pix
                      </option>
                    </>
                  )}
                  <option value='credit_card'>Apenas cartão de crédito</option>
                  <option value='pix'>Apenas Pix</option>
                </Form.Control>
              </Col>
            )}
            <Col className='form-group' md={6}>
              <label htmlFor=''>Parcelamento no Cartão</label>
              <Form.Control
                name='installments'
                ref={register}
                className='form-control'
                as='select'
                defaultValue={'12'}
              >
                <option value='1'>Apenas à vista</option>
                <option value='2'>Até 2x</option>
                <option value='3'>Até 3x</option>
                <option value='4'>Até 4x</option>
                <option value='5'>Até 5x</option>
                <option value='6'>Até 6x</option>
                <option value='7'>Até 7x</option>
                <option value='8'>Até 8x</option>
                <option value='9'>Até 9x</option>
                <option value='10'>Até 10x</option>
                <option value='11'>Até 11x</option>
                <option value='12'>Até 12x</option>
              </Form.Control>
            </Col>
            <Col className='form-group' md={12}>
              <label htmlFor=''>Parcelamento sem juros até</label>
              <Form.Control
                as='select'
                name='installments_without_interest'
                ref={register}
                className='form-control'
              >
                <option value='0'>Selecione...</option>
                <option value='1'>1x</option>
                <option value='2'>2x</option>
                <option value='3'>3x</option>
                <option value='4'>4x</option>
                <option value='5'>5x</option>
                <option value='6'>6x</option>
                <option value='7'>7x</option>
                <option value='8'>8x</option>
                <option value='9'>9x</option>
                <option value='10'>10x</option>
                <option value='11'>11x</option>
                <option value='12'>12x</option>
              </Form.Control>
            </Col>
            <Col className='form-group'>
              <label htmlFor=''>Juros do Parcelamento</label>
              <Form.Control
                as='select'
                name='student_pays_interest'
                ref={register}
                className='form-control'
                disabled={installments_without_interest && parseInt(installments_without_interest) >= 2}
              >
                <option value='true'>Cliente Paga</option>
                <option value='false'>Produtor Paga</option>
              </Form.Control>
            </Col>
          </Row>
          <Row>
            <Col md={12} className='form-group'>
              <Form.Group>
                <label htmlFor=''>Texto para Prazo de Entrega.</label>
                <Form.Control
                  ref={register}
                  name='shipping_text'
                  type='shipping_text'
                  isInvalid={errors.shipping_text}
                  placeholder='Seu produto chega em até 7 dias úteis.'
                  className='form-control'
                />
                <div className='form-error'>
                  {errors.shipping_text && (
                    <span> {errors.shipping_text.message}</span>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Tab>

        {activeOffer !== null && (
          <Tab
            eventKey='upsellGenerator'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bxs-analyse mr-1'></i>
                <span className='ml-2'>Upsell</span>
              </div>
            }
          >
            <Upsells offer={activeOffer} uuidProduct={uuidProduct} />
          </Tab>
        )}

        {activeOffer !== null && (
          <Tab
            eventKey='redirectURLGenerator'
            title={
              <div className='d-flex align-items-center'>
                <i class='bx bx-link-external mr-1'></i>
                <span className='ml-2'>URL de redirecionamento</span>
              </div>
            }
          >
            <Row>
              {activeOffer && (
                <>
                  <Col md={12}>
                    <Form.Group>
                      <label htmlFor=''>URL Página de Obrigado – Cartão</label>
                      <OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-top-invisible-offer`}>
                            Se esta oferta possuir upsell configurado, o cliente
                            será direcionado para a página de upsell,
                            independentemente da URL configurada neste local.
                          </Tooltip>
                        }
                      >
                        <i className='bx bx-info-circle ml-2'></i>
                      </OverlayTrigger>
                      <Form.Control
                        placeholder='Ex: http://www.meusite.com/cartão'
                        ref={register({
                          required: false,
                          validate: (value) => {
                            if (value === '') return true;
                            return regexUrl(value);
                          },
                        })}
                        name='thankyou_page_card'
                        type='url'
                        isInvalid={errors.thankyou_page_card}
                      />
                    </Form.Group>
                    <Form.Group>
                      <label htmlFor=''>URL Página de Obrigado – Pix</label>
                      <OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-top-invisible-offer`}>
                            Se esta oferta possuir upsell configurado, o cliente
                            será direcionado para a página de upsell,
                            independentemente da URL configurada neste local.
                          </Tooltip>
                        }
                      >
                        <i className='bx bx-info-circle ml-2'></i>
                      </OverlayTrigger>
                      <Form.Control
                        placeholder='Ex: http://www.meusite.com/pix'
                        ref={register({
                          required: false,
                          validate: (value) => {
                            if (value === '') return true;
                            return regexUrl(value);
                          },
                        })}
                        name='thankyou_page_pix'
                        type='url'
                        isInvalid={errors.thankyou_page_pix}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
          </Tab>
        )}
        {activeOffer !== null && (
          <Tab
            eventKey='supplier'
            title={
              <div className='d-flex align-items-center'>
                <i
                  className='bx bx-package mr-1'
                  style={{ fontSize: '21px' }}
                ></i>
                <span className='ml-2'>Fornecedores</span>
              </div>
            }
          >
            <Row>
              <Col md={12}>
                <Row>
                  <Col lg={6} md={12}>
                    <Form.Group className='mb-2'>
                      <FormLabel for='supplier'>Email</FormLabel>
                      <Select
                        options={options}
                        onInputChange={handleInputChange}
                        inputValue={inputValue}
                        onChange={handleChange}
                        isClearable
                        noOptionsMessage={() => {
                          return 'Nenhuma opção disponível';
                        }}
                        placeholder='Email do fornecedor'
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6} md={12}>
                    <Form.Group className='m-0'>
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
                      <div className='d-flex align-items-center mt-2'>
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
                <ButtonDS
                  size={'sm'}
                  style={{ whiteSpace: 'nowrap' }}
                  className={'mt-2'}
                  disabled={
                    addingSupplier ||
                    !selectedValue ||
                    (!inputReceivesShipping && !inputValueSupplier)
                  }
                  onClick={() => addNewSupplier()}
                >
                  {addingSupplier ? (
                    <>
                      <i className='bx bx-loader-alt bx-spin mr-1'></i>
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar fornecedor'
                  )}
                </ButtonDS>

                <DataTable
                  paginationComponentOptions={{
                    rowsPerPageText: 'Linhas por página',
                    rangeSeparatorText: 'de',
                    selectAllRowsItem: false,
                    selectAllRowsItemText: 'Todos',
                  }}
                  columns={columns(
                    uuidProduct,
                    activeOffer,
                    ButtonDS,
                    suppliers,
                    setSuppliers,
                    notify
                  )}
                  data={suppliers}
                  striped
                  progressComponent={<Loader title='Carregando...' />}
                  noDataComponent={<NoDataComponentContent />}
                  className='mt-4 mb-4'
                />
              </Col>
            </Row>
            {suppliers.length > 0 && (
              <div className='p-2'>
                <h4 style={{ fontSize: 16 }}>
                  Assumir reembolso do fornecedor?
                </h4>
                <p style={{ fontSize: 13 }}>
                  Caso não exista código de rastreio de venda, o valor da
                  comissão do fornecedor será reembolsado do próprio fornecedor
                </p>
                <Switch
                  onChange={() => {
                    setRefundSuppliers(!refundSuppliers);
                  }}
                  checked={refundSuppliers}
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
              </div>
            )}
          </Tab>
        )}
        {activeOffer !== null && (
          <Tab
            eventKey='checkout'
            title={
              <div className='d-flex align-items-center'>
                <i
                  className='bx bx-mobile-alt'
                  style={{ fontSize: '21px' }}
                ></i>
                <span className='ml-2'>Checkout</span>
              </div>
            }
          >
            <div className='mb-4'>
              <div className='d-flex mt-3 mb-2'>
                <i
                  className='bx bx-timer mr-2'
                  style={{ fontSize: 25, color: `#0f1b35` }}
                ></i>
                <h3>Contador</h3>
              </div>
              <p>Adicionar contador regressivo no topo checkout</p>
              <Card>
                <Card.Body>
                  <div className='d-flex align-items-center'>
                    <Switch
                      onChange={() => {
                        setIsCounterActive(!isCounterActive);
                      }}
                      checked={isCounterActive}
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
                    <span className='ml-2'>
                      {isCounterActive && <span>Ativo</span>}
                    </span>
                  </div>
                  {isCounterActive && (
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <label
                            htmlFor='counter_seconds'
                            className='mt-3 mb-0'
                          >
                            Tempo do contador
                          </label>
                          <div className='d-block mb-2'>
                            <small>Quantidade em segundos</small>
                          </div>
                          <Form.Control
                            name='counter_seconds'
                            ref={register({
                              required: 'Digite somente números',
                              valueAsNumber: {
                                value: true,
                                message: 'Digite somente números',
                              },
                              validate: {
                                positive: (value) => parseInt(value) > 0,
                              },
                            })}
                            type='number'
                            placeholder='130'
                            isInvalid={errors.counter_seconds}
                            disabled={!isCounterActive}
                          />
                          <div className='form-error'>
                            {errors.counter_seconds && (
                              <span> {errors.counter_seconds.message}</span>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Col className='form-group' md={6}>
                          <label htmlFor=''>Cor Primária</label>
                          <div className='c-picker'>
                            <Form.Control
                              type='color'
                              id='exampleColorInput'
                              defaultValue='#66FFEA'
                              title='Escolha sua cor'
                              name='counter_color'
                              ref={register()}
                              style={{ height: 50, width: 80 }}
                            />
                            <i className='bx bxs-eyedropper' />
                          </div>
                        </Col>
                      </Col>
                    </Row>
                  )}
                  {isCounterActive && (
                    <Row clas>
                      <Col md={6}>
                        <Form.Group>
                          <label htmlFor='counter_seconds' className='mb-0'>
                            Texto
                          </label>
                          <div className='d-block mb-2'>
                            <small>Aparece ao iniciar o contador</small>
                          </div>
                          <Form.Control
                            name='counter_label'
                            ref={register({
                              required: {
                                message: 'Campo obrigatório.',
                                value: isCounterActive,
                              },
                            })}
                            type='name'
                            placeholder='Essa é a sua única chance!'
                            isInvalid={errors.counter_label}
                            disabled={!isCounterActive}
                          />
                          <div className='form-error'>
                            {errors.counter_label && (
                              <span> {errors.counter_label.message}</span>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <label htmlFor='counter_seconds' className='mb-0'>
                            Texto final
                          </label>
                          <div className='d-block mb-2'>
                            <small>Aparece ao terminar o tempo</small>
                          </div>
                          <Form.Control
                            name='counter_label_end'
                            ref={register({
                              required: {
                                message: 'Campo obrigatório.',
                                value: isCounterActive,
                              },
                            })}
                            type='name'
                            placeholder='O tempo acabou.'
                            isInvalid={errors.counter_label_end}
                            disabled={!isCounterActive}
                          />
                          <div className='form-error'>
                            {errors.counter_label_end && (
                              <span> {errors.counter_label_end.message}</span>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </div>
            <div className='mb-4'>
              <div className='d-flex mt-3 mb-2'>
                <i
                  className='bx bx-timer mr-2'
                  style={{ fontSize: 25, color: `#0f1b35` }}
                ></i>
                <h3>Contador 3 Etapas</h3>
              </div>
              <p>Adicionar contador regressivo no topo checkout 3 etapas</p>
              <Card>
                <Card.Body>
                  <div className='d-flex align-items-center'>
                    <Switch
                      onChange={() => {
                        setIsCounterThreeStepsActive(
                          !isCounterThreeStepsActive
                        );
                      }}
                      checked={isCounterThreeStepsActive}
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
                    <span className='ml-2'>
                      {isCounterThreeStepsActive && <span>Ativo</span>}
                    </span>
                  </div>
                  {isCounterThreeStepsActive && (
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <label
                            htmlFor='counter_seconds_three_steps'
                            className='mt-3 mb-0'
                          >
                            Tempo do contador
                          </label>
                          <div className='d-block mb-2'>
                            <small>Quantidade em segundos</small>
                          </div>
                          <Form.Control
                            name='counter_seconds_three_steps'
                            ref={register({
                              required: 'Digite somente números',
                              valueAsNumber: {
                                value: true,
                                message: 'Digite somente números',
                              },
                              validate: {
                                positive: (value) => parseInt(value) > 0,
                              },
                            })}
                            type='number'
                            placeholder='130'
                            isInvalid={errors.counter_seconds_three_steps}
                            disabled={!isCounterThreeStepsActive}
                          />
                          <div className='form-error'>
                            {errors.counter_seconds_three_steps && (
                              <span>
                                {' '}
                                {errors.counter_seconds_three_steps.message}
                              </span>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                  {isCounterThreeStepsActive && (
                    <Row clas>
                      <Col md={6}>
                        <Form.Group>
                          <label
                            htmlFor='counter_seconds_three_steps'
                            className='mb-0'
                          >
                            Texto
                          </label>
                          <div className='d-block mb-2'>
                            <small>Aparece ao iniciar o contador</small>
                          </div>
                          <Form.Control
                            name='counter_label_three_steps'
                            ref={register({
                              required: {
                                message: 'Campo obrigatório.',
                                value: isCounterThreeStepsActive,
                              },
                            })}
                            type='name'
                            placeholder='Essa é a sua única chance!'
                            isInvalid={errors.counter_seconds_three_steps}
                            disabled={!isCounterThreeStepsActive}
                          />
                          <div className='form-error'>
                            {errors.counter_seconds_three_steps && (
                              <span>
                                {' '}
                                {errors.counter_seconds_three_steps.message}
                              </span>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <label
                            htmlFor='counter_seconds_three_steps'
                            className='mb-0'
                          >
                            Texto final
                          </label>
                          <div className='d-block mb-2'>
                            <small>Aparece ao terminar o tempo</small>
                          </div>
                          <Form.Control
                            name='counter_label_end_three_steps'
                            ref={register({
                              required: {
                                message: 'Campo obrigatório.',
                                value: isCounterThreeStepsActive,
                              },
                            })}
                            type='name'
                            placeholder='O tempo acabou.'
                            isInvalid={errors.counter_label_end_three_steps}
                            disabled={!isCounterThreeStepsActive}
                          />
                          <div className='form-error'>
                            {errors.counter_label_end_three_steps && (
                              <span>
                                {' '}
                                {errors.counter_label_end_three_steps.message}
                              </span>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </div>

            <ModalOfferCheckout
              terms={terms}
              setTerms={setTerms}
              urlTerms={urlTerms}
              setUrlTerms={setUrlTerms}
              setErrorTerms={setErrorTerms}
              errorTerms={errorTerms}
              uuidProduct={uuidProduct}
              activeOffer={activeOffer}
              setActiveOffer={setActiveOffer}
              activePopup={activePopup}
              setActivePopup={setActivePopup}
              activeMoveMouse={activeMoveMouse}
              setActiveMoveMouse={setActiveMoveMouse}
              activeClosePage={activeClosePage}
              setActiveClosePage={setActiveClosePage}
              selectedCoupom={selectedCoupom}
              setSelectedCoupom={setSelectedCoupom}
              popup={popup}
              setPopup={setPopup}
              activeAfterTime={activeAfterTime}
              setActiveAfterTime={setActiveAfterTime}
              showCnpj={showCnpj}
              setShowCnpj={setShowCnpj}
            />
          </Tab>
        )}
        <Tab
          eventKey='additional-info'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-info-circle mr-1' />
              <span className='ml-2'>Informações Adicionais</span>
            </div>
          }
        >
          <Card className='p-3'>
            <h3>Dimensões</h3>
            <p className='text-muted'>
              Usado para calcular as taxas de frete no checkout.
            </p>
            <Row className='mb-3 g-2'>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Comprimento</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    name='length'
                    value={dimensions.length}
                    onChange={handleDimensionChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Largura</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    name='width'
                    value={dimensions.width}
                    onChange={handleDimensionChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Altura</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      name='height'
                      value={dimensions.height}
                      onChange={handleDimensionChange}
                    />
                    <InputGroup.Text>cm</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Peso</Form.Label>
                  <InputGroup>
                    <Form.Control
                      name='weight'
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      value={dimensions.weight}
                      onChange={handleDimensionChange}
                    />
                    <InputGroup.Text>kg</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card>
          <Card className='p-3'>
            <h3>Metadata</h3>
            <p className='text-muted'>
              Informações do produto enviadas pela API do Shopify.
            </p>

            <Row className='mb-3 g-2'>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Metadata (metadata)</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={6}
                    placeholder='Cole ou edite aqui o metadata do produto'
                    value={metadata}
                    onChange={handleMetadataChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card>

        </Tab>
      </Tabs>
      {((nav === 'upsell_generator' ||
        nav === 'upsell_generator' ||
        tabContent === 'upsellGenerator') &&
        tabContent === 'upsellGenerator') ||
      (isUpsellNative && isUpsellActive) ? (
        <></>
      ) : (
        <Row className='d-flex mt-4 align-items-center'>
          <Col md={5}>
            {activeOffer && isUpsellActive && (
              <div className='text-danger d-inline-block pointer'>
                {removing === false ? (
                  <ButtonDS
                    size='sm'
                    variant='danger'
                    iconLeft='bx-trash-alt'
                    outline
                    onClick={() => {
                      handleRemoveOffer();
                    }}
                  >
                    Remover Oferta
                  </ButtonDS>
                ) : (
                  removing === true && (
                    <i className='bx bx-loader-alt bx-spin remove-loading' />
                  )
                )}
              </div>
            )}
          </Col>

          <Col md={7} className='d-flex justify-content-end'>
            <ButtonDS
              size={'sm'}
              onClick={handleSubmit(onSubmit)}
              disabled={requesting}
            >
              {!requesting ? 'Salvar' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      )}
    </form>
  );
}
