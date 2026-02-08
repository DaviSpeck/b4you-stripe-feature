import { createContext, useContext, useState } from 'react';

export const ProductContext = createContext();
export const useProduct = () => useContext(ProductContext);

const ProductProvider = (props) => {
  const [product, setProduct] = useState(null);

  return <ProductContext.Provider value={{ product, setProduct }} {...props} />;
};

export default ProductProvider;
