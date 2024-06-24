import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Root } from '@/components/Root';

// import '@telegram-apps/telegram-ui/dist/styles.css';

// ReactDOM.createRoot(document.getElementById('root')!).render(<Root/>);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
