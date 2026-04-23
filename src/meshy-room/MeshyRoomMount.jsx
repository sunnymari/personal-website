import DollhouseScene from '../chibi/DollhouseScene.jsx';

export default function MeshyRoomMount() {
  return (
    <div className="meshy-room-inner">
      <div className="meshy-three-canvas" aria-label="3D kawaii dollhouse scene">
        <DollhouseScene embedded />
      </div>
    </div>
  );
}
