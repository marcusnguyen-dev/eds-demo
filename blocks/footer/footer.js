import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function fallbackItems() {
  return [
    { text: 'KrisShop', href: '/' },
    { text: 'Help', href: '/en/help' },
    { text: 'Contact us', href: '/en/contact-us' },
    { text: 'Privacy', href: '/en/privacy' },
  ];
}

function getItems(fragment) {
  const tableItems = [...fragment.querySelectorAll('tr')]
    .map((row) => {
      const cells = [...row.children];
      if (cells.length < 2) return null;
      const text = cells[0].textContent.trim();
      const href = cells[1].querySelector('a')?.href || cells[1].textContent.trim();
      return text ? { text, href: href || '#' } : null;
    })
    .filter(Boolean);
  if (tableItems.length) return tableItems;

  const links = [...fragment.querySelectorAll('a[href]')]
    .map((anchor) => ({ text: anchor.textContent.trim(), href: anchor.href }))
    .filter((item) => item.text);
  return links.length ? links : fallbackItems();
}

function createLink(item) {
  const link = document.createElement('a');
  link.href = item.href;
  link.textContent = item.text;
  return link;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  const items = getItems(fragment);
  const brand = items[0] || fallbackItems()[0];
  const brandP = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = brand.text;
  brandP.append(strong);

  const linksP = document.createElement('p');
  items.slice(1).forEach((item, index) => {
    if (index) linksP.append(document.createTextNode(' / '));
    linksP.append(createLink(item));
  });

  const copyright = document.createElement('p');
  copyright.textContent = 'Copyright 2026 KrisShop.';

  footer.append(brandP, linksP, copyright);

  block.append(footer);
}
