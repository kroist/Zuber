import { useIntegration } from '@tma.js/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator, useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@tma.js/sdk-react';
import { type FC, useEffect, useMemo } from 'react';
import {
  Navigate,
  Route,
  Router,
  RouterProvider,
  Routes,
  createBrowserRouter,
} from 'react-router-dom';

import { routes } from '@/navigation/routes.tsx';
import LobbyCodePage from '@/pages/LobbyCodePage/LobbyCodePage';
import LobbyPage from '@/pages/LobbyPage/Lobby';

export const App: FC = () => {


  // Create new application navigator and attach it to the browser history, so it could modify
  // it and listen to its changes.
  // const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  // const [location, reactNavigator] = useIntegration(navigator);

  // Don't forget to attach the navigator to allow it to control the BackButton state as well
  // as browser history.
  // useEffect(() => {
  //   navigator.attach();
  //   return () => navigator.detach();
  // }, [navigator]);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <LobbyCodePage />,
    },
    {
      path: '/lobby',
      element: <LobbyPage />,
    }
  ]);

  return (
    <RouterProvider router={router} />
  )

  // return (
  //   <Router location={location} navigator={reactNavigator}>
  //     <Routes>
  //       {routes.map((route) => <Route key={route.path} {...route} />)}
  //       <Route path='*' element={<Navigate to='/'/>}/>
  //     </Routes>
  //   </Router>
  // );
};
