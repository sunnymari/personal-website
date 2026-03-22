import { createRoot } from 'react-dom/client';
import MeshyRoomMount from './meshy-room/MeshyRoomMount.jsx';

const el = document.getElementById('meshy-room-root');
if (el) {
  createRoot(el).render(<MeshyRoomMount />);
}
