import loadFlickity from '../../scripts/flickity-loader.js';

function text(cell) {
  return cell?.textContent.trim() || '';
}

function link(cell) {
  const anchor = cell?.querySelector('a');
  return anchor?.href || text(cell);
}

function image(cell, fallbackAlt = '') {
  const img = cell?.querySelector('img');
  if (img) return { src: img.src, alt: img.alt || fallbackAlt };
  const value = text(cell);
  return value ? { src: value, alt: fallbackAlt } : null;
}

function normalizeRows(block) {
  const rows = [...block.children];
  const firstLabel = text(rows[0]?.children[0]).toLowerCase();
  return firstLabel === 'image' || firstLabel === 'desktop image' ? rows.slice(1) : rows;
}

function createSlide(row, index) {
  const cells = [...row.children];
  const title = text(cells[3]) || text(cells[2]);
  const desktopImage = image(cells[0], title);
  const mobileImage = image(cells[1], title);
  const eyebrow = text(cells[2]);
  const description = text(cells[4]);
  const ctaText = text(cells[5]);
  const ctaLink = link(cells[6]);
  const target = text(cells[7]);

  const slide = document.createElement(ctaLink ? 'a' : 'article');
  slide.className = 'hero-carousel-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1}`);
  if (ctaLink) {
    slide.href = ctaLink;
    if (target) {
      slide.target = target;
      if (target === '_blank') slide.rel = 'noopener noreferrer';
    }
  }

  if (desktopImage) {
    const picture = document.createElement('picture');
    if (mobileImage) {
      const source = document.createElement('source');
      source.media = '(max-width: 600px)';
      source.srcset = mobileImage.src;
      picture.append(source);
    }
    const img = document.createElement('img');
    img.src = desktopImage.src;
    img.alt = desktopImage.alt;
    img.loading = index === 0 ? 'eager' : 'lazy';
    img.fetchPriority = index === 0 ? 'high' : 'auto';
    img.addEventListener('error', () => picture.remove());
    picture.append(img);
    slide.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'hero-carousel-content';

  if (eyebrow && eyebrow !== title) {
    const label = document.createElement('p');
    label.className = 'hero-carousel-eyebrow';
    label.textContent = eyebrow;
    content.append(label);
  }

  if (title) {
    const heading = document.createElement('h1');
    heading.textContent = title;
    content.append(heading);
  }

  if (description) {
    const copy = document.createElement('p');
    copy.className = 'hero-carousel-description';
    copy.textContent = description;
    content.append(copy);
  }

  if (ctaText) {
    const cta = document.createElement('span');
    cta.className = 'hero-carousel-cta';
    cta.textContent = ctaText;
    content.append(cta);
  }

  slide.append(content);
  return slide;
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.hero-carousel-slide')];
  const dots = [...block.querySelectorAll('.hero-carousel-dot')];
  const nextIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.hidden = slideIndex !== nextIndex;
    slide.setAttribute('aria-hidden', slideIndex === nextIndex ? 'false' : 'true');
  });
  dots.forEach((dot, dotIndex) => {
    dot.setAttribute('aria-current', dotIndex === nextIndex ? 'true' : 'false');
  });
  block.dataset.activeSlide = String(nextIndex);
}

function initFallbackControls(block, slides) {
  if (slides.length <= 1) return;

  const controls = document.createElement('div');
  controls.className = 'hero-carousel-controls';

  const previous = document.createElement('button');
  previous.className = 'hero-carousel-arrow hero-carousel-arrow-prev';
  previous.type = 'button';
  previous.setAttribute('aria-label', 'Previous slide');
  previous.textContent = '<';
  previous.addEventListener('click', () => setActive(block, Number(block.dataset.activeSlide) - 1));
  block.append(previous);

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'hero-carousel-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show slide ${index + 1}`);
    dot.addEventListener('click', () => setActive(block, index));
    controls.append(dot);
  });

  block.append(controls);

  const next = document.createElement('button');
  next.className = 'hero-carousel-arrow hero-carousel-arrow-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next slide');
  next.textContent = '>';
  next.addEventListener('click', () => setActive(block, Number(block.dataset.activeSlide) + 1));
  block.append(next);
}

function initFlickity(block, viewport) {
  loadFlickity()
    .then((Flickity) => {
      block.classList.add('flickity-enabled-block');
      [...viewport.children].forEach((slide) => {
        slide.hidden = false;
        slide.removeAttribute('aria-hidden');
      });
      // eslint-disable-next-line no-new
      new Flickity(viewport, {
        adaptiveHeight: false,
        autoPlay: 5000,
        cellAlign: 'left',
        contain: true,
        imagesLoaded: true,
        pageDots: true,
        pauseAutoPlayOnHover: true,
        prevNextButtons: true,
        wrapAround: true,
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.warn('Flickity failed for hero carousel', error);
    });
}

export default function decorate(block) {
  const rows = normalizeRows(block);
  const slides = rows.map(createSlide).filter((slide) => slide.querySelector('picture'));

  block.dataset.activeSlide = '0';

  const viewport = document.createElement('div');
  viewport.className = 'hero-carousel-viewport';
  slides.forEach((slide) => viewport.append(slide));
  block.replaceChildren(viewport);

  setActive(block, 0);
  initFallbackControls(block, slides);
  initFlickity(block, viewport);
}
