import React from 'react';

type Audience = 'player' | 'coach';

interface HowItWorksSectionProps {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ audience, setAudience }) => {
  // Mobile slider state for dots/active card
  const mobileContainerRef = React.useRef<HTMLDivElement | null>(null);
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    const el = mobileContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      // Determine the card whose center is closest to container center
      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const rectLeft = card.offsetLeft;
        const rectCenter = rectLeft + card.clientWidth / 2;
        const d = Math.abs(rectCenter - containerCenter);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActiveIdx(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // Initialize
    onScroll();
    return () => el.removeEventListener('scroll', onScroll as any);
  }, [audience]);

  // Step emojis
  const playerEmoji = ['🖊', '📱', '📤', '🤴'];
  const coachEmoji = ['🖊', '🧰', '🖥', '🏆'];

  // Card renderers: mobile slider + desktop grid
  const renderCardsMobile = (items: { title: string; subtitle?: string }[], emojiList: string[]) => (
    <>
      <div
        ref={mobileContainerRef}
        className="md:hidden w-full pl-4 pr-4 pb-2 overflow-x-auto flex flex-nowrap gap-4 snap-x snap-mandatory scroll-smooth mb-3"
        style={{ WebkitOverflowScrolling: 'touch' as any, scrollPaddingLeft: '1rem', touchAction: 'pan-x' as any }}
      >
        {items.map((it, idx) => (
          <div
            key={idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            className="shrink-0 w-[80%] h-72 snap-center bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex flex-col items-center text-center justify-start"
          >
          <div className="h-1.5 w-full rounded mb-4 bg-gradient-to-r from-cyan-500 to-teal-600" />
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-5xl mb-3" aria-hidden>
              {emojiList[idx] || '✅'}
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 mb-2">
              {idx + 1}
            </span>
            <div className="text-cyan-700 font-semibold text-lg mb-1">{it.title}</div>
            {it.subtitle && <p className="text-sm text-gray-600 leading-relaxed">{it.subtitle}</p>}
          </div>
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="md:hidden flex justify-center gap-2 mb-8">
        {items.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === activeIdx ? 'bg-cyan-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </>
  );

  const renderCardsDesktop = (items: { title: string; subtitle?: string }[], emojiList: string[]) => (
    <div className="hidden md:grid grid-cols-4 gap-8 mb-8">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 min-h-[260px] flex flex-col items-center text-center justify-start"
        >
          <div className="h-1.5 w-full rounded mb-4 bg-gradient-to-r from-cyan-500 to-teal-600" />
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-4xl mb-3" aria-hidden>{emojiList[idx] || '🟦'}</div>
            <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full bg-teal-100 text-teal-800 mb-2">
              {idx + 1}
            </span>
            <div className="text-teal-700 font-semibold text-lg mb-1">{it.title}</div>
            {it.subtitle && <p className="text-sm text-gray-600 leading-relaxed">{it.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  const playerItems = [
    { title: 'Sign Up', subtitle: 'Pick a plan' },
    { title: 'Download the App', subtitle: 'iOS today; Android soon' },
    { title: 'Upload Video', subtitle: 'Chest-high, live swing' },
    { title: 'Get Results', subtitle: 'Fixes + drills in 72 hrs' },
  ];

  const coachItems = [
    { title: 'Sign Up', subtitle: '(Free)' },
    { title: 'Build Your Team', subtitle: 'Add your players; get portal players.' },
    { title: 'Coach', subtitle: 'Make analysis with our web‑based tools.' },
    { title: 'See Results', subtitle: 'Players get feedback and a focus plan in their app.' },
  ];

  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-10">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <div className="inline-flex items-center rounded-full bg-gray-100 p-1 self-start md:self-auto" role="tablist" aria-label="Audience toggle">
            <button
              type="button"
              onClick={() => setAudience('player')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                audience === 'player' ? 'bg-white text-teal-800 shadow' : 'text-gray-700'
              }`}
              aria-pressed={audience === 'player'}
              role="tab"
            >
              Players
            </button>
            <button
              type="button"
              onClick={() => setAudience('coach')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                audience === 'coach' ? 'bg-white text-teal-800 shadow' : 'text-gray-700'
              }`}
              aria-pressed={audience === 'coach'}
              role="tab"
            >
              Coaches
            </button>
          </div>
        </div>

        {audience === 'player'
          ? renderCardsMobile(playerItems, playerEmoji)
          : renderCardsMobile(coachItems, coachEmoji)}
        {audience === 'player'
          ? renderCardsDesktop(playerItems, playerEmoji)
          : renderCardsDesktop(coachItems, coachEmoji)}

        {audience === 'player' && (
          <div className="bg-gray-50 rounded-xl p-5 max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-xl" role="img" aria-label="phone">📱</span>
              <span className="text-sm font-semibold text-gray-700">Currently Available for iPhone</span>
            </div>
            <p className="text-center text-gray-600 text-sm">Android version coming soon.</p>
          </div>
        )}

        {audience === 'coach' && (
          <div className="bg-gray-50 rounded-xl p-5 max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-xl" role="img" aria-label="laptop">💻</span>
              <span className="text-sm font-semibold text-gray-700">Coach on your terms</span>
            </div>
            <p className="text-gray-600 text-sm">
              Our easy‑to‑learn, web‑based analyzer runs in your browser so you can coach at your convenience from a good laptop or desktop.
              We offer free training to make your targeted feedback as useful as possible — even new coaches will help hitters improve.
              Coaches earn up to 90%. More details after you sign up.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorksSection;
