import { useEffect, useRef, useState } from "react";

const stats = [
  { num: "1,512", label: "Instagram followers" },
  { num: "92.5%", label: "IG impression rate" },
  { num: "1,385", label: "LinkedIn connections" },
  { num: "849", label: "TikTok followers" },
];

const credentials = [
  { title: "Congressional speaker", sub: "Equitable AI policy & access" },
  { title: "JP Morgan hackathon winner", sub: "Fintech & enterprise credibility" },
  { title: "MIT AI Research Fellow", sub: "Academic authority behind endorsements" },
  { title: "Times Square billboard", sub: "Rising creator in tech — via Topmate" },
  { title: "Miss America CA 2026", sub: "Tech × culture × beauty crossover" },
];

const pillars = [
  { icon: "⚙️", title: "Dev tools & AI", desc: "Real takes on Cursor, Copilot, Claude, Railway — from someone who ships daily." },
  { icon: "🏡", title: "Real estate tech", desc: "PropTech, creative finance, and AI investing through Portfolio.AI." },
  { icon: "✨", title: "Women in STEM", desc: "Behind the screen of a Black woman engineer — career, aesthetics, ambition." },
  { icon: "🎀", title: "Lifestyle & pageant", desc: "Pink-coded, kawaii daily life. Miss America CA campaign and vibe curation." },
  { icon: "💡", title: "Tutorials & demos", desc: "Build-in-public content that doesn't talk down to the audience." },
  { icon: "🎓", title: "Education & equity", desc: "Advocacy-backed authority with receipts — Congress, hackathons, fellowships." },
];

const formats = [
  "Sponsored carousel", "Reel / tutorial", "LinkedIn takeover",
  "Newsletter feature", "Event / speaking", "Affiliate / code",
];

const targets = [
  "Cursor", "GitHub Copilot", "Anthropic", "v0.dev",
  "Railway", "Notion AI", "Superhuman", "Oura Ring",
];

