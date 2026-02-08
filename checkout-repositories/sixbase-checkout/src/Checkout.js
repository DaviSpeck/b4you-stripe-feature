import api from 'api';
import BuyButton from 'BuyButton';
import CheckoutUserData from 'CheckoutUserData';
import PopupAlerta from 'components/Popup';
import Coupon from 'Coupon';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import TagManager from 'react-gtm-module';
import {
  currency,
  eventKwaiPixel,
  //googleAdsSend,
  googleAnalyticsSend,
  injectGoogleTagManager,
  injectPinterest,
  pixelNative,
  pixelTikTok,
  pushGTMEvent,
} from 'functions.js';
import Cookies from 'js-cookie';
import Loader from 'Loader';
import MethodCard from 'MethodCard';
import ModalBillet from 'ModalBillet';
import ModalCard from 'ModalCard';
import ModalPix from 'ModalPix';
import { nanoid } from 'nanoid';
import OrderBump from 'OrderBump';
import Pixels from 'Pixels';
import Plans from 'Plans';
import Counter from 'plugins/Counter';
import Notifications from 'plugins/Notifications';
import { createRef, useEffect, useState, useMemo, useRef } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ReactInputMask from 'react-input-mask';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Summary from 'Summary';
import SvgPix from 'SvgPix';
import MethodBillet from './MethodBillet';
import MethodPix from './MethodPix';
import './styles/checkout.scss';
import './styles/general.scss';
import './styles/modal.scss';
import './styles/order-bump.scss';
import './styles/plans.scss';
import './styles/plugins.scss';
import { sendApiEvent } from './utils/pixels/facebookAPiConversion';
import useQuery from 'query/queryHook';
import { calcSummary, parsePrice } from 'SummaryHelpers';
import { useCheckoutTracking } from './tracking/useCheckoutTracking';

const initializedGTMs = new Set();

const initGTM = (gtmId) => {
  if (!gtmId) return;

  if (initializedGTMs.has(gtmId)) {
    return;
  }

  TagManager.initialize({
    gtmId,
  });

  initializedGTMs.add(gtmId);

  // GTM initialized.
};

function lightOrDark(color) {
  let r, g, b;
  if (color.match(/^rgb/)) {
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );
    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }
  let hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  if (hsp > 127.5) {
    return 'light';
  } else {
    return 'dark';
  }
}

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

