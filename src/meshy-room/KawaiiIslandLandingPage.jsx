import { useEffect, useMemo, useState } from 'react';
import IslandHomepageScene from './IslandHomepageScene.jsx';

const MENU_ITEMS = [
  { emoji: '🌸', label: 'About', href: '/about.html' },
  { emoji: '🎀', label: 'Projects', href: '/projects.html' },
  { emoji: '📚', label: 'Reading', href: '/reading.html' },
  { emoji: '☁️', label: 'Work With Me', href: '/work-with-me.html' },
  { emoji: '📝', label: 'Blog', href: '/blog.html' },
  { emoji: '🎮', label: 'Pageant Sim', href: '/pageant.html' },
  { emoji: '🏠', label: 'Dollhouse', href: '/chibi.html' },
];



const PATH_STONES = [
  'left-[40%] top-[60%]',
  'left-[43%] top-[64%]',
  'left-[47%] top-[68%]',
  'left-[51%] top-[72%]',
  'left-[55%] top-[76%]',
  'left-[58%] top-[80%]',
];

const FLOWER_PATCHES = [
  'left-[13%] top-[56%]',
  'left-[30%] top-[72%]',
  'left-[63%] top-[60%]',
  'right-[14%] top-[47%]',
  'right-[23%] top-[66%]',
  'left-[70%] top-[77%]',
];