export default function WorkWithMe() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "radial-gradient(circle at 14% 18%, rgba(255,217,234,0.62) 0, rgba(255,217,234,0) 26%), radial-gradient(circle at 84% 12%, rgba(205,167,255,0.4) 0, rgba(205,167,255,0) 28%), linear-gradient(180deg, #9ed8ff 0%, #b8e7ff 42%, #ffe8f2 100%)",
        padding: "112px 0 96px",
        fontFamily: "'Nunito', sans-serif",
        overflow: "hidden",
        position: "relative",
        color: "#8f5f79",
      }}
    >
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(239,93,168,0.24) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(150,219,187,0.35) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>

        <div style={{
          marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "13px",
              fontWeight: 800,
              color: "#b45e89",
              textDecoration: "none",
              marginBottom: "18px",
              background: "linear-gradient(180deg, #fff8ef 0%, #ffd9ea 100%)",
              border: "2px solid #f0bfd4",
              borderRadius: "999px",
              padding: "0.55rem 1rem",
              boxShadow: "0 10px 20px rgba(180, 94, 137, 0.16)",
            }}
          >
            ← Back to Home
          </a>
          <p style={{
            fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#b45e89", fontWeight: 800, marginBottom: "12px",
          }}>
            Brand partnerships
          </p>
          <h2 style={{
            fontFamily: "'Roboto Serif', serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800, color: "#8f5f79",
            lineHeight: 1.05, margin: 0,
          }}>
            Work <em style={{ fontStyle: "italic", color: "#ef5da8" }}>With Me</em>
          </h2>
          <p style={{
            fontSize: "17px", color: "#8f5f79", lineHeight: 1.7,
            maxWidth: "520px", marginTop: "20px",
          }}>
            Early-stage creator. Exceptional engagement. Credentials that outpace the follower count —
            brands who partner now lock in lower rates before the curve.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px", marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "linear-gradient(180deg, rgba(255,248,239,0.92) 0%, rgba(255,244,250,0.9) 100%)",
              border: "3px solid #f0bfd4",
              borderRadius: "24px", padding: "1.4rem 1.2rem",
              boxShadow: "0 14px 28px rgba(90, 126, 152, 0.14)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
                e.currentTarget.style.boxShadow = "0 18px 34px rgba(180, 94, 137, 0.22)";
                e.currentTarget.style.borderColor = "#ef5da8";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 14px 28px rgba(90, 126, 152, 0.14)";
                e.currentTarget.style.borderColor = "#f0bfd4";
              }}
            >
              <span style={{
                fontFamily: "'Roboto Serif', serif",
                fontSize: "28px", fontWeight: 800, color: "#ef5da8", display: "block",
              }}>{s.num}</span>
              <span style={{ fontSize: "12px", color: "#b45e89", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          background: "linear-gradient(135deg, rgba(255,248,239,0.94) 0%, rgba(255,217,234,0.92) 100%)",
          border: "3px solid #f0bfd4",
          borderRadius: "28px", padding: "1.5rem 2rem",
          marginBottom: "72px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: "2rem",
          flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.2s",
        }}>
          <div>
            <p style={{ fontSize: "13px", color: "#b45e89", fontWeight: 800, marginBottom: "6px" }}>
              Why impression rate &gt; follower count
            </p>
            <p style={{ fontSize: "14px", color: "#8f5f79", lineHeight: 1.6, maxWidth: "520px" }}>
              A 92.5% Instagram impression rate means nearly every follower sees every post.
              Most accounts with 10k+ followers sit at 20–30%. Brand messages actually land here.
            </p>
          </div>
          <span style={{
            fontFamily: "'Roboto Serif', serif",
            fontSize: "56px", fontWeight: 800, color: "#ef5da8",
            flexShrink: 0,
          }}>92.5%</span>
        </div>

        <div style={{
          marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.3s",
        }}>
          <p style={{
            fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#b45e89", fontWeight: 800, marginBottom: "20px",
          }}>Content pillars</p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px",
          }}>
            {pillars.map((p, i) => (
              <div key={i} style={{
                background: "linear-gradient(180deg, rgba(255,248,239,0.9) 0%, rgba(255,244,250,0.88) 100%)", border: "2px solid #f0bfd4",
                borderRadius: "24px", padding: "1.2rem",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#ef5da8";
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 14px 24px rgba(180, 94, 137, 0.18)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#f0bfd4";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "20px", display: "block", marginBottom: "8px" }}>{p.icon}</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#8f5f79", marginBottom: "4px" }}>{p.title}</p>
                <p style={{ fontSize: "12px", color: "#8f5f79", lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.35s",
        }}>
          <p style={{
            fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#b45e89", fontWeight: 800, marginBottom: "20px",
          }}>Credentials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {credentials.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(255,248,239,0.88)", borderLeft: "4px solid #ef5da8",
                borderRadius: "0 18px 18px 0", padding: "0.85rem 1.2rem",
                gap: "1rem",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#8f5f79" }}>{c.title}</span>
                <span style={{ fontSize: "12px", color: "#8f5f79", textAlign: "right" }}>{c.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px",
          marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.4s",
        }}>
          <div>
            <p style={{
              fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#b45e89", fontWeight: 800, marginBottom: "16px",
            }}>Partnership formats</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {formats.map((f, i) => (
                <span key={i} style={{
                  fontSize: "12px", padding: "6px 14px", borderRadius: "20px",
                  background: "rgba(255,248,239,0.88)", border: "1px solid #f0bfd4", color: "#8f5f79",
                }}>{f}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{
              fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#b45e89", fontWeight: 800, marginBottom: "16px",
            }}>Dream partners</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {targets.map((t, i) => (
                <span key={i} style={{
                  fontSize: "12px", padding: "6px 14px", borderRadius: "20px",
                  background: "rgba(255,217,234,0.58)", border: "1px solid #f0bfd4",
                  color: "#b45e89", fontWeight: 800,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(180deg, rgba(255,248,239,0.94) 0%, rgba(255,244,250,0.92) 100%)", border: "3px solid #f0bfd4",
          borderRadius: "28px", padding: "2rem 2.5rem",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "2rem", flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.5s",
        }}>
          <div>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#8f5f79", marginBottom: "6px" }}>
              Ready to work together?
            </p>
            <p style={{ fontSize: "14px", color: "#8f5f79" }}>
              marissacodes.com · @marisummerss · partnerships, speaking & collab inquiries welcome.
            </p>
          </div>
          <a
            href="mailto:marissacurry809@gmail.com"
            style={{
              background: "linear-gradient(180deg, #ef5da8 0%, #b45e89 100%)", color: "#fff",
              padding: "0.85rem 2rem", borderRadius: "999px",
              fontSize: "14px", fontWeight: 800,
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Get in touch
          </a>
        </div>

      </div>
    </section>
  );
}