const Checkout = ({ pixels, setPixels }) => {
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
  const [counter, setCounter] = useState(null);
  const [oldCart, setOldCart] = useState(null);
  const query = useQuery();

  const [coupon, setCoupon] = useState(null);
  const [oldCoupon, setOldCoupon] = useState(null);

  const [currentInstallment, setCurrentInstallment] = useState(1);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [displayChallenge, setDisplayChallenge] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const affiliateUuid = query.get('a');
  const splitParam = query.get('split');
  const cupom = query.get('cupom');
  const b4f = query.get('b4f');

  const { uuidOffer, uuidCart } = useParams();

  const { trackEvent } = useCheckoutTracking({
    offerId: uuidOffer,
    checkoutType: 'standard',
  });

  const paymentDataStartedRef = useRef(false);

  const mapPaymentMethod = (method) => {
    if (method === 'pix') return 'pix';
    if (method === 'billet') return 'boleto';
    return 'credit_card';
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    trackEvent('checkout_payment_method_selected', {
      step: 'payment',
      paymentMethod: mapPaymentMethod(method),
      email: getValues('email'),
      phone: getValues('whatsapp'),
    });
  };

  const [errorMessageCart, setErrorMessageCart] = useState(null);

  const [images, setImages] = useState(null);
  const [video, setVideo] = useState(null);
  const [sessionID, setSessionID] = useState('');
  const [terms, setTerms] = useState(false);
  const [topLevelDelivery, setTopLevelDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shippingChanged, setShippingChanged] = useState(false);
  const [hasFrenet, setHasFrenet] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);
  const [isSetDefeutInstallment, setIsSetDefeutInstallment] = useState(false);

  // Calcular shippingCost separadamente para garantir reatividade
  const shippingCost = useMemo(() => {
    if (!offer) return 0;
    const cost =
      offer.shipping_type === 0 || !!coupon?.free_shipping
        ? 0
        : hasFrenet
        ? selectedOption !== null && shippingOptions[selectedOption]
          ? parsePrice(shippingOptions[selectedOption].price ?? 0)
          : 0
        : parsePrice(offer.shipping_price || 0);

    return cost;
  }, [
    offer,
    coupon,
    hasFrenet,
    selectedOption,
    shippingOptions,
    shippingChanged,
  ]);

  // Calcular totalPriceFinal para validação de dois cartões
  const totalPriceFinal = useMemo(() => {
    if (!offer) return 0;
    // Para dois cartões, usar desconto de 'card' ao invés de 'two_cards'
    const paymentMethodForDiscount =
      paymentMethod === 'two_cards' ? 'card' : paymentMethod;
    const { totalPriceFinal } = calcSummary(
      selectedBumps,
      totalPrice,
      paymentMethodForDiscount,
      coupon,
      offer,
      shippingCost
    );

    return totalPriceFinal;
  }, [
    offer,
    selectedBumps,
    totalPrice,
    paymentMethod,
    coupon,
    shippingCost,
    shippingChanged,
  ]);

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
    defaultValues: { whatsapp: '', isCnpj: false, installments: 1 },
  });

  const { errors } = formState;

  const handleChangeShipping = () => {
    setShippingChanged(true);
  };

  const handleSelectShippingOption = (index) => {
    setSelectedOption(index);
    trackEvent('checkout_shipping_method_selected', {
      step: 'address',
      email: getValues('email'),
      phone: getValues('whatsapp'),
    });
  };

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

  const onError = async (errors, e) => {
    e.preventDefault();
    const hasPaymentError =
      errors?.number ||
      errors?.expiry ||
      errors?.cvc ||
      errors?.cardHolder ||
      errors?.document ||
      errors?.installments ||
      errors?.card1_amount ||
      errors?.card2_amount ||
      errors?.cards_sum_error;

    if (hasPaymentError) {
      trackEvent('checkout_payment_data_error', {
        step: 'payment',
        paymentMethod: mapPaymentMethod(paymentMethod),
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
    }
  };

  useEffect(() => {
    if (b4f) {
      const fetch = async () => await api.get(`/${b4f}/`).catch((err) => err);
      fetch();
    }
  }, [b4f]);

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

  useEffect(async () => {
    if (!offer) return;

    const fetch = async () => {
      const sid = nanoid();
      //injectClearSaleNoScript(sid, clearSaleFingerprint);
      if (!pixels) return;

      // 🔥 GOOGLE ADS → GTM
      if (pixels['google-ads']?.length > 0) {
        pixels['google-ads'].forEach((item) => {
          const gtmId = item.settings.pixel_id;

          if (gtmId?.startsWith('GTM-')) {
            initGTM(gtmId);
          }
        });
      }
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
            value: offer.price,
            currency: 'BRL',
            content_ids: [offer.uuid],
            num_items: 1,
          });
        }

        if (pixels.tiktok.length > 0) {
          pixelTikTok('InitiateCheckout');
        }

        if (pixels['google-analytics'].length > 0) {
          setGooglePixels(pixels['google-analytics']);
          pixels['google-analytics'].forEach((item, index) => {
            injectGoogleTagManager(item.settings.pixel_id);
            googleAnalyticsSend('begin_checkout', {
              currency: 'BRL',
              value: offer.price,
              items: [
                {
                  item_name: offer.product.name,
                  index,
                  quantity: 1,
                  price: offer.price,
                },
              ],
            });
          });
        }

        if (offer) {
          pushGTMEvent('begin_checkout', {
            currency: 'BRL',
            value: offer.price,
            items: [
              {
                item_name: offer.product.name,
                item_id: offer.product.uuid,
                price: offer.price,
                quantity: 1,
              },
            ],
          });
        }

        if (pixels['google-ads'].length > 0) {
          setGoogleAdsPixels(pixels['google-ads']);
          //pixels['google-ads'].forEach((item) => {
          //injectGoogleTagManager(item.settings.pixel_id.split('/')[0]);
          //if (item.settings.initiate_checkout)
          //  googleAdsSend({
          //    send_to: `${item.settings.pixel_id}`,
          //  });
          //});
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
  }, [coupon, selectedBumps, selectedOption, selectedPlan]);

  const navigate = useNavigate();

  useEffect(async () => {
    // capture event (disable on 24/03/2025)
    // createEvent({
    //   eventType: 'page_load',
    //   eventName: 'checkout',
    //   idOffer: uuidOffer,
    // });
    try {
      if (affiliateUuid || b4f) {
        await api.get(`/offers/${uuidOffer}/${affiliateUuid ?? b4f}`);
      }

      const response = await api.get(
        `/offers/${uuidOffer}${b4f ? `?b4f=${b4f}` : ''}`
      );

      setHasFrenet(response.data.has_frenet);
      setCounter(response.data.counter);
      setProduct(response.data.product);
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

      setVideo({
        url_video_checkout:
          response.data.image_offer.url_video_checkout ||
          response.data.checkout.url_video_checkout,
      });

      setImages({
        sidebar_picture:
          response.data.image_offer.sidebar_picture ||
          response.data.checkout.sidebar_picture,
        header_picture:
          response.data.image_offer.header_picture ||
          response.data.checkout.header_picture,
        header_picture_secondary:
          response.data.image_offer.header_picture_secondary ||
          response.data.checkout.header_picture_secondary,
        header_picture_mobile:
          response.data.image_offer.header_picture_mobile ||
          response.data.checkout.header_picture_mobile,
        second_header_mobile:
          response.data.image_offer.second_header_mobile ||
          response.data.checkout.second_header_mobile,
        favicon:
          response.data.image_offer.favicon || response.data.checkout.favicon,
      });

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
  }, []);

  useEffect(() => {
    if (offer) {
      const theme = lightOrDark(offer.checkout.hex_color);
      if (offer.checkout.hex_color) {
        if (theme === 'light') {
          document.documentElement.style.setProperty(
            '--primary-color',
            '#000000'
          );
        } else {
          document.documentElement.style.setProperty(
            '--primary-color',
            offer.checkout.hex_color
          );
        }
        document.documentElement.style.setProperty(
          '--background-color',
          offer.checkout.hex_color
        );
      }
      if (counter?.color) {
        document.documentElement.style.setProperty(
          '--counter-color',
          offer.counter.color
        );
      }
    }
  }, [offer]);

  useEffect(async () => {
    if (uuidCart) {
      try {
        const { data } = await api.get(`/cart/${uuidCart}`);
        setOldCart(data);
      } catch {
        setErrorMessageCart(
          'Não foi possível encontrar o carrinho no momento.'
        );
      }
    }
  }, [uuidCart]);

  useEffect(() => {
    for (const [key, value] of query.entries()) {
      if (key === 'phone' || key === 'whatsapp') {
        const digits = value.replace(/\D/g, '');
        setValue('whatsapp', digits);
      } else if (key === 'zipcode') {
        setValue('zipcode', value.replace(/\D/g, ''));
      } else {
        setValue(key, value);
      }
    }
  }, []);

  useEffect(() => {
    if (
      !offer ||
      isSetDefeutInstallment ||
      !installmentsList ||
      installmentsList.length === 0
    ) {
      return;
    }

    const defaultInstallment =
      offer.customizations.default_installment &&
      offer.customizations.default_installment > 0
        ? Number(offer.customizations.default_installment)
        : 12;
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
    currentInstallment,
    offer,
    selectedPlan,
  ]);

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

    if (!paymentDataStartedRef.current) {
      trackEvent('checkout_payment_data_started', {
        step: 'payment',
        paymentMethod: mapPaymentMethod(paymentMethod),
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      paymentDataStartedRef.current = true;
    }
  }, [paymentMethod]);

  const handleToken = (token) => {
    setTurnstileToken(token);
  };

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

  return (
    <>
      {offer?.popup && offer.hasActiveCoupon && (
        <PopupAlerta
          config={offer.popup}
          setCoupon={setCoupon}
          setConfirmAction={setConfirmAction}
        />
      )}

      {counter && (
        <Counter
          counterObj={counter}
          sidebarPicture={images?.sidebar_picture}
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
            pinterestPixels={pinterestPixels}
            offer={offer}
            coupon={coupon}
            kwaiPixels={kwaiPixels}
            turnstileToken={turnstileToken}
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
            checkoutType='standard'
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
            pinterestPixels={pinterestPixels}
            orderBumpsFinal={orderBumps}
            paymentMethod={paymentMethod}
            coupon={coupon}
            kwaiPixels={kwaiPixels}
            turnstileToken={turnstileToken}
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
            checkoutType='standard'
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
            totalPrice={totalPrice}
            selectedPlan={selectedPlan}
            plans={plans}
            selectedBumps={selectedBumps}
            installmentsHaveInterest={installmentsHaveInterest}
            fullName={fullName}
            pixels={fbPixels}
            googlePixels={googlePixels}
            googleAds={googleAdsPixels}
            pinterestPixels={pinterestPixels}
            coupon={coupon}
            kwaiPixels={kwaiPixels}
            sessionID={sessionID}
            turnstileToken={turnstileToken}
            setDisplayChallenge={setDisplayChallenge}
            b4f={b4f}
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
            paymentMethod={paymentMethod}
            checkoutType='standard'
          />
        )}
      </Modal>

      {!offer && <Loader />}
      {uuidCart && errorMessageCart && !oldCart && (
        <Loader title={errorMessageCart} spinner={false} />
      )}
      {uuidCart && !errorMessageCart && !oldCart && <Loader />}
      {offer && (
        <>
          <Pixels pixelList={offer.pixels} />
          <div className='container'>
            <Row className='row-content'>
              <Col lg={12}>
                {video?.url_video_checkout ? (
                  <Col lg={12} className='mt-2 p-0'>
                    <div className='wrap-content-insertion'>
                      <div
                        className='content-insertion'
                        dangerouslySetInnerHTML={{
                          __html: video?.url_video_checkout,
                        }}
                      ></div>
                    </div>
                  </Col>
                ) : (
                  <>
                    {images?.header_picture && (
                      <img src={images?.header_picture} className='header' />
                    )}
                  </>
                )}
                {images?.header_picture_secondary && (
                  <img
                    src={images?.header_picture_secondary}
                    className='header'
                  />
                )}
                {images?.header_picture_mobile ? (
                  <img
                    src={images?.header_picture_mobile}
                    className='header-m'
                  />
                ) : (
                  <img src={images?.header_picture} className='header-m' />
                )}
                {images?.second_header_mobile && (
                  <img
                    src={images?.second_header_mobile}
                    className='header-m'
                  />
                )}
              </Col>

              <Col
                md={9}
                className='container-wrap'
                style={{
                  margin: !images?.sidebar_picture && '0 auto',
                }}
              >
                {!offer.verified_id && (
                  <div className='alert-ds'>
                    Você precisa verificar sua conta para vender
                  </div>
                )}
                <form
                  onSubmit={handleSubmit(onSubmit, onError)}
                  className={`${!offer.verified_id && ' blur'}`}
                >
                  <div className='header input-group mb-3'>
                    {product.logo && (
                      <img
                        src={product.logo}
                        className='logo'
                        alt={offer.offer.name + ' - logo'}
                      />
                    )}
                  </div>
                  <CheckoutUserData
                    orderBumps={orderBumps}
                    offer={offer}
                    paymentMethod={paymentMethod}
                    totalPrice={totalPrice}
                    oldCart={oldCart}
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
                    coupon={coupon}
                    setError={setError}
                    clearErrors={clearErrors}
                    setLoading={(isLoading) => setLoading(isLoading)}
                    setTopLevelDelivery={setTopLevelDelivery}
                    handleChangeShipping={handleChangeShipping}
                    watch={watch}
                    trackEvent={trackEvent}
                  />
                  <Coupon
                    paymentMethod={paymentMethod}
                    coupon={coupon}
                    setCoupon={setCoupon}
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
                  {hasFrenet && product.type === 'physical' && (
                    <div className='mb-4 mt-2'>
                      <h5 className='fw-semibold'>Método de envio</h5>
                      {shippingOptions && shippingOptions.length > 0 ? (
                        <div>
                          {shippingOptions.map((option, index) => (
                            <div
                              key={index}
                              className='border p-3 rounded mt-2 d-flex justify-content-between align-items-center'
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSelectShippingOption(index)}
                            >
                              <div className='d-flex align-items-center'>
                                <input
                                  type='radio'
                                  name='shippingOption'
                                  value={option.name}
                                  checked={selectedOption === index}
                                  onChange={() =>
                                    handleSelectShippingOption(index)
                                  }
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
                  )}
                  <div className='pay-info form-group'>
                    {allowedCard && (
                      <div className='input-group-2'>
                        <div className='area'>
                          <button
                            type='button'
                            id='btn-card'
                            className={
                              paymentMethod === 'card' ? 'btn active' : 'btn'
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              handlePaymentMethodChange('card');
                            }}
                          >
                            <i className='las la-credit-card' />
                            <span>Cartão de crédito</span>

                            {discounts && discounts.card > 0 && (
                              <span className='discount-label'>{` -${discounts.card}%`}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {allowedPix && (
                      <div className='input-group-2'>
                        <div className='area'>
                          <button
                            type='button'
                            id='btn-credit-billet'
                            className={
                              paymentMethod === 'pix'
                                ? 'btn btn-pix active'
                                : 'btn btn-pix'
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              handlePaymentMethodChange('pix');
                            }}
                          >
                            <SvgPix />
                            <span>Pix</span>
                            {discounts && discounts.pix > 0 && (
                              <span className='discount-label'>{` -${discounts.pix}%`}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {allowedBillet && (
                      <div className='input-group-2'>
                        <div className='area'>
                          <button
                            type='button'
                            id='btn-credit-billet'
                            className={
                              paymentMethod === 'billet' ? 'btn active' : 'btn'
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              handlePaymentMethodChange('billet');
                            }}
                          >
                            <i className='las la-file-alt' />
                            <span>Boleto</span>
                            {discounts && discounts.billet > 0 && (
                              <span className='discount-label'>{` -${discounts.billet}%`}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {/*TODO: trocar minimo 100*/}
                    {offer?.enable_two_cards_payment &&
                      allowedCard &&
                      totalPriceFinal >= 10 && (
                        <div className='input-group-2'>
                          <div className='area'>
                            <button
                              type='button'
                              id='btn-two-cards'
                              className={
                                paymentMethod === 'two_cards'
                                  ? 'btn active'
                                  : 'btn'
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                handlePaymentMethodChange('two_cards');
                              }}
                            >
                              <i className='las la-credit-card' />
                              <span>Dois cartões</span>
                              {discounts && discounts.card > 0 && (
                                <span className='discount-label'>{` -${discounts.card}%`}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                  {(paymentMethod == 'card' ||
                    paymentMethod == 'two_cards') && (
                    <div className='pay-card'>
                      <MethodCard
                        register={register}
                        errors={errors}
                        offer={offer}
                        installmentsList={installmentsList}
                        paymentMethod={paymentMethod}
                        getValues={getValues}
                        currentInstallment={currentInstallment}
                        setCurrentInstallment={setCurrentInstallment}
                        control={control}
                        setValue={setValue}
                        totalPriceFinal={totalPriceFinal}
                        selectedBumps={selectedBumps}
                        coupon={coupon}
                        shipping_price={shippingCost}
                        setError={setError}
                        clearErrors={clearErrors}
                        watch={watch}
                        trackEvent={trackEvent}
                      />
                    </div>
                  )}
                  {offer?.cpf_bottom &&
                    (paymentMethod == 'billet' || paymentMethod == 'pix') && (
                      <div className='pay-pix'>
                        <MethodPix
                          offer={offer}
                          selectedBumps={selectedBumps}
                          selectedPlan={selectedPlan}
                        />
                      </div>
                    ) && (
                      <div className='input-group mb-3'>
                        <div className='area' style={{ position: 'relative' }}>
                          <label htmlFor='cpf'>
                            <i className='las la-address-card' />
                          </label>
                          <ReactInputMask
                            {...register('document', {
                              required: true,
                              validate: (value) => {
                                if (!value) return false;
                                const cleanValue = value.replace(/\D/g, '');
                                const isCnpj = getValues('isCnpj') || false;
                                const isValid = isCnpj
                                  ? cnpj.isValid(cleanValue)
                                  : cpf.isValid(cleanValue);
                                return isValid;
                              },
                            })}
                            autoComplete='off'
                            id='cpf'
                            type='tel'
                            placeholder={getValues('isCnpj') ? 'CNPJ' : 'CPF'}
                            mask={
                              getValues('isCnpj')
                                ? '99.999.999/9999-99'
                                : '999.999.999-99'
                            }
                            className={
                              errors.document
                                ? 'form-control is-invalid'
                                : 'form-control'
                            }
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '11px',
                              right: '10px',
                              display: 'flex',
                              gap: '4px',
                            }}
                          >
                            <span
                              style={{ display: 'block', fontSize: '0.75rem' }}
                            >
                              CNPJ
                            </span>
                            <input
                              style={{ outline: 'none' }}
                              type='checkbox'
                              onChange={(e) => {
                                setValue('document', '', {
                                  shouldValidate: true,
                                });
                                setValue('isCnpj', e.target.checked, {
                                  shouldValidate: true,
                                });
                              }}
                            />
                          </div>
                          <p style={{ fontWeight: 500 }}>
                            *Para emissão de nota fiscal
                          </p>
                          {errors.document && (
                            <div className='input-error'>
                              {getValues('isCnpj')
                                ? 'CNPJ inválido'
                                : 'CPF inválido'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  {paymentMethod == 'billet' && (
                    <div className='pay-billet'>
                      <MethodBillet
                        offer={offer}
                        selectedBumps={selectedBumps}
                      />
                    </div>
                  )}

                  {paymentMethod == 'pix' && (
                    <div className='pay-pix'>
                      <MethodPix
                        offer={offer}
                        selectedBumps={selectedBumps}
                        selectedPlan={selectedPlan}
                      />
                    </div>
                  )}
                  {orderBumps.length > 0 && (
                    <OrderBump
                      offer={offer}
                      products={orderBumps}
                      updateQuantity={updateQuantity}
                      selectedBumps={selectedBumps}
                      setSelectedBumps={setSelectedBumps}
                      paymentMethod={paymentMethod}
                      trackEvent={trackEvent}
                    />
                  )}
                  {plans.length > 0 && (
                    <Plans
                      checkout={offer.checkout}
                      plans={plans}
                      selectedPlan={selectedPlan}
                      setSelectedPlan={setSelectedPlan}
                      setInstallmentsList={setInstallmentsList}
                    />
                  )}
                  {offer.terms && offer.url_terms && (
                    <div className='d-flex justify-content-center mb-3'>
                      <input
                        type='checkbox'
                        style={{ width: '25px' }}
                        onClick={() => setTerms((prev) => !prev)}
                      />
                      <div className='ml-3'>
                        Declaro que li e aceito os{' '}
                        <a
                          href={offer.url_terms}
                          target='_blank'
                          rel='noreferrer'
                        >
                          Termos e condições
                        </a>
                      </div>
                    </div>
                  )}
                  <BuyButton
                    customerDataSent={customerDataSent}
                    verified_id={offer.verified_id}
                    terms={terms}
                    has_terms={offer.terms}
                    loading={loading}
                  />
                  <div className='security'>
                    <div className='button-security'>
                      <i className='bx bxs-check-shield'></i>
                      <div className='texts'>
                        <div className='title'>Compra Segura</div>
                        <div className='label'>
                          Ambiente Seguro e Autenticado
                        </div>
                      </div>
                    </div>
                    <div className='button-security'>
                      <i className='bx bx-fingerprint'></i>
                      <div className='texts'>
                        <div className='title'>Privacidade</div>
                        <div className='label'>Sua informação 100% segura</div>
                      </div>
                    </div>
                  </div>
                </form>
                <div className='desktop'>
                  <Summary
                    offer={offer}
                    product={product}
                    selectedBumps={selectedBumps}
                    orderBumps={orderBumps}
                    discounts={discounts}
                    paymentMethod={paymentMethod}
                    totalPrice={totalPrice}
                    selectedPlan={selectedPlan}
                    plans={plans}
                    coupon={coupon}
                    cupom={cupom}
                    setCoupon={setCoupon}
                    processedBy={processedBy}
                    installmentsList={installmentsList}
                    currentInstallment={currentInstallment}
                    handleToken={handleToken}
                    displayChallenge={displayChallenge}
                    shippingChanged={shippingChanged}
                    hasFrenet={hasFrenet}
                    selectedShipping={
                      selectedOption !== null
                        ? shippingOptions[selectedOption]
                        : null
                    }
                  />
                </div>
              </Col>
              <div className='mobile'>
                <Col lg={3}>
                  <Summary
                    offer={offer}
                    product={product}
                    selectedBumps={selectedBumps}
                    orderBumps={orderBumps}
                    discounts={discounts}
                    paymentMethod={paymentMethod}
                    totalPrice={totalPrice}
                    selectedPlan={selectedPlan}
                    plans={plans}
                    coupon={coupon}
                    cupom={cupom}
                    setCoupon={setCoupon}
                    processedBy={processedBy}
                    installmentsList={installmentsList}
                    currentInstallment={currentInstallment}
                    shippingChanged={shippingChanged}
                    hasFrenet={hasFrenet}
                    selectedShipping={
                      selectedOption ? shippingOptions[selectedOption] : null
                    }
                  />
                </Col>
              </div>

              {images?.sidebar_picture && (
                <Col lg={3}>
                  <img src={images?.sidebar_picture} className='sidebar' />
                </Col>
              )}
            </Row>
          </div>
        </>
      )}
      <ToastContainer
        position='bottom-right'
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

export default Checkout;
