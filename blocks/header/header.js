import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function fallbackItems() {
  return [
    { text: 'KrisShop', href: '/' },
    { text: 'Travel', href: '/en/category/travel' },
    { text: 'Promotions', href: '/en/promotions' },
    { text: 'Brands', href: '/en/brands' },
    { text: 'Search', href: '/en/search' },
    { text: 'Cart', href: '/en/cart' },
  ];
}

function normalizeHref(value) {
  return value || '#';
}

function getCellItem(row) {
  const cells = [...row.children];
  if (cells.length < 2) return null;
  const label = cells[0].textContent.trim();
  const anchor = cells[1].querySelector('a');
  const href = anchor?.href || cells[1].textContent.trim();
  if (!label) return null;
  return { text: label, href: normalizeHref(href) };
}

function getLineItems(fragment) {
  const lines = fragment.textContent
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];
  for (let i = 0; i < lines.length; i += 1) {
    const label = lines[i];
    const next = lines[i + 1] || '';
    if (next.startsWith('/') || next.startsWith('http')) {
      items.push({ text: label, href: normalizeHref(next) });
      i += 1;
    }
  }
  return items;
}

function getNavItems(fragment) {
  const tableItems = [...fragment.querySelectorAll('tr')]
    .map(getCellItem)
    .filter(Boolean);
  if (tableItems.length) return tableItems;

  const links = [...fragment.querySelectorAll('a[href]')]
    .map((anchor) => ({ text: anchor.textContent.trim(), href: anchor.href }))
    .filter((item) => item.text);
  if (links.length) return links;

  const lineItems = getLineItems(fragment);
  return lineItems.length ? lineItems : fallbackItems();
}

function createLink(item) {
  const link = document.createElement('a');
  link.href = item.href;
  link.textContent = item.text;
  return link;
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

function buildNav(items) {
  const [brandItem, ...rest] = items;
  const tools = rest.filter((item) => ['search', 'cart', 'bag'].includes(item.text.toLowerCase()));
  const sections = rest.filter((item) => !tools.includes(item));

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandP = document.createElement('p');
  brandP.append(createLink(brandItem || fallbackItems()[0]));
  brand.append(brandP);

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';
  const list = document.createElement('ul');
  sections.forEach((item) => {
    const li = document.createElement('li');
    li.append(createLink(item));
    list.append(li);
  });
  wrapper.append(list);
  navSections.append(wrapper);

  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  const toolsP = document.createElement('p');
  (tools.length ? tools : [{ text: 'Search', href: '/en/search' }]).forEach((item) => {
    toolsP.append(createLink(item), document.createTextNode(' '));
  });
  navTools.append(toolsP);

  nav.append(hamburger, brand, navSections, navTools);
  return nav;
}

/**
 * loads and decorates the header.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const nav = buildNav(getNavItems(fragment));

  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));
  toggleMenu(nav, isDesktop.matches);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
