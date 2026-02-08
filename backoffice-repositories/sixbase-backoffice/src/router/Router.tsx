// ** React Imports
import React, { Suspense, useContext, lazy, Fragment, useMemo } from 'react'

// ** Utils
import { isUserLoggedIn } from 'utility/Utils'
import { useLayout } from 'utility/hooks/useLayout'
import { AbilityContext } from 'utility/context/Can'
import { useRouterTransition } from 'utility/hooks/useRouterTransition'

// ** Custom Components
import LayoutWrapper from '@core/layouts/components/layout-wrapper'

// ** Router Components
import {
  BrowserRouter as AppRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'

// ** Routes & Default Routes
import { DefaultRoute, Routes } from './routes'
import FinalRoute from './components/FinalRoute'

// ** Layouts
import BlankLayout from '@core/layouts/BlankLayout'
import VerticalLayout from 'layouts/VerticalLayout'
import HorizontalLayout from 'layouts/HorizontalLayout'

// ** Context
import { UserContext } from 'utility/context/UserContext'

const Router: React.FC = () => {
  // ** Hooks
  const { layout, setLayout, setLastLayout } = useLayout()
  const { transition, setTransition } = useRouterTransition()

  // ** Contexts
  const ability = useContext(AbilityContext)
  const { userData, loading } = useContext(UserContext)

  // ** Default Layout
  const DefaultLayout =
    layout === 'horizontal' ? 'HorizontalLayout' : 'VerticalLayout'

  // ** All available layouts
  const Layouts = { BlankLayout, VerticalLayout, HorizontalLayout }

  // ** Current Active Item
  const currentActiveItem = null

  // ** Lazy Components
  const NotAuthorized = lazy(
    () => import('views/pages/misc/NotAuthorized')
  )
  const Error = lazy(() => import('views/pages/misc/Error'))

  // ** Memoized layout filtering for performance
  const getLayoutRoutesAndPaths = useMemo(() => {
    const map: Record<
      string,
      { layoutRoutes: any[]; layoutPaths: string[] }
    > = {}

    Object.keys(Layouts).forEach((layoutKey) => {
      const layoutRoutes: any[] = []
      const layoutPaths: string[] = []

      Routes.forEach((route) => {
        if (
          route.layout === layoutKey ||
          (route.layout === undefined && DefaultLayout === layoutKey)
        ) {
          layoutRoutes.push(route)
          layoutPaths.push(route.path)
        }
      })

      map[layoutKey] = { layoutRoutes, layoutPaths }
    })

    return map
  }, [Routes, DefaultLayout])

  // ** Resolve routes grouped by layout
  const ResolveRoutes = () =>
    Object.keys(Layouts).map((layoutKey, index) => {
      const LayoutTag = Layouts[layoutKey]
      const { layoutRoutes, layoutPaths } = getLayoutRoutesAndPaths[layoutKey]
      const routerProps: Record<string, any> = {}

      return (
        <Route path={layoutPaths} key={index}>
          <LayoutTag
            layout={layoutKey}
            setLayout={setLayout}
            transition={transition}
            routerProps={routerProps}
            setLastLayout={setLastLayout}
            setTransition={setTransition}
            currentActiveItem={currentActiveItem}
          >
            <Switch>
              {layoutRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  exact
                  render={(props) => {
                    Object.assign(routerProps, { ...props, meta: route.meta })
                    const Wrapper =
                      route.layout === 'BlankLayout' ? Fragment : LayoutWrapper

                    return (
                      <Wrapper
                        {...(route.layout !== 'BlankLayout' && {
                          layout: DefaultLayout,
                          transition,
                          setTransition,
                          ...(route.appLayout && { appLayout: route.appLayout }),
                          ...(route.meta && { routeMeta: route.meta }),
                          ...(route.className && {
                            wrapperClass: route.className
                          })
                        })}
                      >
                        <Suspense fallback={null}>
                          <FinalRoute
                            route={route}
                            ability={ability}
                            {...props}
                          />
                        </Suspense>
                      </Wrapper>
                    )
                  }}
                />
              ))}
            </Switch>
          </LayoutTag>
        </Route>
      )
    })

  // ** Loading state (durante revalidação do UserContext)
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#6e6b7b',
          fontSize: '1.2rem'
        }}
      >
        Carregando sessão...
      </div>
    )
  }

  return (
    <AppRouter basename={process.env.REACT_APP_BASENAME}>
      <Switch>
        {/* Redirect root to default or login */}
        <Route
          exact
          path="/"
          render={() =>
            userData || isUserLoggedIn() ? (
              <Redirect to={DefaultRoute} />
            ) : (
              <Redirect to="/login" />
            )
          }
        />

        {/* Not Authorized */}
        <Route
          exact
          path="/misc/not-authorized"
          render={() => (
            <Layouts.BlankLayout>
              <NotAuthorized />
            </Layouts.BlankLayout>
          )}
        />

        {/* Application Routes */}
        {ResolveRoutes()}

        {/* 404 Page */}
        <Route path="*" component={Error} />
      </Switch>
    </AppRouter>
  )
}

export default Router