import ReactDOM from 'react-dom';
import App from './App';

import SimpleReactLightbox from 'simple-react-lightbox';
import ProductProvider from './providers/contextProduct';
import CollaboratorProvider from './providers/contextCollaborator';

ReactDOM.render(
  <SimpleReactLightbox>
    <CollaboratorProvider>
      <ProductProvider>
        <App />
      </ProductProvider>
    </CollaboratorProvider>
  </SimpleReactLightbox>,
  document.getElementById('root')
);
