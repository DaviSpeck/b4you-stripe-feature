import React from 'react';
import { useState, useRef, useEffect } from 'react';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';
import ButtonDS from './design-system/ButtonDS';

const RemoveUploadImage = ({ route, field, setImg_link, img_link }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { product, setProduct } = useProduct();

  const onSubmit = () => {
    setIsRemoving(true);
    api
      .delete(route)
      .then((response) => {
        setIsRemoving(false);
        setImg_link(null);
        setProduct((prevProduct) => ({
          ...prevProduct,
          [field]: response.data[field],
        }));
      })
      .catch((err) => {
        console.error(err.response);
        setIsRemoving(false);
      });
  };

  return (
    <>
      {(!!product[field] || !!img_link) && (
        <div className='mt-2'>
          {!isRemoving ? (
            <ButtonDS
              type='submit'
              variant='danger'
              onClick={onSubmit}
              size='icon'
              outline
              disabled={isRemoving}
            >
              <i className='bx bx-x' style={{ fontSize: 20 }}></i>
            </ButtonDS>
          ) : (
            <div className='d-block'>
              <div className='d-flex align-items-center text-danger'>
                <i
                  className='bx bx-loader-alt bx-spin mr-2'
                  style={{ fontSize: 20 }}
                />
                <small>Removendo...</small>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RemoveUploadImage;
