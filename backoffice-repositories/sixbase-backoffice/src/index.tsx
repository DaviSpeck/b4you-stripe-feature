import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'

// ** Redux
import { Provider } from 'react-redux'
import { store } from './redux/store'

// ** ACL / Ability
import ability from './configs/acl/ability'
import { AbilityContext } from './utility/context/Can'

// ** Theme & Contexts
import { ThemeContext } from './utility/context/ThemeColors'
import { UserProvider } from './utility/context/UserContext'

// ** Notifications
import { ToastContainer } from 'react-toastify'

// ** Spinner (Splash Screen)
import Spinner from './@core/components/spinner/Fallback-spinner'

// ** Ripple Button
import './@core/components/ripple-button'

// ** PrismJS (syntax highlight)
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx.min'

// ** Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Toastify
import 'react-toastify/dist/ReactToastify.css'

// ** Core Styles
import './@core/assets/fonts/feather/iconfont.css'
import './@core/scss/core.scss'
import './assets/scss/style.scss'

// ** Service Worker
import * as serviceWorker from './serviceWorker'

// ** Lazy Load App
const LazyApp = lazy(() => import('./App'))

// ** Root element
const rootElement = document.getElementById('root') as HTMLElement

// @ts-ignore - ReactDOM.render exists in React 17
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<Spinner />}>
        <ToastContainer />
        <AbilityContext.Provider value={ability}>
          <ThemeContext>
            <UserProvider>
              <LazyApp />
              <ToastContainer newestOnTop />
            </UserProvider>
          </ThemeContext>
        </AbilityContext.Provider>
      </Suspense>
    </Provider>
  </React.StrictMode>,
  rootElement
)

// ⚙️ Service Worker
serviceWorker.unregister()