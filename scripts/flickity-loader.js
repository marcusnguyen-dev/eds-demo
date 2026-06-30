import { loadCSS, loadScript } from './aem.js';

const FLICKITY_CSS = 'https://unpkg.com/flickity@2/dist/flickity.min.css';
const FLICKITY_JS = 'https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js';

let flickityPromise;

export default async function loadFlickity() {
  if (window.Flickity) return window.Flickity;

  if (!flickityPromise) {
    flickityPromise = Promise.all([
      loadCSS(FLICKITY_CSS),
      loadScript(FLICKITY_JS),
    ]).then(() => {
      if (!window.Flickity) throw new Error('Flickity did not initialize');
      return window.Flickity;
    });
  }

  return flickityPromise;
}
