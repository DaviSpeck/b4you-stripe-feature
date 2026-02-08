import { useState } from 'react';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import { useProduct } from '../../../providers/contextProduct';
import ModalFacebook from './modal/modal-facebook';

const Facebook = ({ rows, title, titleModal, fetchData, companyId }) => {
  const [showModal, setShowModal] = useState(false);
  const [activePixel, setActivePixel] = useState(null);
  const { product } = useProduct();

  const setShow = (value) => {
    if (value === false) {
      fetchData();
    }
    setShowModal(value);
  };

  return (
    <>
      <ModalGeneric
        show={showModal}
        setShow={setShow}
        title={`Pixel - ${titleModal}`}
        centered
        size='lg'
      >
        <ModalFacebook
          activePixel={activePixel}
          setActivePixel={setActivePixel}
          setShow={setShow}
          uuidProduct={product.uuid}
          companyId={companyId}
        />
      </ModalGeneric>
      {title && <h4>{title}</h4>}
      <div>
        <table className='table table-sm'>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Pixel</th>
              <th width='70' className='center'>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.settings.label}</td>
                  <td>{item.settings.pixel_id}</td>
                  <td className='text-center'>
                    <ButtonDS
                      size='icon'
                      onClick={() => {
                        setActivePixel(item);
                        setShowModal(true);
                      }}
                    >
                      <i className='fa fa-pencil' />
                    </ButtonDS>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan='100' className='text-center'>
                  Nenhum pixel registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ButtonDS
          variant='primary'
          size={'xs'}
          onClick={() => {
            setShowModal(true);
          }}
        >
          Novo
        </ButtonDS>
      </div>
    </>
  );
};

export default Facebook;
