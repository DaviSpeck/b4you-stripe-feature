import { useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../../modules/functions';
import { Spinner } from 'react-bootstrap';
import UploadImage from '../../../jsx/components/UploadImage';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import './style.scss';

export const ImageUpload = (props) => {
  const [isLoading, setIsLoading] = useState(false);

  const { form, fieldName, uploadField, uploadUrl, deleteUrl, isActive } =
    props;

  const mediaUrl = form.watch(fieldName);

  const handleImageRemove = async () => {
    try {
      setIsLoading(true);
      await api.delete(deleteUrl);
      form.setValue(fieldName, null);
    } catch (error) {
      notify({
        message:
          'Não foi possível remover a imagem. Tente novamente mais tarde',
        error: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className='input-loding'>
          <Spinner variant='light' size='sm' animation='border' />
        </div>
      )}
      {!mediaUrl && !isLoading && (
        <UploadImage
          route={uploadUrl}
          multiple={false}
          field={uploadField}
          update={uploadField}
          disabled={!isActive}
          setImg_link={(link) => {
            form.setValue(fieldName, link);
          }}
        />
      )}
      {mediaUrl && !isLoading && (
        <div className='form-group d-flex justify-content-start' mt={3} p={0}>
          <img src={mediaUrl} className='img-fluid' style={{ maxWidth: 200 }} />
          <ButtonDS
            style={{ width: 22, height: 22 }}
            size={'icon'}
            className='btn-remove-media'
            outline
            type='button'
            variant='danger'
            disabled={!isActive}
            onClick={isActive && handleImageRemove}
          >
            <i className='bx bx-x'></i>
          </ButtonDS>
        </div>
      )}
    </>
  );
};
