import type { ComponentType, JSX } from 'react';

import LobbyCodePage from '@/pages/LobbyCodePage/LobbyCodePage';
import LobbyPage from '@/pages/LobbyPage/Lobby';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: LobbyCodePage, title: 'Lobby Code' },
  { path: '/lobby', Component: LobbyPage, title: 'Lobby' },
];
