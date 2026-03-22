import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ChibiScene from './chibi/ChibiScene.jsx';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <ChibiScene />
    </StrictMode>
  );
}
