import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DollhouseScene from './chibi/DollhouseScene.jsx';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <DollhouseScene />
    </StrictMode>
  );
}
