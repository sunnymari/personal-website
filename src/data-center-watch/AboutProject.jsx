const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/marissabuilds" },
  { label: "YouTube", href: "https://youtube.com/@marissabuilds?si=hskyoPCxD-h07H2u" },
  { label: "Substack", href: "https://substack.com/@marissabuilds" },
  { label: "X/Twitter", href: "https://x.com/marissa_builds" },
];

const RESEARCH = [
  {
    title: "AI-driven demand and grid strain",
    body: "How is data center growth, concentrated in a handful of hubs like Northern Virginia, Dallas, and Phoenix, changing the shape and predictability of electricity demand, and what does that mean for grid planning and pricing?",
  },
  {
    title: "Market design for flexible demand",
    body: "Regulatory efforts like FERC Order 2222 are opening wholesale markets to smaller, aggregated sources of flexibility. Should AI compute load itself participate in demand-response markets the way distributed energy resources now can? What would that market design need to look like?",
  },
  {
    title: "Salience and behavior change",
    body: 'There\'s a body of research on whether visible energy feedback changes household behavior, but almost none of it tests whether attributing demand specifically to AI (rather than generic "peak hours") changes how persuasive that signal is. This site is a small, live experiment in that question.',
  },
];

function SocialRow({ dark = false }) {
  return (
    <p className="text-sm font-semibold mt-3" style={{ color: dark ? "#D8D4C8" : "#6b6358" }}>
      {SOCIAL_LINKS.map((link, i) => (
        <span key={link.href}>
          {i > 0 ? " · " : null}
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="dcw-about-link"
            style={{ color: dark ? "#F2C6C2" : "#7A9464" }}
          >
            {link.label}
          </a>
        </span>
      ))}
    </p>
  );
}

export default function AboutProject({ InfoIcon }) {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="About this project">
      <div
        className="rounded-[2rem] p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
          border: "2px solid rgba(242,198,194,0.45)",
          boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
        }}
      >
        <div className="flex items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
          <InfoIcon size={16} color="#8FA876" />
          About this project
        </div>
        <h2 className="display-font text-3xl sm:text-4xl font-semibold" style={{ color: "#3A3A32" }}>
          About This Project
        </h2>
        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-3xl">
          <strong style={{ color: "#3A3A32" }}>Sprout Data Center Watch</strong> (and its companion
          hardware, Sprout) started as a simple question: as AI reshapes electricity demand, can
          making that demand visible actually change how people use energy at home? This site is both
          a working tool and an open research question.
        </p>

        <h3 className="display-font text-2xl font-semibold mt-10" style={{ color: "#3A3A32" }}>
          What I&apos;m researching
        </h3>
        <ol className="mt-5 space-y-4 list-none p-0 m-0">
          {RESEARCH.map((item, i) => (
            <li
              key={item.title}
              className="flex gap-4 rounded-2xl p-4 sm:p-5"
              style={{
                background: "rgba(250,246,240,0.85)",
                border: "1.5px solid rgba(143,168,118,0.22)",
              }}
            >
              <span
                className="display-font shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                style={{ background: "#F2C6C2", color: "#7A3B36" }}
              >
                {i + 1}
              </span>
              <div>
                <h4 className="display-font text-lg font-bold" style={{ color: "#3A3A32" }}>
                  {item.title}
                </h4>
                <p className="text-sm font-semibold text-stone-600 mt-1 leading-relaxed">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="display-font text-2xl font-semibold mt-10" style={{ color: "#3A3A32" }}>
          The gap this fills
        </h3>
        <p className="text-sm font-semibold text-stone-600 mt-2 leading-relaxed max-w-3xl">
          Most existing data center trackers are built for one of two audiences: environmental /
          regulatory advocacy (mapping facility locations and community impact) or industry and
          investors (capacity buildout, siting). None of them close the loop back to an individual
          household, connecting <em>this data center demand exists</em> to{" "}
          <em>here&apos;s what you can actually do about your bill tonight</em>. That&apos;s the gap
          Sprout Data Center Watch is testing.
        </p>

        <h3 className="display-font text-2xl font-semibold mt-10" style={{ color: "#3A3A32" }}>
          Where this is headed
        </h3>
        <p className="text-sm font-semibold text-stone-600 mt-2 leading-relaxed max-w-3xl">
          I&apos;m currently applying to PhD programs to study AI-energy policy and grid
          infrastructure market design. Sprout, the physical hardware, is in active development, and
          this website will eventually pull the same live CAISO / EIA data feed as the device itself.
        </p>

        <h3 className="display-font text-2xl font-semibold mt-10" style={{ color: "#3A3A32" }}>
          Get in touch
        </h3>
        <p className="text-sm font-semibold text-stone-600 mt-2 leading-relaxed max-w-3xl">
          If you&apos;re working on related research, thinking about demand-response market design,
          or just want to talk about this project, I&apos;d love to hear from you. Feel free to reach
          out with resources or suggestions too.
        </p>
        <p className="mt-4">
          <a
            href="mailto:marissacurry@berkeley.edu"
            className="dcw-about-link display-font text-lg font-bold"
            style={{ color: "#7A3B36" }}
          >
            marissacurry@berkeley.edu
          </a>
        </p>
        <SocialRow />
      </div>
    </section>
  );
}

export function AboutFooterBlurb() {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-10 text-center">
      <p className="text-xs font-semibold leading-relaxed text-stone-500">
        <strong style={{ color: "#6b6358" }}>Sprout Data Center Watch</strong> is a research
        prototype exploring whether visualizing AI-driven grid demand changes how people use energy
        at home. Part of ongoing PhD-track research in AI-energy market design. Questions or ideas?{" "}
        <a
          href="mailto:marissacurry@berkeley.edu"
          className="dcw-about-link"
          style={{ color: "#7A9464" }}
        >
          marissacurry@berkeley.edu
        </a>
      </p>
      <SocialRow />
    </div>
  );
}