export default function KawaiiIslandLandingPage() {
  const [titleVisible, setTitleVisible] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTitleVisible((prev) => !prev);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      setPointer({ x, y });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const islandStyle = useMemo(
    () => ({
      transform: `translate(${pointer.x * 0.45}px, ${pointer.y * 0.28}px)`,
    }),
    [pointer.x, pointer.y]
  );

  const heroStyle = useMemo(
    () => ({
      transform: `translate(${pointer.x * 0.18}px, ${pointer.y * 0.12}px)`,
    }),
    [pointer.x, pointer.y]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#9ed8ff] text-[#8f5f79]">
      <style>{`
        @keyframes floaty {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmerWave {
          0%, 100% { opacity: 0.45; transform: scaleX(1); }
          50% { opacity: 0.75; transform: scaleX(1.04); }
        }
        @keyframes gameZoomIn {
          0% { transform: scale(0.4); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes uiFadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-game-zoom {
          animation: gameZoomIn 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-ui-fade {
          animation: uiFadeIn 2s ease-out 0.8s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_30%),linear-gradient(to_bottom,_#9ed8ff_0%,_#aee5ff_35%,_#76d7f6_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[42vh] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.36),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(to_top,rgba(88,199,236,0.28),transparent)]" />
      <div 
        className="absolute inset-0 z-[1] island-scene-frame animate-game-zoom"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 75%)'
        }}
      >
        <IslandHomepageScene />
      </div>

      <Cloud className="left-[8%] top-[9%] scale-100" />
      <Cloud className="right-[8%] top-[12%] scale-110" />
      <Cloud className="left-[26%] top-[18%] scale-75" />


      <section className="relative z-20 mx-auto flex min-h-screen max-w-[1440px] flex-col items-center px-4 pb-14 pt-7 sm:px-6 animate-ui-fade">

        <div
          className="relative mb-6 w-full max-w-[480px] transition-transform duration-500 ease-out md:mb-4"
          style={heroStyle}
        >
          <div className="relative rounded-[30px] border-[4px] border-[#ffb3d9] bg-[#fffafc] px-5 py-4 text-center shadow-[0_8px_16px_rgba(212,130,170,0.12),inset_0_2px_0_rgba(255,255,255,1)] sm:px-8 md:mt-0 md:px-10 md:py-5">
            <div className="absolute -right-3 -top-4 text-3xl sm:text-4xl" style={{ animation: 'floaty 3s ease-in-out infinite' }}>
              🎀
            </div>
            <div className="absolute -left-3 top-[40%] text-lg sm:text-xl" style={{ animation: 'floaty 2.8s ease-in-out infinite' }}>
              🌸
            </div>
            <div className="absolute -bottom-3 right-5 text-lg sm:text-xl" style={{ animation: 'floaty 3.2s ease-in-out infinite' }}>
              🌸
            </div>

            <div>
              <h1
                className={`text-xl font-black leading-snug tracking-wide text-[#f45fac] drop-shadow-[0_2px_0_rgba(255,255,255,0.8)] transition-all duration-1000 sm:text-2xl md:text-3xl ${
                  titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
                }`}
              >
                Welcome To My Island
              </h1>
              <p
                className={`mt-1.5 text-xs font-bold text-[#967bb6] transition-all duration-1000 sm:text-sm md:mt-2 md:text-base ${
                  titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                Dreamy code, cozy stories, magical projects
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto grid w-full max-w-[1120px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group rounded-[30px] border-[4px] border-[#efd2de] bg-[linear-gradient(180deg,#fff8fc_0%,#fff0f7_100%)] px-4 py-5 shadow-[0_14px_24px_rgba(206,140,171,0.16),inset_0_2px_0_rgba(255,255,255,0.95)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(206,140,171,0.22)] sm:py-6"
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="text-4xl transition group-hover:scale-110">{item.emoji}</div>
                <div className="text-base font-extrabold text-[#8f6b7d] sm:text-lg">{item.label}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-7 rounded-full border-[4px] border-[#efbfd1] bg-[linear-gradient(180deg,#ffe9f2_0%,#ffdbe9_100%)] px-8 py-4 text-center text-base font-black tracking-wide text-[#b45e89] shadow-[0_12px_24px_rgba(226,126,175,0.18),inset_0_2px_0_rgba(255,255,255,0.88)] sm:px-10 sm:text-lg">
          MARISSA CODES ✨ ISLAND EDITION
        </div>
      </section>

    </main>
  );
}

function IslandBackdrop() {
  return (
    <>
      <div className="absolute left-1/2 top-[14%] h-[62rem] w-[86rem] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle_at_50%_48%,_#bce39d_0%,_#acd78c_48%,_#8fd06f_62%,_#f4cce4_63%,_#f4cce4_73%,_#77d9f5_74%,_#53c7ed_100%)] shadow-[0_40px_80px_rgba(44,122,146,0.18)]" />
      <div className="absolute left-1/2 top-[22%] h-[48rem] w-[72rem] -translate-x-1/2 rounded-[48%] bg-[radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.18),transparent_58%)]" />
      <div className="absolute left-[6%] bottom-[8%] h-[18rem] w-[20rem] rounded-[50%] bg-[radial-gradient(circle,_rgba(255,255,255,0.22),_transparent_70%)]" />
      <div className="absolute right-[7%] bottom-[9%] h-[18rem] w-[22rem] rounded-[50%] bg-[radial-gradient(circle,_rgba(255,255,255,0.18),_transparent_70%)]" />
    </>
  );
}

function ShoreWaves() {
  return (
    <>
      <div className="absolute left-[4%] top-[43%] h-[42%] w-[19%] rounded-[55%] border-[3px] border-white/25" style={{ animation: 'shimmerWave 5s ease-in-out infinite' }} />
      <div className="absolute right-[3%] top-[46%] h-[36%] w-[18%] rounded-[55%] border-[3px] border-white/20" style={{ animation: 'shimmerWave 5.6s ease-in-out infinite' }} />
      <div className="absolute left-[10%] bottom-[5%] h-[10%] w-[24%] rounded-full border-[3px] border-white/20" style={{ animation: 'shimmerWave 4.8s ease-in-out infinite' }} />
      <div className="absolute right-[12%] bottom-[7%] h-[11%] w-[25%] rounded-full border-[3px] border-white/20" style={{ animation: 'shimmerWave 4.4s ease-in-out infinite' }} />
    </>
  );
}

function Cloud({ className = '' }) {
  return (
    <div className={`absolute z-0 ${className}`}>
      <div className="relative h-20 w-36 rounded-full bg-white/55 blur-[1px]">
        <div className="absolute -left-2 bottom-2 h-16 w-16 rounded-full bg-white/65" />
        <div className="absolute left-8 -top-3 h-20 w-20 rounded-full bg-white/70" />
        <div className="absolute right-2 top-1 h-14 w-14 rounded-full bg-white/65" />
      </div>
    </div>
  );
}

function House() {
  return (
    <div className="absolute right-[12%] top-[19%] z-10">
      <div className="relative h-[290px] w-[260px]">
        <div className="absolute left-8 top-16 h-[178px] w-[188px] rounded-[36px] border-[5px] border-[#ecd7cf] bg-[linear-gradient(180deg,#ffeefa_0%,#ffdff1_100%)] shadow-[0_18px_28px_rgba(143,95,121,0.12)]" />
        <div className="absolute left-3 top-2 h-[104px] w-[224px] rounded-[40px] border-[5px] border-[#edb8ca] bg-[linear-gradient(180deg,#ffbfd5_0%,#f79ec0_100%)] [clip-path:polygon(8%_100%,50%_0%,92%_100%)] shadow-[0_14px_22px_rgba(221,126,168,0.2)]" />
        <div className="absolute left-[95px] top-[92px] h-[96px] w-[74px] rounded-[30px] border-[4px] border-[#e5a7bd] bg-[linear-gradient(180deg,#ffb5cb_0%,#f68bb3_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.45)]">
          <div className="absolute left-1/2 top-4 h-7 w-7 -translate-x-1/2 rounded-full border-[4px] border-[#ffe3a6] bg-[#8dc9ff]" />
          <div className="absolute right-2 top-1/2 h-3 w-3 rounded-full bg-[#f7b6dd]" />
        </div>
        <div className="absolute left-[40px] top-[102px] h-[58px] w-[44px] rounded-[16px] border-[4px] border-[#e7c6c9] bg-[#b6e1ff]" />
        <div className="absolute right-[48px] top-[102px] h-[58px] w-[44px] rounded-[16px] border-[4px] border-[#e7c6c9] bg-[#b6e1ff]" />
        <div className="absolute left-[37px] top-[96px] h-3 w-[50px] rounded-full bg-[#ffd2e2]" />
        <div className="absolute right-[45px] top-[96px] h-3 w-[50px] rounded-full bg-[#ffd2e2]" />
        <div className="absolute right-[4px] top-[132px] h-[60px] w-[50px] rounded-[14px] border-[4px] border-[#efb8ce] bg-[linear-gradient(180deg,#ffdce9_0%,#ffc4d8_100%)]" />
      </div>
    </div>
  );
}

function HelloShop() {
  return (
    <div className="absolute left-[8%] top-[25%] z-10">
      <div className="relative h-[220px] w-[220px]">
        <div className="absolute left-[30px] top-[56px] h-[120px] w-[126px] rounded-[28px] border-[5px] border-[#e6c6d3] bg-[linear-gradient(180deg,#ffc6da_0%,#ffafd0_100%)]" />
        <div className="absolute left-[20px] top-[26px] h-[80px] w-[146px] rounded-[28px] border-[5px] border-[#edb8ca] bg-[linear-gradient(180deg,#ffbfd5_0%,#f79ec0_100%)] [clip-path:polygon(10%_100%,50%_0%,90%_100%)]" />
        <div className="absolute left-[54px] top-[86px] h-[64px] w-[42px] rounded-[16px] border-[4px] border-[#f4d8e3] bg-[#fff7f9]" />
        <div className="absolute left-[104px] top-[86px] h-[64px] w-[42px] rounded-[16px] border-[4px] border-[#f4d8e3] bg-[#fff7f9]" />
        <div className="absolute left-[42px] top-[6px] text-[88px] leading-none opacity-85">🤍</div>
        <div className="absolute left-[74px] top-[8px] text-4xl">🎀</div>
      </div>
    </div>
  );
}

function Tree({
  className = '',
  fruit = false,
  sakura = false,
  pine = false,
  palm = false,
}) {
  if (pine) {
    return (
      <div className={`absolute z-10 ${className}`}>
        <div className="relative h-[210px] w-[130px]">
          <div className="absolute bottom-0 left-1/2 h-[66px] w-[22px] -translate-x-1/2 rounded-full bg-[#8e5a4f]" />
          <div className="absolute bottom-10 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[60px] border-r-[60px] border-b-[90px] border-l-transparent border-r-transparent border-b-[#5eab67]" />
          <div className="absolute bottom-[58px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[50px] border-r-[50px] border-b-[76px] border-l-transparent border-r-transparent border-b-[#63b96e]" />
          <div className="absolute bottom-[103px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[42px] border-r-[42px] border-b-[68px] border-l-transparent border-r-transparent border-b-[#76ca82]" />
        </div>
      </div>
    );
  }

  if (palm) {
    return (
      <div className={`absolute z-10 ${className}`}>
        <div className="relative h-[220px] w-[140px]">
          <div className="absolute bottom-0 left-1/2 h-[96px] w-[18px] -translate-x-1/2 rounded-full bg-[#a56d54]" />
          <div className="absolute left-[38px] top-[44px] h-[18px] w-[78px] rounded-full bg-[#74cc7e] rotate-[18deg]" />
          <div className="absolute left-[10px] top-[58px] h-[18px] w-[86px] rounded-full bg-[#66c572] -rotate-[16deg]" />
          <div className="absolute left-[48px] top-[66px] h-[18px] w-[76px] rounded-full bg-[#83d88c] rotate-[34deg]" />
          <div className="absolute left-[18px] top-[38px] h-[18px] w-[82px] rounded-full bg-[#87db92] -rotate-[36deg]" />
          <div className="absolute left-[36px] top-[26px] h-[20px] w-[72px] rounded-full bg-[#8ae094]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute z-10 ${className}`}>
      <div className="relative h-[220px] w-[150px]">
        <div className="absolute bottom-0 left-1/2 h-[78px] w-[26px] -translate-x-1/2 rounded-full bg-[#935f4f]" />
        <div
          className={`absolute left-1/2 top-0 h-[120px] w-[120px] -translate-x-1/2 rounded-full border-[4px] ${
            sakura
              ? 'border-[#f3c8d8] bg-[radial-gradient(circle_at_40%_30%,#fff6fa_0%,#ffdce9_35%,#ffc2d8_100%)]'
              : 'border-[#93ca7f] bg-[radial-gradient(circle_at_40%_30%,#e2ffd3_0%,#a7df84_55%,#7bc65b_100%)]'
          }`}
        />
        <div
          className={`absolute left-[16px] top-[38px] h-[98px] w-[98px] rounded-full border-[4px] ${
            sakura
              ? 'border-[#f3c8d8] bg-[radial-gradient(circle_at_40%_30%,#fff6fa_0%,#ffdce9_35%,#ffc2d8_100%)]'
              : 'border-[#93ca7f] bg-[radial-gradient(circle_at_40%_30%,#e2ffd3_0%,#a7df84_55%,#7bc65b_100%)]'
          }`}
        />
        <div
          className={`absolute right-[14px] top-[42px] h-[94px] w-[94px] rounded-full border-[4px] ${
            sakura
              ? 'border-[#f3c8d8] bg-[radial-gradient(circle_at_40%_30%,#fff6fa_0%,#ffdce9_35%,#ffc2d8_100%)]'
              : 'border-[#93ca7f] bg-[radial-gradient(circle_at_40%_30%,#e2ffd3_0%,#a7df84_55%,#7bc65b_100%)]'
          }`}
        />
        {fruit && (
          <>
            <div className="absolute left-5 top-[66px] h-8 w-8 rounded-full border-[3px] border-[#d272aa] bg-[#f49bcb]" />
            <div className="absolute right-7 top-[78px] h-8 w-8 rounded-full border-[3px] border-[#d272aa] bg-[#f49bcb]" />
            <div className="absolute left-1/2 top-[32px] h-8 w-8 -translate-x-1/2 rounded-full border-[3px] border-[#d272aa] bg-[#f49bcb]" />
          </>
        )}
        {sakura && (
          <>
            <div className="absolute left-8 top-[74px] text-xl">🌸</div>
            <div className="absolute right-8 top-[64px] text-xl">🌸</div>
            <div className="absolute left-1/2 top-[26px] -translate-x-1/2 text-xl">🌸</div>
          </>
        )}
      </div>
    </div>
  );
}

function FlowerPatch({ className = '' }) {
  return (
    <div className={`absolute z-10 flex gap-2 ${className}`}>
      {['🌷', '🌸', '🌼', '🌷'].map((flower, index) => (
        <span key={`${flower}-${index}`} className="text-2xl drop-shadow-[0_2px_0_rgba(255,255,255,0.5)]">
          {flower}
        </span>
      ))}
    </div>
  );
}

function SignPost() {
  const signs = ['ABOUT', 'PROJECTS', 'READING', 'BLOG'];
  const colors = ['#ffb7cb', '#cda7ff', '#d3f2d5', '#cfb6ff'];

  return (
    <div className="absolute left-[7%] top-[49%] z-20">
      <div className="relative h-[230px] w-[170px]">
        <div className="absolute bottom-0 left-10 h-[170px] w-6 rounded-full bg-[#9d704f]" />
        {signs.map((label, i) => (
          <div
            key={label}
            className="absolute left-0 flex h-[48px] w-[150px] items-center rounded-[18px] border-[4px] border-[#e6b6bf] px-5 text-xl font-black text-white shadow-[0_8px_16px_rgba(143,95,121,0.15)]"
            style={{
              top: `${i * 42}px`,
              background: colors[i],
              clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%, 10% 50%)',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bench() {
  return (
    <div className="absolute left-[38%] top-[56%] z-10">
      <div className="relative h-[120px] w-[150px]">
        <div className="absolute left-4 top-7 h-[52px] w-[110px] rounded-[18px] border-[4px] border-[#e8b3c8] bg-[#ffcee1]" />
        <div className="absolute left-7 top-[54px] h-[18px] w-[96px] rounded-full bg-[#94d66e]" />
        <div className="absolute left-[26px] bottom-0 h-[42px] w-[10px] rounded-full bg-[#fff7f1]" />
        <div className="absolute right-[26px] bottom-0 h-[42px] w-[10px] rounded-full bg-[#fff7f1]" />
        <div className="absolute left-[63px] top-10 text-xl">💚</div>
      </div>
    </div>
  );
}

function Mailbox() {
  return (
    <div className="absolute right-[19%] top-[54%] z-10">
      <div className="relative h-[118px] w-[90px]">
        <div className="absolute bottom-0 left-1/2 h-[52px] w-[12px] -translate-x-1/2 rounded-full bg-[#d28698]" />
        <div className="absolute left-3 top-6 h-[58px] w-[54px] rounded-[18px] border-[4px] border-[#e9b1c7] bg-[linear-gradient(180deg,#ffcedf_0%,#f8a9c5_100%)]" />
        <div className="absolute left-[26px] top-[36px] text-2xl">💌</div>
        <div className="absolute left-[12px] top-3 h-6 w-[42px] rounded-full bg-[#ffdfeb]" />
      </div>
    </div>
  );
}

function Dock() {
  return (
    <div className="absolute bottom-[8%] right-[15%] z-10 rotate-[6deg]">
      <div className="relative h-[140px] w-[190px]">
        <div className="absolute bottom-[22px] left-[18px] h-[18px] w-[140px] rounded-sm bg-[#b57c53]" />
        <div className="absolute bottom-[42px] left-[26px] h-[18px] w-[126px] rounded-sm bg-[#c48859]" />
        <div className="absolute bottom-[62px] left-[34px] h-[18px] w-[114px] rounded-sm bg-[#d59663]" />
        <div className="absolute bottom-0 left-[26px] h-[56px] w-[14px] rounded-full bg-[#9b6a4d]" />
        <div className="absolute bottom-0 left-[126px] h-[56px] w-[14px] rounded-full bg-[#9b6a4d]" />
      </div>
    </div>
  );
}

function Boat() {
  return (
    <div className="absolute left-[2%] top-[50%] z-10 rotate-[-8deg]">
      <div className="relative h-[100px] w-[140px]">
        <div className="absolute bottom-0 h-[40px] w-[130px] rounded-[20px] border-[4px] border-[#e5b4c7] bg-[#ffa9c7] [clip-path:polygon(10%_0,100%_0,88%_100%,0_100%)]" />
        <div className="absolute left-[32px] top-[18px] h-[30px] w-[52px] rounded-[12px] border-[4px] border-[#efc2d1] bg-[#fff6ef]" />
      </div>
    </div>
  );
}

function UmbrellaSeat() {
  return (
    <div className="absolute bottom-[12%] right-[5%] z-10">
      <div className="relative h-[170px] w-[150px]">
        <div className="absolute bottom-0 right-0 h-[34px] w-[82px] rounded-[18px] border-[4px] border-[#edd7df] bg-[repeating-linear-gradient(90deg,#ffd5e5_0px,#ffd5e5_14px,#fff5f9_14px,#fff5f9_28px)]" />
        <div className="absolute bottom-[28px] right-[56px] h-[70px] w-[8px] rounded-full bg-[#c8a37c]" />
        <div className="absolute bottom-[86px] right-[24px] h-[44px] w-[84px] rounded-t-full border-[4px] border-[#f1cad9] bg-[repeating-linear-gradient(90deg,#fff8fb_0px,#fff8fb_14px,#ffd6e8_14px,#ffd6e8_28px)]" />
      </div>
    </div>
  );
}

function PalmLeaves() {
  return (
    <>
      <div className="absolute left-[63%] top-[20%] z-10 text-4xl opacity-90">🌴</div>
      <div className="absolute right-[24%] top-[19%] z-10 text-4xl opacity-90">🌴</div>
    </>
  );
}

function Path() {
  return (
    <>
      {PATH_STONES.map((pos, index) => (
        <div
          key={`${pos}-${index}`}
          className={`absolute z-10 h-7 w-12 rounded-full border-[3px] border-[#dfd0bd] bg-[#efe4d1] shadow-[0_5px_8px_rgba(150,120,90,0.08)] ${pos}`}
        />
      ))}
    </>
  );
}

function ShoreDecor() {
  return (
    <>
      <div className="absolute bottom-[8%] left-[8%] z-10 text-3xl">🐚</div>
      <div className="absolute bottom-[10%] left-[28%] z-10 text-3xl">🌸</div>
      <div className="absolute bottom-[7%] left-[58%] z-10 text-3xl">💖</div>
      <div className="absolute bottom-[11%] right-[30%] z-10 text-3xl">💗</div>
      <div className="absolute bottom-[13%] right-[9%] z-10 text-3xl">🐚</div>
      <div className="absolute bottom-[14%] left-[70%] z-10 text-2xl">🪸</div>
      <div className="absolute left-[60%] bottom-[16%] z-10 text-3xl">🦀</div>
    </>
  );
}

function Character() {
  return (
    <div className="absolute right-[11%] top-[47%] z-20" style={{ animation: 'floaty 3.6s ease-in-out infinite' }}>
      <div className="relative h-[190px] w-[130px]">
        <div className="absolute left-1/2 top-0 h-[92px] w-[92px] -translate-x-1/2 rounded-full border-[5px] border-[#f0e4de] bg-[#fffaf6]" />
        <div className="absolute left-[18px] top-[10px] h-8 w-8 rotate-[-18deg] rounded-[10px] border-[4px] border-[#f0e4de] bg-[#fffaf6]" />
        <div className="absolute right-[18px] top-[10px] h-8 w-8 rotate-[18deg] rounded-[10px] border-[4px] border-[#f0e4de] bg-[#fffaf6]" />
        <div className="absolute right-[22px] top-[6px] text-4xl">🎀</div>
        <div className="absolute left-[44px] top-[42px] h-2 w-2 rounded-full bg-[#4d4051]" />
        <div className="absolute right-[44px] top-[42px] h-2 w-2 rounded-full bg-[#4d4051]" />
        <div className="absolute left-1/2 top-[50px] h-3 w-4 -translate-x-1/2 rounded-full bg-[#f4a6d1]" />
        <div className="absolute left-[20px] top-[42px] h-[2px] w-5 bg-[#4d4051]" />
        <div className="absolute left-[16px] top-[52px] h-[2px] w-6 bg-[#4d4051]" />
        <div className="absolute left-[20px] top-[62px] h-[2px] w-5 bg-[#4d4051]" />
        <div className="absolute right-[20px] top-[42px] h-[2px] w-5 bg-[#4d4051]" />
        <div className="absolute right-[16px] top-[52px] h-[2px] w-6 bg-[#4d4051]" />
        <div className="absolute right-[20px] top-[62px] h-[2px] w-5 bg-[#4d4051]" />
        <div className="absolute left-1/2 top-[80px] h-[82px] w-[70px] -translate-x-1/2 rounded-[24px] border-[4px] border-[#e9b2ca] bg-[linear-gradient(180deg,#ffc8dc_0%,#f3a7c8_100%)]" />
        <div className="absolute left-[34px] top-[104px] text-xl">💛</div>
        <div className="absolute left-[32px] bottom-0 h-[34px] w-[14px] rounded-full bg-[#fffaf6]" />
        <div className="absolute right-[32px] bottom-0 h-[34px] w-[14px] rounded-full bg-[#fffaf6]" />
        <div className="absolute left-[8px] top-[96px] h-[18px] w-[28px] rounded-full bg-[#fffaf6]" />
        <div className="absolute right-[8px] top-[96px] h-[18px] w-[28px] rounded-full bg-[#fffaf6]" />
      </div>
    </div>
  );
}

export function runSmokeTests() {
  const results = [];

  function assert(condition, message) {
    if (!condition) {
      throw new Error(`Smoke test failed: ${message}`);
    }
    results.push(`✓ ${message}`);
  }

  assert(MENU_ITEMS.length === 7, 'renders 7 menu items');
  assert(PATH_STONES.length === 6, 'renders 6 path stones');
  assert(FLOWER_PATCHES.length === 6, 'renders 6 flower patches');
  assert(MENU_ITEMS.some((item) => item.label === 'Projects'), 'includes a "Projects" menu item');
  assert(MENU_ITEMS[0].label === 'About', 'starts menu with "About"');

  return results;
}
