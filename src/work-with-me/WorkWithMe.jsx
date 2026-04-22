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
        background: "#0A0A0A",
        padding: "100px 0",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(255,45,120,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>

        <div style={{
          marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <p style={{
            fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#FF2D78", fontWeight: 500, marginBottom: "12px",
          }}>
            Brand partnerships
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700, color: "#FFFFFF",
            lineHeight: 1.05, margin: 0,
          }}>
            Work <em style={{ fontStyle: "italic", color: "#FF2D78" }}>With Me</em>
          </h2>
          <p style={{
            fontSize: "17px", color: "#888", lineHeight: 1.7,
            maxWidth: "520px", marginTop: "20px",
          }}>
            Early-stage creator. Exceptional engagement. Credentials that outpace the follower count —
            brands who partner now lock in lower rates before the curve.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px", marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "#111", border: "0.5px solid #222",
              borderRadius: "12px", padding: "1.4rem 1.2rem",
            }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px", fontWeight: 700, color: "#FF2D78", display: "block",
              }}>{s.num}</span>
              <span style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          background: "linear-gradient(135deg, #1a0008 0%, #110006 100%)",
          border: "0.5px solid rgba(255,45,120,0.3)",
          borderRadius: "16px", padding: "1.5rem 2rem",
          marginBottom: "72px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: "2rem",
          flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.2s",
        }}>
          <div>
            <p style={{ fontSize: "13px", color: "#FF2D78", fontWeight: 500, marginBottom: "6px" }}>
              Why impression rate &gt; follower count
            </p>
            <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, maxWidth: "520px" }}>
              A 92.5% Instagram impression rate means nearly every follower sees every post.
              Most accounts with 10k+ followers sit at 20–30%. Brand messages actually land here.
            </p>
          </div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "56px", fontWeight: 700, color: "#FF2D78",
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
            color: "#444", fontWeight: 500, marginBottom: "20px",
          }}>Content pillars</p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
          }}>
            {pillars.map((p, i) => (
              <div key={i} style={{
                background: "#111", border: "0.5px solid #1e1e1e",
                borderRadius: "12px", padding: "1.2rem",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}
              >
                <span style={{ fontSize: "20px", display: "block", marginBottom: "8px" }}>{p.icon}</span>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", marginBottom: "4px" }}>{p.title}</p>
                <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>{p.desc}</p>
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
            color: "#444", fontWeight: 500, marginBottom: "20px",
          }}>Credentials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {credentials.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#111", borderLeft: "2px solid #FF2D78",
                borderRadius: "0 10px 10px 0", padding: "0.85rem 1.2rem",
                gap: "1rem",
              }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#fff" }}>{c.title}</span>
                <span style={{ fontSize: "12px", color: "#555", textAlign: "right" }}>{c.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px",
          marginBottom: "72px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.4s",
        }}>
          <div>
            <p style={{
              fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#444", fontWeight: 500, marginBottom: "16px",
            }}>Partnership formats</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {formats.map((f, i) => (
                <span key={i} style={{
                  fontSize: "12px", padding: "6px 14px", borderRadius: "20px",
                  background: "#111", border: "0.5px solid #222", color: "#888",
                }}>{f}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{
              fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#444", fontWeight: 500, marginBottom: "16px",
            }}>Dream partners</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {targets.map((t, i) => (
                <span key={i} style={{
                  fontSize: "12px", padding: "6px 14px", borderRadius: "20px",
                  background: "rgba(255,45,120,0.08)", border: "0.5px solid rgba(255,45,120,0.25)",
                  color: "#FF2D78", fontWeight: 500,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: "#111", border: "0.5px solid #222",
          borderRadius: "16px", padding: "2rem 2.5rem",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "2rem", flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.5s",
        }}>
          <div>
            <p style={{ fontSize: "20px", fontWeight: 500, color: "#fff", marginBottom: "6px" }}>
              Ready to work together?
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              marissacodes.com · @marisummerss · partnerships, speaking & collab inquiries welcome.
            </p>
          </div>
          <a
            href="mailto:marissacurry809@gmail.com"
            style={{
              background: "#FF2D78", color: "#fff",
              padding: "0.85rem 2rem", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500,
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
