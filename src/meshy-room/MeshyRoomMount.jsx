import MeshyRoomCanvas from './MeshyRoomCanvas.jsx';

export default function MeshyRoomMount() {
  return (
    <div className="meshy-room-inner">
      <div className="meshy-three-canvas" aria-label="3D scene with chibi and laptop">
        <MeshyRoomCanvas />
      </div>
    </div>
  );
}
