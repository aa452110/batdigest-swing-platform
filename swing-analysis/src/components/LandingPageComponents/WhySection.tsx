import React from 'react';

type Audience = 'player' | 'coach';

const WhySection: React.FC<{ audience?: Audience }> = ({ audience = 'player' }) => {
  // Simple quote rotator (click dots or swipe on mobile)
  const quotes = React.useMemo(
    () => [
      { text: '“The difference wasn’t the bat—it was understanding the swing.”', author: '— Parent' },
      { text: '“Simple feedback. Clear fixes. Real results.”', author: '— Coach' },
      { text: '“Frame‑by‑frame showed exactly what to work on.”', author: '— Parent' },
      { text: '“I can coach from anywhere and keep players progressing.”', author: '— Coach' },
      { text: '“Drills matched to the swing made all the difference.”', author: '— Parent' },
    ],
    []
  );
  const [idx, setIdx] = React.useState(0);
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const startX = React.useRef<number | null>(null);

  const clamp = (i: number) => (i + quotes.length) % quotes.length;
  const next = () => setIdx((i) => clamp(i + 1));
  const prev = () => setIdx((i) => clamp(i - 1));

  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(dx) > 30) {
        if (dx < 0) next(); else prev();
      }
      startX.current = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [quotes.length]);
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center md:text-left">Why Swing Shop</h2>
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          {/* Left: Bullets */}
          <div>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bats don’t hit bombs—mechanics do.</li>
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Frame‑by‑frame breakdowns to your phone show exactly what to work on.</li>
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Drills tailored to your swing.</li>
              <li className="flex items-start gap-3"><span className="text-cyan-600 mt-1">✓</span> Bring your current coach or get matched with one of ours.</li>
            </ul>
          </div>
          {/* Right: Rotating Quote */}
          <div ref={boxRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center text-center md:text-left select-none">
            <p className="text-gray-800 italic mb-3 transition-opacity duration-200">{quotes[idx].text}</p>
            <div className="font-semibold text-gray-700 mb-3">{quotes[idx].author}</div>
            <div className="flex gap-2 items-center md:justify-start justify-center">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show quote ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full ${i === idx ? 'bg-cyan-600' : 'bg-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-400`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
