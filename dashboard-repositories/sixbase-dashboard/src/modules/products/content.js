import ContentVideo from './content/video';
import ContentEbook from './content/ebook';
// import { useParams } from 'react-router-dom';
import { useProduct } from '../../providers/contextProduct';

const PageProductsEditContent = () => {
  // const { uuidProduct } = useParams();
  const { product } = useProduct();

  return (
    <>
      <section id='content'>
        {!product ? (
          'carragendo produto'
        ) : (
          <>{product.type === 'video' ? <ContentVideo /> : <ContentEbook />}</>
        )}
      </section>
    </>
  );
};

export default PageProductsEditContent;
