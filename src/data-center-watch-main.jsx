import { createRoot } from 'react-dom/client';
import DataCenterWatch from './data-center-watch/DataCenterWatch.jsx';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<DataCenterWatch />);
}
