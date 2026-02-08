import { useEffect, useState } from 'react';
import UpsellGenerator from './UpsellGenerator';
import ModalOfferForm from './modal-offer-form';
import api from '../../../providers/api';
import 'moment/locale/pt-br';
import 'react-datepicker/dist/react-datepicker.css';
import './modal-offer.scss';

const ModalOffer = ({
  activeOffer,
  setActiveOffer,
  uuidProduct,
  setShowModal,
  notify,
}) => {
  const [nav, setNav] = useState('form');
  const [classrooms, setClassrooms] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get(`/products/classrooms/${uuidProduct}/preview`)
      .then((response) => {
        setClassrooms(response.data);
      })
      .catch(() => {});

    if (activeOffer) {
      api
        .get(
          `/products/offers/${uuidProduct}/${activeOffer.uuid}/select-offers`
        )
        .then((response) => {
          setProducts(response.data);
        })
        .catch(() => {
          // console.log('caiu no catch');
        });
    }

    return () => {
      // setActiveOffer(null);
    };
  }, []);

  //
  return (
    <>
      {nav === 'form' ? (
        <ModalOfferForm
          activeOffer={activeOffer}
          setActiveOffer={setActiveOffer}
          classrooms={classrooms}
          products={products}
          uuidProduct={uuidProduct}
          setShowModal={setShowModal}
          notify={notify}
          setNav={setNav}
          nav={nav}
        />
      ) : (
        <UpsellGenerator
          activeOffer={activeOffer}
          setNav={setNav}
          notify={notify}
          uuidProduct={uuidProduct}
        />
      )}
    </>
  );
};
export default ModalOffer;
