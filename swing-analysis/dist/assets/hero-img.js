(function(){
  function swapHeroToImage(){
    try {
      // Find the hero section by its distinctive heading text
      const h1s = Array.from(document.querySelectorAll('h1'));
      const heading = h1s.find(h => (h.textContent||'').includes('The Mechanics, Not the Metal.'));
      if (!heading) return false;
      const section = heading.closest('section');
      if (!section) return false;
      // Find the right-hand card container in the hero
      const card = section.querySelector('.bg-white.rounded-xl');
      if (!card) return false;
      const container = card.querySelector('.aspect-video');
      if (!container) return false;

      // Replace the inner content with an image
      const img = new Image();
      // Image placed under dist/public, served at /public/...
      img.src = '/public/swing_analysis_feature_image.png';
      img.alt = 'Swing Analysis Feature';
      img.style.display = 'block';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.className = 'rounded-lg';

      container.innerHTML = '';
      container.classList.remove('bg-gray-100','flex','items-center','justify-center');
      container.appendChild(img);
      return true;
    } catch (e) { return false; }
  }

  // Try immediately, then a few retries as React hydrates
  if (!swapHeroToImage()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (swapHeroToImage() || attempts > 20) clearInterval(timer);
    }, 150);
  }
})();

