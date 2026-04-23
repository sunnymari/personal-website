import IslandHomepageScene from './IslandHomepageScene.jsx';

export default function KawaiiIslandLandingPage() {
  return (
    <section className="kawaii-island-landing" aria-label="Kawaii island landing world">
      <IslandHomepageScene />
      <div className="kawaii-vignette" aria-hidden="true" />
      <div className="kawaii-soft-glow kawaii-soft-glow-left" aria-hidden="true" />
      <div className="kawaii-soft-glow kawaii-soft-glow-right" aria-hidden="true" />
    </section>
  );
}
