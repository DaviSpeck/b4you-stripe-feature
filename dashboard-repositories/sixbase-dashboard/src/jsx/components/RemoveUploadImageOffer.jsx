import React from 'react';
import api from '../../providers/api';
import ButtonDS from './design-system/ButtonDS';

const RemoveUploadImageOffer = ({
  activeOffer,
  route,
  field,
  setImg_link,
  img_link,
  isRemovingImage,
  setIsRemovingImage,
}) => {
  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemovingImage) {
      return;
    }

    setIsRemovingImage(true);

    api
      .delete(route)
      .then(() => {
        setImg_link({ name: field, url: null });
      })
      .catch((err) => {
        console.error(err.response);
      })
      .finally(() => {
        setIsRemovingImage(false);
      });
  };

  return (
    <>
      {(!!activeOffer[field] || !!img_link) && (
        <div className='mt-2'>
          {!isRemovingImage ? (
            <ButtonDS
              type='submit'
              variant='danger'
              onClick={onSubmit}
              size='icon'
              outline
              disabled={isRemovingImage}
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

export default RemoveUploadImageOffer;
