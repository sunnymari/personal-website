import { createRoot } from 'react-dom/client';
import WorkWithMe from './work-with-me/WorkWithMe.jsx';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<WorkWithMe />);
}
