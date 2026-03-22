import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import MeshyRoomCanvas from './MeshyRoomCanvas.jsx';

const DEFAULT_CHIBI = '/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Walking_withSkin.glb';

const CHIBI_OPTIONS = [
  { value: '/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Walking_withSkin.glb', label: 'Walking' },
  { value: '/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Running_withSkin.glb', label: 'Running' },
  { value: '/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Wave_One_Hand_withSkin.glb', label: 'Wave' },
  { value: '/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Wave_for_Help_3_withSkin.glb', label: 'Wave for help' },
  { value: '/Meshy_AI_Chibi_Coder_with_Gala_0322190228_texture.glb', label: 'Gala portrait (spin)' },
];

export default function MeshyRoomMount() {
  const [chibiUrl, setChibiUrl] = useState(DEFAULT_CHIBI);

  useEffect(() => {
    CHIBI_OPTIONS.forEach((o) => useGLTF.preload(o.value));
  }, []);

  return (
    <div className="meshy-room-inner">
      <div className="model-card-head meshy-room-toolbar">
        <span className="model-card-title">Chibi + laptop</span>
        <label className="sr-only" htmlFor="meshyChibiSelect">
          Chibi variant
        </label>
        <select
          id="meshyChibiSelect"
          className="anim-select"
          aria-label="Chibi variant"
          value={chibiUrl}
          onChange={(e) => setChibiUrl(e.target.value)}
        >
          {CHIBI_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="meshy-three-canvas" aria-label="3D room with chibi and laptop">
        <MeshyRoomCanvas chibiUrl={chibiUrl} />
      </div>
      <p className="chibi-caption meshy-room-caption">
        One WebGL room — orbit to look around · chibi anim or spin (gala)
      </p>
      <p className="meshy-room-foot">
        Playful walk &amp; pickup (procedural): <a href="/chibi">Chibi scene</a>
      </p>
    </div>
  );
}
