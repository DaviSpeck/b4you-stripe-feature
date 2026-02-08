import api from '../../../../../../providers/api';
import { IoImageOutline } from 'react-icons/io5';
import { BiSolidCheckShield } from 'react-icons/bi';
import { BiSolidLock } from 'react-icons/bi';
import { PiVideo } from 'react-icons/pi';
import { Step } from './components/step';
import { MessageNotClose } from './components/message-not-close';
import { OfferCard } from './components/offerCard';
import { useEffect, useState } from 'react';
import { OfferTitle } from './components/offer-title';
import { Subtitle } from './components/offer-subtitle';
import { HeaderPageComponent } from './components/header-page';
import './style.scss';

export const StyleView = (props) => {
  const { data, productData } = props;

  return (
    <div>
      <StyleView.Header />
      <StyleView.StylePreview data={data} productData={productData} />
    </div>
  );
};

// eslint-disable-next-line react/display-name
StyleView.Header = function () {
  return (
    <div className='header-style-view-offer'>
      <div className='wrapper-name-offer'>
        <IoImageOutline className='icon-offer' size={22} />
        <h3>Pré-visualização</h3>
      </div>
      <p>Aqui uma visualização de como sua página upsell ficará</p>
    </div>
  );
};

// eslint-disable-next-line react/display-name
StyleView.StylePreview = function (props) {
  const { data, productData } = props;

  const extractSrcFromIframe = (iframeHTML) => {
    const match = iframeHTML.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };

  const videoUrl = data.mediaEmbed && extractSrcFromIframe(data.mediaEmbed);

  return (
    <div
      className='style-view'
      style={{
        backgroundColor: data.background,
      }}
    >
      {data.isStepVisible && <Step data={data} />}
      <HeaderPageComponent data={data} />
      <div
        className='style-view-main'
        style={{
          backgroundColor: data.background,
        }}
      >
        <div
          className='wrapper-custom'
          {...(data.backgroundImageDesktop && {
            style: {
              backgroundImage: `url(${data.backgroundImageDesktop})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              padding: '24px',
              borderRadius: '24px',
            },
          })}
        >
          {data.isMessageNotClose && <MessageNotClose data={data} />}
          <div
            style={{
              display: 'flex',
              width: '100%',
              maxWidth: '600px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {data.titleImage && (
              <img
                style={{
                  width: '130px',
                  height: 'fit-content',
                  objectFit: 'contain',
                  marginBottom: '25px',
                }}
                src={data.titleImage}
              />
            )}
            <OfferTitle data={data} />
            <Subtitle data={data} />
            {Boolean(data.mediaUrl) && !data.isEmbedVideo && (
              <img
                src={data.mediaUrl}
                style={{
                  width: 'fit-content',
                  height: 'fit-content',
                  paddingTop: '16px',
                }}
              />
            )}
            {data.isEmbedVideo && videoUrl && (
              <iframe
                src={`${videoUrl}?autoplay=1&mute=1`}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                style={{
                  width: '100%',
                  marginTop: '16px',
                }}
              />
            )}
            {((data.isEmbedVideo && !videoUrl) ||
              (!data.isEmbedVideo && !data.mediaUrl)) && (
              <div className='image-preview'>
                {!data.isEmbedVideo && !data.mediaUrl && (
                  <>
                    <IoImageOutline size={22} />
                    <span>Adicione uma imagem</span>
                  </>
                )}
                {data.isEmbedVideo && !videoUrl && (
                  <>
                    <PiVideo size={22} />
                    <span>Adicione uma mídia</span>
                  </>
                )}
              </div>
            )}
            <StyleView.Offers
              offers={data.offers}
              productData={productData}
              upsellOfferUuid={data.upsellOfferId}
              isMultiOffer={data.isMultiOffer}
            />
            <div className='wrapper-actions'>
              <div className='wrapper-btn'>
                <button
                  className='btn-accept'
                  style={{
                    backgroundColor: data.btnColorAccept,
                    color: data.btnTextColorAccept,
                    fontSize: `${data.btnTextAcceptSize}px`,
                  }}
                >
                  {data.btnTextAccept}
                </button>
                <button
                  className='btn-refuse'
                  style={{
                    color: data.btnTextColorRefuse,
                    fontSize: `${data.btnTextRefuseSize}px`,
                  }}
                >
                  {data.btnTextRefuse}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {data.isFooterVisible && (
        <footer>
          <div className='icon-footer'>
            <BiSolidCheckShield color='#0F1B35' size={40} />
            <p>
              COMPRA <br /> SEGURA
            </p>
          </div>
          <div className='icon-footer'>
            <img src='/trophy.svg' />
            <p>
              SATISFAÇÃO <br /> GARANTIDA
            </p>
          </div>
          <div className='icon-footer'>
            <BiSolidLock color='#0F1B35' size={40} />
            <p>
              PRIVACIDADE <br /> PROTEGIDA
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

// eslint-disable-next-line react/display-name
StyleView.Offers = function (props) {
  const [offersPlan, setOffersPlan] = useState(null);

  const { offers, upsellOfferUuid, productData, isMultiOffer } = props;

  const getOfferByUuid = async (uuid) => {
    try {
      const res = await api.get(`/offers/${uuid}/by-uuid`);
      return res;
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    if (productData && productData.paymentType !== 'subscription') {
      setOffersPlan([]);
    }

    if (productData?.paymentType === 'subscription' && upsellOfferUuid) {
      const getOffer = async () => {
        const res = await getOfferByUuid(upsellOfferUuid);
        setOffersPlan(res.data.plans);
      };
      getOffer();
    }
  }, [productData, upsellOfferUuid]);

  useEffect(() => {
    if (!productData) return;
    setOffersPlan([]);
  }, [productData]);

  return (
    <div className='wrapper-offers-upsell'>
      {isMultiOffer &&
        offers.map((offer, i) => (
          <OfferCard key={offer?.id} isSelected={i === 0} {...offer} />
        ))}
      {!isMultiOffer &&
        productData?.paymentType === 'subscription' &&
        offersPlan?.map((plan, index) => (
          <OfferCard.Plan key={plan?.id} isSelected={index === 0} {...plan} />
        ))}
    </div>
  );
};
