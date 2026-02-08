import api from 'api';
import PopupAlerta from 'components/Popup';
import {
  currency,
  eventKwaiPixel,
  googleAdsSend,
  googleAnalyticsSend,
  injectGoogleTagManager,
  injectPinterest,
  pixelNative,
  pixelTikTok,
} from 'functions.js';
import Cookies from 'js-cookie';
import Loader from 'Loader';
import ModalBillet from 'ModalBillet';
import ModalCard from 'ModalCard';
import ModalPix from 'ModalPix';
import { nanoid } from 'nanoid';
import Notifications from 'plugins/Notifications';
import useQuery from 'query/queryHook';
import { createRef, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import TagManager from 'react-gtm-module';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import BuyButton from './components/BuyButton3Steps';
import ClarityScript from './components/Clarity3Steps';
import Coupon from './components/Coupon3Steps';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import OrderBump from './components/OrderBump3Steps';
import { Step01 } from './components/Step01';
import { Step02 } from './components/Step02';
import { Step04 } from './components/Step04';
import { Summary3Steps } from './components/Summary3Steps';
import './styles/checkout.scss';
import './styles/checkout3steps.scss';
import './styles/general.scss';
import './styles/modal.scss';
import './styles/order-bump.scss';
import './styles/plans.scss';
import './styles/plugins.scss';
import { useCheckoutTracking } from './tracking/useCheckoutTracking';

const PMT = (ir, np, pv, fv, type) => {
  /*
   * ir   - interest rate per month
   * np   - number of periods (months)
   * pv   - present value
   * fv   - future value
   * type - when the payments are due:
   *        0: end of the period, e.g. end of month (default)
   *        1: beginning of period
   */
  let pmt;
  let pvif;
  /* eslint-disable-next-line */
  fv || (fv = 0);
  /* eslint-disable-next-line */
  type || (type = 0);
  if (ir === 0) return -(pv + fv) / np;
  /* eslint-disable-next-line */
  pvif = Math.pow(1 + ir, np);
  pmt = (-ir * (pv * pvif + fv)) / (pvif - 1);
  if (type === 1) pmt /= 1 + ir;
  return pmt;
};

const calculateInstallmentsList = (
  original_price,
  max_installments,
  student_pays_interest,
  installments_fee,
  discounts_card,
  coupon,
  shipping_price
) => {
  const price =
    original_price -
    original_price *
    (((coupon && coupon.percentage > 0 ? coupon.percentage : 0) +
      discounts_card) /
      100) +
    (!!coupon?.free_shipping ? 0 : Number(shipping_price || 0)) -
    (coupon && coupon.amount > 0 ? coupon.amount : 0);
  const list = [];
  list.push({
    n: 1,
    price: price,
    total: price,
  });
  if (student_pays_interest) {
    for (
      let installment = 2;
      installment <= max_installments;
      installment += 1
    ) {
      const pmt = PMT(installments_fee / 100, installment, price);
      const total = Math.abs(pmt) * installment;
      const installment_price = total / installment;
      list.push({
        n: installment,
        price: installment_price,
        total,
      });
    }
  } else {
    for (
      let installment = 2;
      installment <= max_installments;
      installment += 1
    ) {
      const total = price;
      const installment_price = total / installment;
      list.push({
        n: installment,
        price: installment_price,
        total,
      });
    }
  }
  return list;
};

const totalBumps = (orderbumps) => {
  const uuids = [];
  let total = 0;

  for (const orderbump of orderbumps) {
    if (!uuids.includes(orderbump.uuid)) {
      total += orderbump.price * orderbump.quantity;
      uuids.push(orderbump.uuid);
    }
  }
  return total;
};

const Checkout3Steps = ({ pixels, setPixels }) => {
  const [allowedBillet, setAllowedBillet] = useState(false);
  const [allowedCard, setAllowedCard] = useState(false);
  const [allowedPix, setAllowedPix] = useState(false);
  const [customerDataSent, setCustomerDataSent] = useState(false);
  const [discounts, setDiscounts] = useState(null);
  const [fullName, setFullName] = useState('');
  const [googlePixels, setGooglePixels] = useState([]);
  const [googleAdsPixels, setGoogleAdsPixels] = useState([]);
  const [kwaiPixels, setKwaiPixels] = useState([]);
  const [pinterestPixels, setPinterestPixels] = useState([]);
  const [installmentsList, setInstallmentsList] = useState([]);
  const [offer, setOffer] = useState(null);
  const [orderBumps, setOrderBumps] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [plans, setPlans] = useState([]);
  const [processedBy, setProcessedBy] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedBumps, setSelectedBumps] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [installmentsHaveInterest, setInstallmentsHaveInterest] =
    useState(null);
  const [fbPixels, setFbPixels] = useState([]);
  const query = useQuery();
  const [coupon, setCoupon] = useState(null);
  const [oldCoupon, setOldCoupon] = useState(null);
  const [currentInstallment, setCurrentInstallment] = useState(1);
  const affiliateUuid = query.get('a') || null;
  const splitParam = query.get('split');
  const cupom = query.get('cupom') || null;
  const b4f = query.get('b4f') || null;
  const [sessionID, setSessionID] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [displayChallenge, setDisplayChallenge] = useState(false);
  const [topLevelDelivery, setTopLevelDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shippingChanged, setShippingChanged] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasFrenet, setHasFrenet] = useState(false);
  const [oldCart, setOldCart] = useState(null);
  const [confirmAction, setConfirmAction] = useState(false);
  const [isSetDefeutInstallment, setIsSetDefeutInstallment] = useState(false);
  const [paymentType, setPaymentType] = useState('cpf');

  const { uuidOffer, uuidCart } = useParams();

  const { trackEvent } = useCheckoutTracking({
    offerId: uuidOffer,
    checkoutType: '3steps',
  });

  const prevStepRef = useRef(null);

  const mapPaymentMethod = (method) => {
    if (method === 'pix') return 'pix';
    if (method === 'billet') return 'boleto';
    return 'credit_card';
  };

  const {
    register,
    formState,
    setValue,
    getValues,
    control,
    setFocus,
    setError,
    clearErrors,
    handleSubmit,
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: { whatsapp: '', isCnpj: false },
  });

  const { errors } = formState;

  const onSubmit = async (data, e) => {
    e.preventDefault();
    trackEvent('checkout_submit_clicked', {
      step: 'payment',
      paymentMethod: mapPaymentMethod(paymentMethod),
      email: getValues('email'),
      phone: getValues('whatsapp'),
    });
    setLoading(true);
    setDisplayChallenge(true);
  };

  const handleToken = (token) => {
    setTurnstileToken(token);
  };

  const handleChangeShipping = () => {
    setShippingChanged(true);
  };

  useEffect(() => {
    if (turnstileToken) {
      setShowModal(true);
      // capture event (disable on 24/03/2025)
      // createEvent({
      //   eventType: 'button_click',
      //   eventName: 'checkout',
      //   idOffer: uuidOffer,
      // });
    }
  }, [turnstileToken]);

  useEffect(() => {
    setValue('email', query.get('email') ?? '');
    setValue('full_name', query.get('full_name') ?? '');
    setValue('whatsapp', query.get('phone') ?? '');
    setFocus('full_name');
  }, []);

  useEffect(async () => {
    if (b4f) {
      api.get(`/${b4f}/`).catch(() => {});
    }
  }, [b4f]);

  useEffect(() => {
    const fetch = () => {
      if (!offer) return;

      const sid = nanoid();
      //injectClearSaleNoScript(sid, clearSaleFingerprint);
      setSessionID(sid);
      if (pixels) {
        const pixelsConfig = [];
        if (pixels.facebook.length > 0) {
          pixels.facebook.forEach(async (item) => {
            const test_event_code = query.get('test_event_code');
            pixelsConfig.push({
              target: 'iframe', // iframe send events
              pixel_id: item.settings.pixel_id,
              paid_pix: item.settings.paid_pix,
              generated_pix: item.settings.generated_pix,
              pixel_uuid: item.uuid,
              event_id: pixels.sessionPixelsEventId,
              test_event_code,
              url: `https://${item.settings.domain}/pixel.html?pixel=${item.settings.pixel_id}&event_id=${pixels.sessionPixelsEventId}&pixel_uuid=${item.uuid}`,
              ref: createRef(),
              token: item.settings.token ? item.settings.token : null,
            });
            window.fbq('init', `${item.settings.pixel_id}`);
            if (item.settings.token && Cookies.get('_fbc')) {
              await sendApiEvent('InitiateCheckout', item.uuid, {
                value: offer.price,
                currency: 'BRL',
                content_ids: [offer.uuid],
                num_items: 1,
              });
            }
          });

          setFbPixels(pixelsConfig);
        }
        if (pixels.tiktok.length > 0) {
          pixels.tiktok.forEach((item) => {
            window.ttq.load(item.settings.pixel_id);
          });
          window.ttq.page();
        }

        if (pixels.facebook.length > 0) {
          pixelNative('InitiateCheckout', {
            value: offer?.price,
            currency: 'BRL',
            content_ids: [offer?.uuid],
            num_items: 1,
          });
        }

        if (pixels.tiktok.length > 0) {
          pixelTikTok('InitiateCheckout');
        }
        if (pixels['google-analytics'].length > 0) {
          TagManager.initialize({
            gtmId: pixels['google-analytics'][0]['settings']['pixel_id'],
          });

          setGooglePixels(pixels['google-analytics']);
          pixels['google-analytics'] &&
            pixels['google-analytics'].forEach((item) => {
              injectGoogleTagManager(item.settings.pixel_id);
              if (offer?.offerShopify && Array.isArray(offer.offerShopify)) {
                googleAnalyticsSend('begin_checkout', {
                  currency: 'BRL',
                  value: offer.price,
                  items: offer.offerShopify.map((item, index) => ({
                    item_name: item.title,
                    item_id: item.variant_id,
                    index: index,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                  })),
                });
              } else {
                googleAnalyticsSend('begin_checkout', {
                  currency: 'BRL',
                  value: offer.price,
                  items: [
                    {
                      item_name: offer.product.name,
                      index: 0,
                      quantity: 1,
                      price: offer.price,
                    },
                  ],
                });
              }
            });
        }
        if (pixels['google-ads'].length > 0) {
          setGoogleAdsPixels(pixels['google-ads']);
          pixels['google-ads'].forEach((item) => {
            injectGoogleTagManager(item.settings.pixel_id.split('/')[0]);
            if (item.settings.initiate_checkout)
              googleAdsSend({
                send_to: `${item.settings.pixel_id}`,
              });
          });
        }
        if (pixels['kwai'].length > 0) {
          setKwaiPixels(pixels['kwai']);
          pixels['kwai'].forEach((item) => {
            eventKwaiPixel({
              event: 'start',
              pixel_id: item.settings.pixel_id,
            });
            if (item.settings.initiate_checkout)
              eventKwaiPixel({
                event: 'initiateCheckout',
                pixel_id: item.settings.pixel_id,
              });
          });
        }
        if (pixels?.pinterest?.length > 0) {
          const arrPixels = pixels.pinterest.map(
            (pixel) => pixel.settings.pixel_id
          );
          setPinterestPixels(offer.pixels.pinterest);
          injectPinterest(arrPixels);
        }
      }
    };
    fetch();
  }, [pixels]);

  const onBackButtonEvent = (e, link) => {
    e.preventDefault();
    window.location.replace(link);
  };

  const resolveTotalInstallments = (plan) => {
    if (plan.frequency === 'Mensal') return 1;
    if (plan.frequency === 'Bimestral') return 2;
    if (plan.frequency === 'Trimestral') return 3;
    if (plan.frequency === 'Semestral') return 6;
    return 12;
  };

  useEffect(() => {
    if (selectedPlan) {
      let maxInstallments = resolveTotalInstallments(selectedPlan);
      let installments = offer.payment.installments;
      if (!selectedPlan.subscription_fee) {
        setValue('installments', maxInstallments);
        setCurrentInstallment(maxInstallments);
        installments = maxInstallments;
      }
      let price = selectedPlan.price;
      if (selectedPlan.subscription_fee && !selectedPlan.charge_first) {
        price = selectedPlan.subscription_fee_price;
      }
      if (selectedPlan.charge_first && selectedPlan.subscription_fee) {
        price += selectedPlan.subscription_fee_price;
      }
      setInstallmentsList(
        calculateInstallmentsList(
          price + totalBumps(selectedBumps),
          installments,
          offer.payment.student_pays_interest,
          offer.payment.installments_fee,
          offer.discounts.card,
          coupon,
          selectedOption !== null
            ? shippingOptions[selectedOption].price
            : offer.shipping_price
        )
      );
      setTotalPrice(price);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (offer) {
      if (selectedPlan) {
        let maxInstallments = resolveTotalInstallments(selectedPlan);
        let installments = offer.payment.installments;
        if (!selectedPlan.subscription_fee) {
          setValue('installments', maxInstallments);
          setCurrentInstallment(maxInstallments);
        }

        let price = selectedPlan.price;

        if (selectedPlan.subscription_fee && !selectedPlan.charge_first) {
          price = selectedPlan.subscription_fee_price;
        }
        if (selectedPlan.charge_first && selectedPlan.subscription_fee) {
          price += selectedPlan.subscription_fee_price;
        }

        setInstallmentsList(
          calculateInstallmentsList(
            price + totalBumps(selectedBumps),
            installments,
            offer.payment.student_pays_interest,
            offer.payment.installments_fee,
            offer.discounts.card,
            coupon,
            selectedOption !== null
              ? shippingOptions[selectedOption].price
              : offer.shipping_price
          )
        );

        setTotalPrice(price);
      } else {
        setInstallmentsList(
          calculateInstallmentsList(
            offer.original_price + totalBumps(selectedBumps),
            offer.payment.installments,
            offer.payment.student_pays_interest,
            offer.payment.installments_fee,
            offer.discounts.card,
            coupon,
            selectedOption !== null
              ? shippingOptions[selectedOption].price
              : offer.shipping_price
          )
        );
      }
    }
  }, [coupon, selectedBumps, selectedOption, shippingChanged, selectedPlan]);

  const navigate = useNavigate();

  useEffect(async () => {
    const fetchApi = async () => {
      try {
        if (affiliateUuid) {
          await api.get(`/offers/${uuidOffer}/${affiliateUuid}`);
        }
        const response = await api.get(
          `/offers/${uuidOffer}${b4f ? `?b4f=${b4f}` : ''}`
        );
        setHasFrenet(response.data.has_frenet);
        setProduct(response.data.product);
        if (!response.data.shipping_by_region) {
          response.data.shipping_by_region = {};
        }
        setOffer(response.data);

        if (
          (!response.data?.popup?.active || !response.data?.hasActiveCoupon) &&
          response.data.uuid_offer_back_redirect
        ) {
          window.history.pushState(null, null, window.location.pathname);
          window.addEventListener('popstate', (e) =>
            onBackButtonEvent(e, response.data.uuid_offer_back_redirect)
          );
        }

        setPlans(response.data.payment.plans);
        setOrderBumps(
          response.data.order_bumps.map((ob) => ({ ...ob, quantity: 0 }))
        );
        setPixels(response.data.pixels);
        setProcessedBy(response.data.proccessed_by);

        if (splitParam && +splitParam <= response.data.payment.installments) {
          setValue('installments', +splitParam);
        }

        setDiscounts(response.data.discounts);
        setInstallmentsHaveInterest(
          response.data.payment.installments_have_insterest
        );

        const selectedMethod = response.data.payment.methods[0];
        setPaymentMethod(
          selectedMethod === 'credit_card' ? 'card' : selectedMethod
        );

        if (response.data.payment.plans.length > 0) {
          const [selectedPlan] = response.data.payment.plans;
          setSelectedPlan(selectedPlan);
        } else {
          setTotalPrice(response.data.price);
          setInstallmentsList(
            calculateInstallmentsList(
              response.data.original_price,
              response.data.payment.installments,
              response.data.payment.student_pays_interest,
              response.data.payment.installments_fee,
              response.data.discounts.card,
              coupon,
              response.data.has_frenet
                ? selectedOption !== null
                  ? shippingOptions[selectedOption].price
                  : 0
                : response.data.shipping_price
            )
          );
        }

        if (response.data.payment.methods.includes('pix')) {
          setAllowedPix(true);
        }
        if (response.data.payment.methods.includes('billet')) {
          setAllowedBillet(true);
        }
        if (response.data.payment.methods.includes('credit_card')) {
          setAllowedCard(true);
        }

        document.title = response.data.product.name;
        if (response.data.checkout.favicon) {
          document.getElementById('favicon').href =
            response.data.checkout.favicon;
        }
      } catch (error) {
        navigate('/notFound');
      }
    };

    fetchApi();
  }, []);

  useEffect(() => {
    if (offer) {
      if (offer.checkout.hex_color) {
        document.documentElement.style.setProperty(
          '--primary-color',
          '#000000'
        );
      }
    }
  }, [offer]);

  const updateQuantity = (index, value) => {
    setOrderBumps((prevOb) => {
      const updated = [...prevOb];
      const item = updated[index];
      const newQuantity = item.quantity + value;
      if (item.max_quantity) {
        if (newQuantity >= 0 && newQuantity <= item.max_quantity) {
          item.quantity = newQuantity;
        }
      } else {
        if (newQuantity >= 0) {
          item.quantity = newQuantity;
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    if (paymentMethod !== 'card') {
      clearErrors('number');
      clearErrors('expiry');
      clearErrors('cvc');
      clearErrors('cardHolder');
    }
  }, [paymentMethod]);

  const [currentStep, setCurrentStep] = useState(1);

  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  useEffect(() => {
    const stepMap = {
      1: 'identification',
      2: 'address',
      3: 'payment',
    };
    const stepName = stepMap[currentStep];

    if (stepName) {
      trackEvent('checkout_step_viewed', { step: stepName });
    }

    if (prevStepRef.current !== null && stepName) {
      if (currentStep > prevStepRef.current) {
        trackEvent('checkout_step_advanced', { step: stepName });
      } else if (currentStep < prevStepRef.current) {
        trackEvent('checkout_step_back', { step: stepName });
      }
    }

    prevStepRef.current = currentStep;
  }, [currentStep, trackEvent]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const formElement = document.getElementById('formB4');

    if (formElement && isMobile) {
      // Rolar para o elemento do formulário suavemente
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const getFrenetOptions = async () => {
    setLoading(true);
    api
      .post('/shippingOptions', {
        cep: topLevelDelivery.cep,
        order_bumps: selectedBumps.map((o) => o.uuid),
        offer_id: offer.uuid,
      })
      .then((r) => {
        setShippingOptions(r.data);
        if (r.data && r.data.length > 0) {
          setSelectedOption(0);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (hasFrenet && topLevelDelivery !== null) {
      getFrenetOptions();
    }
  }, [offer, selectedBumps.length, topLevelDelivery]);

  useEffect(async () => {
    if (uuidCart) {
      try {
        const { data } = await api.get(`/cart/${uuidCart}`);
        setOldCart(data);
      } catch {
        toast.error('Não foi possível encontrar o carrinho no momento.');
      }
    }
  }, [uuidCart]);

  useEffect(() => {
    if (oldCart) {
      if (oldCart.full_name) setValue('full_name', oldCart.full_name);
      if (oldCart.email) setValue('email', oldCart.email);
      if (oldCart.whatsapp) setValue('whatsapp', oldCart.whatsapp);
    }
  }, [oldCart]);

  function handleSetAddresInformationByUrl() {
    for (const [key, value] of query.entries()) {
      if (key !== 'step' && key !== 'phone' && key !== 'whatsapp') {
        setValue(key, value);
      }

      if (key === 'zipcode') {
        setValue('zipcode', value.replace(/\D/g, ''));
      }

      if (key === 'phone' || key === 'whatsapp') {
        const regexPhone = {
          regex:
            value.length === 10
              ? /^(\d{2})(\d{4})(\d{4})$/
              : /^(\d{2})(\d{5})(\d{4})$/,
          mask: '($1) $2-$3',
        };
        setValue('whatsapp', value.replace(regexPhone.regex, regexPhone.mask));
      }
    }
  }

  useEffect(() => {
    if (!offer) return;
    if (!Boolean(query.get('step'))) return;

    handleSetAddresInformationByUrl();

    if (Boolean(query.get('zipcode'))) {
      setValue('zipcode', query.get('zipcode').replace(/\D/g, ''));
    }

    const requestedStep = Number(query.get('step'));
    if (requestedStep === 2) {
      goToStep(2);
    } else if (requestedStep === 3) {
      const hasZipcode =
        getValues('zipcode') && getValues('zipcode').length >= 8;
      const hasStreet = getValues('street') && getValues('street').length > 0;
      const hasNumber =
        getValues('number_address') && getValues('number_address').length > 0;
      const hasNeighborhood =
        getValues('neighborhood') && getValues('neighborhood').length > 0;

      if (hasZipcode && hasStreet && hasNumber && hasNeighborhood) {
        goToStep(3);
      } else {
        goToStep(2);
      }
    }
  }, [query.get('step'), offer, topLevelDelivery]);

  useEffect(() => {
    if (currentStep !== 3 && Boolean(query.get('step'))) return;

    const isAnyValueAddressEnmpty =
      topLevelDelivery &&
      Object.entries(topLevelDelivery).some(
        ([key, value]) => !Boolean(value) && key !== 'complement'
      );

    isAnyValueAddressEnmpty && handleSetAddresInformationByUrl;
  }, [currentStep]);

  useEffect(() => {
    if (
      !offer ||
      isSetDefeutInstallment ||
      !installmentsList ||
      installmentsList.length === 0
    ) {
      return;
    }

    const defaultInstallment = Number(offer.customizations.default_installment);

    const installmentValue =
      installmentsList.length >= defaultInstallment
        ? defaultInstallment
        : installmentsList.length;

    setValue('installments', installmentValue);
    setCurrentInstallment(installmentValue);
    setIsSetDefeutInstallment(true);
  }, [
    paymentMethod,
    installmentsList,
    offer,
    currentStep,
    selectedPlan,
    currentInstallment,
  ]);

  return (
    <>
      <ClarityScript />
      {offer?.popup && offer.hasActiveCoupon && (
        <PopupAlerta
          config={offer.popup}
          setCoupon={setCoupon}
          setConfirmAction={setConfirmAction}
        />
      )}

      {query.get('notifications') && <Notifications />}
      <Modal
        id='modal'
        show={showModal}
        size='lg'
        onHide={() => setShowModal(false)}
        backdrop='static'
        keyboard={false}
        centered
      >
        {paymentMethod === 'billet' && (
          <ModalBillet
            query={query}
            uuidOffer={uuidOffer}
            orderBumps={orderBumps}
            totalPrice={totalPrice}
            selectedBumps={selectedBumps}
            pixels={pixels}
            fbPixels={fbPixels}
            googlePixels={googlePixels}
            googleAds={googleAdsPixels}
            offer={offer}
            coupon={coupon}
            kwaiPixels={kwaiPixels}
            turnstileToken={turnstileToken}
            setDisplayChallenge={setDisplayChallenge}
            pinterestPixels={pinterestPixels}
            b4f={b4f}
            getValues={getValues}
            delivery={topLevelDelivery}
            setLoading={setLoading}
            integration_shipping_price={
              selectedOption !== null
                ? shippingOptions[selectedOption].price
                : null
            }
            integration_shipping_company={
              selectedOption !== null
                ? shippingOptions[selectedOption].company
                : null
            }
            checkoutType='3steps'
          />
        )}
        {paymentMethod === 'pix' && (
          <ModalPix
            query={query}
            paymentStatus={paymentStatus}
            uuidOffer={uuidOffer}
            offer={offer}
            setPaymentStatus={setPaymentStatus}
            orderBumps={orderBumps}
            setShowModal={setShowModal}
            product={product}
            selectedBumps={selectedBumps}
            totalPrice={totalPrice}
            selectedPlan={selectedPlan}
            pixels={fbPixels}
            googlePixels={googlePixels}
            googleAds={googleAdsPixels}
            orderBumpsFinal={orderBumps}
            paymentMethod={paymentMethod}
            coupon={coupon}
            kwaiPixels={kwaiPixels}
            turnstileToken={turnstileToken}
            pinterestPixels={pinterestPixels}
            setDisplayChallenge={setDisplayChallenge}
            b4f={b4f}
            getValues={getValues}
            delivery={topLevelDelivery}
            setLoading={setLoading}
            integration_shipping_price={
              selectedOption !== null
                ? shippingOptions[selectedOption].price
                : null
            }
            integration_shipping_company={
              selectedOption !== null
                ? shippingOptions[selectedOption].company
                : null
            }
            checkoutType='3steps'
          />
        )}
        {(paymentMethod === 'card' || paymentMethod === 'two_cards') && (
          <ModalCard
            query={query}
            offer={offer}
            uuidOffer={uuidOffer}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            getValues={getValues}
            delivery={topLevelDelivery}
            totalPrice={totalPrice}
            selectedPlan={selectedPlan}
            plans={plans}
            selectedBumps={selectedBumps}
            installmentsHaveInterest={installmentsHaveInterest}
            fullName={fullName}
            pixels={fbPixels}
            googlePixels={googlePixels}
            googleAds={googleAdsPixels}
            coupon={coupon}
            kwaiPixels={kwaiPixels}
            pinterestPixels={pinterestPixels}
            sessionID={sessionID}
            turnstileToken={turnstileToken}
            setDisplayChallenge={setDisplayChallenge}
            b4f={b4f}
            setLoading={setLoading}
            integration_shipping_price={
              selectedOption !== null
                ? shippingOptions[selectedOption].price
                : null
            }
            integration_shipping_company={
              selectedOption !== null
                ? shippingOptions[selectedOption].company
                : null
            }
            paymentMethod={paymentMethod}
            checkoutType='3steps'
          />
        )}
      </Modal>
      {!offer && <Loader />}
      {offer && (
        <div className='frame1-container'>
          <div className='frame1-frame1'>
            <Header offer={offer} product={product} />

            <form
              id='formB4'
              className='frame1-frame37260'
              onSubmit={handleSubmit(onSubmit)}
            //className={`${!offer.verified_id && ' blur'}`}
            >
              {/*<div className='frame1-frame37260'>/}
                        {/* full mid block*/}
              <div className='form-container'>
                {isMobile && (
                  <>
                    <div className='step-progress'>
                      <div className='step'>
                        <div
                          className={`circle ${currentStep >= 1 ? 'active' : ''
                            }`}
                        >
                          1
                        </div>
                        <span>Informações</span>
                      </div>
                      <div
                        className={`line ${currentStep >= 2 ? 'active' : ''}`}
                      ></div>
                      <div className='step'>
                        <div
                          className={`circle ${currentStep >= 2 ? 'active' : ''
                            }`}
                        >
                          2
                        </div>
                        <span>Entrega</span>
                      </div>
                      <div
                        className={`line ${currentStep >= 3 ? 'active' : ''}`}
                      ></div>
                      <div className='step'>
                        <div className={`circle `}>3</div>
                        <span>Pagamento</span>
                      </div>
                    </div>

                    <Summary3Steps
                      offer={offer}
                      shippingChanged={shippingChanged}
                      product={product}
                      productBumps={orderBumps.filter((b) => b.quantity > 0)}
                      selectedBumps={selectedBumps}
                      orderBumps={orderBumps}
                      discounts={discounts}
                      paymentMethod={paymentMethod}
                      totalPrice={totalPrice}
                      coupon={coupon}
                      cupom={cupom}
                      setCoupon={setCoupon}
                      processedBy={processedBy}
                      installmentsList={installmentsList}
                      currentInstallment={currentInstallment}
                      couponComponent={
                        <Coupon
                          paymentMethod={paymentMethod}
                          oldCoupon={oldCoupon}
                          setOldCoupon={setOldCoupon}
                          coupon={coupon}
                          setCoupon={setCoupon}
                          offer={offer}
                          cupom={cupom}
                          cpf={watch('document')}
                          getValues={getValues}
                          id_product={product.id}
                          priceTotal={
                            offer.original_price + totalBumps(selectedBumps)
                          }
                          itemsQuantity={1 + selectedBumps.length}
                          confirmAction={confirmAction}
                          setConfirmAction={setConfirmAction}
                          trackEvent={trackEvent}
                        />
                      }
                      isMobile={isMobile}
                      hasFrenet={hasFrenet}
                      selectedShipping={
                        selectedOption !== null
                          ? shippingOptions[selectedOption]
                          : null
                      }
                      plans={plans}
                      setSelectedPlan={setSelectedPlan}
                      selectedPlan={selectedPlan}
                    />
                  </>
                )}

                <div className='form-wrapper'>
                  <div className='wrapper-info'>
                    {/* step01*/}
                    <Step01
                      orderBumps={orderBumps}
                      offer={offer}
                      setCustomerDataSent={setCustomerDataSent}
                      fbPixels={fbPixels}
                      googlePixels={googlePixels}
                      kwaiPixels={kwaiPixels}
                      setFullName={setFullName}
                      uuidOffer={uuidOffer}
                      product={product}
                      register={register}
                      formState={formState}
                      setValue={setValue}
                      getValues={getValues}
                      control={control}
                      setFocus={setFocus}
                      setError={setError}
                      clearErrors={clearErrors}
                      setCurrentStep={goToStep}
                      currentStep={currentStep}
                      oldCart={oldCart}
                      isEditBtn={query.get('step') ? false : true}
                      showCpf={!!offer.cpf_step_1}
                      trackEvent={trackEvent}
                    />
                    {/* block 2 resumo da compra
                            
                            <div className='frame1-entrega'>
                            <div className='frame1-frame372541'>
                                <div className='frame1-frame372531'>
                                <span className='frame1-text37'>2</span>
                                </div>
                                <span className='frame1-text38'>
                                <span>Endereço de entrega</span>
                                </span>
                            </div>
                            <span className='frame1-text40'>
                                <span>Preencha suas informações pessoais para continuar</span>
                            </span>
                            </div>*/}

                    <Step02
                      orderBumps={orderBumps}
                      offer={offer}
                      totalPrice={totalPrice}
                      setTotalPrice={setTotalPrice}
                      setCustomerDataSent={setCustomerDataSent}
                      fbPixels={fbPixels}
                      googlePixels={googlePixels}
                      kwaiPixels={kwaiPixels}
                      setFullName={setFullName}
                      uuidOffer={uuidOffer}
                      product={product}
                      register={register}
                      formState={formState}
                      setValue={setValue}
                      getValues={getValues}
                      control={control}
                      setFocus={setFocus}
                      setError={setError}
                      clearErrors={clearErrors}
                      setCurrentStep={goToStep}
                      currentStep={currentStep}
                      setTopLevelDelivery={setTopLevelDelivery}
                      handleChangeShipping={handleChangeShipping}
                      shippingChanged={shippingChanged}
                      hasFrenet={hasFrenet}
                      shippingOptions={shippingOptions}
                      setSelectedOption={setSelectedOption}
                      selectedOption={selectedOption}
                      currency={currency}
                      isEditBtn={query.get('step') ? false : true}
                      trackEvent={trackEvent}
                    />
                  </div>

                  {/*hasFrenet && product.type === 'physical' && (
                    <>
                      <Step03 
                        offer={offer}
                        currentStep={currentStep}
                        setCurrentStep={goToStep}
                        shippingOptions={shippingOptions}
                        setSelectedOption={setSelectedOption}
                        selectedOption={selectedOption}
                        currency={currency}

                      />                    
                    </>
                  )*/}

                  {/* block 4 resumo da compra */}
                  <Step04
                    uuidOffer={uuidOffer}
                    setCustomerDataSent={setCustomerDataSent}
                    fbPixels={fbPixels}
                    googlePixels={googlePixels}
                    kwaiPixels={kwaiPixels}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    allowedCard={allowedCard}
                    allowedPix={allowedPix}
                    allowedBillet={allowedBillet}
                    totalPrice={totalPrice}
                    orderBumps={orderBumps}
                    clearErrors={clearErrors}
                    setError={setError}
                    offer={offer}
                    coupon={coupon}
                    obComponent={
                      <OrderBump
                        offer={offer}
                        products={orderBumps}
                        updateQuantity={updateQuantity}
                        selectedBumps={selectedBumps}
                        setSelectedBumps={setSelectedBumps}
                        paymentMethod={paymentMethod}
                        trackEvent={trackEvent}
                      />
                    }
                    BuyButtonComponent={
                      <BuyButton
                        customerDataSent={customerDataSent}
                        //verified_id={offer.verified_id}
                        verified_id={true}
                        //has_terms={offer.terms}
                        has_terms={false}
                        loading={loading}
                      />
                    }
                    register={register}
                    errors={errors}
                    installmentsList={installmentsList}
                    getValues={getValues}
                    currentInstallment={currentInstallment}
                    setCurrentInstallment={setCurrentInstallment}
                    control={control}
                    setValue={setValue}
                    setCurrentStep={goToStep}
                    currentStep={currentStep}
                    isMobile={isMobile}
                    showCpf={!!!offer.cpf_step_1}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    watch={watch}
                    selectedShipping={
                      selectedOption !== null
                        ? shippingOptions[selectedOption]
                        : null
                    }
                    hasFrenet={hasFrenet}
                    shippingChanged={shippingChanged}
                    trackEvent={trackEvent}
                  />
                  {/******************************************/}

                  {/* block 5 resumo da compra */}
                  {!isMobile && (
                    <>
                      <Summary3Steps
                        offer={offer}
                        shippingChanged={shippingChanged}
                        product={product}
                        productBumps={orderBumps.filter((b) => b.quantity > 0)}
                        selectedBumps={selectedBumps}
                        orderBumps={orderBumps}
                        discounts={discounts}
                        paymentMethod={paymentMethod}
                        totalPrice={totalPrice}
                        plans={plans}
                        coupon={coupon}
                        cupom={cupom}
                        setCoupon={setCoupon}
                        processedBy={processedBy}
                        installmentsList={installmentsList}
                        currentInstallment={currentInstallment}
                        couponComponent={
                          <Coupon
                            coupon={coupon}
                            setCoupon={setCoupon}
                            paymentMethod={paymentMethod}
                            oldCoupon={oldCoupon}
                            setOldCoupon={setOldCoupon}
                            offer={offer}
                            cupom={cupom}
                            cpf={watch('document')}
                            getValues={getValues}
                            id_product={product.id}
                            priceTotal={totalPrice + totalBumps(selectedBumps)}
                            itemsQuantity={1 + selectedBumps.length}
                            confirmAction={confirmAction}
                            setConfirmAction={setConfirmAction}
                            trackEvent={trackEvent}
                          />
                        }
                        handleChangeShipping={handleChangeShipping}
                        hasFrenet={hasFrenet}
                        setSelectedPlan={setSelectedPlan}
                        selectedPlan={selectedPlan}
                        selectedShipping={
                          selectedOption !== null
                            ? shippingOptions[selectedOption]
                            : null
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            </form>
            <Footer
              offer={offer}
              handleToken={handleToken}
              displayChallenge={displayChallenge}
            />
          </div>
        </div>
      )}

      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
      />
    </>
  );
};

export default Checkout3Steps;
