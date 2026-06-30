import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

const DEFAULT_CONFIG = {
  logo: 'KrisShop',
  logoImageDesktop: '',
  logoImageMobile: '',
  home: '/',
  segment: 'Non-Travellers',
  search: '/en/search',
  cart: '/en/cart',
  account: '/en/account',
};

const DEFAULT_NAV = [
  { text: 'CATEGORIES', href: '/en/category' },
  { text: 'BRANDS', href: '/en/brands' },
  { text: 'DEALS', href: '/en/promotions' },
  { text: 'BATIK LABEL', href: '/en/batik-label' },
  { text: 'NEW ARRIVALS', href: '/en/new-arrivals' },
];

const KEY_ALIASES = {
  logo: 'logo',
  brand: 'logo',
  'logo image': 'logoImageDesktop',
  'logo image desktop': 'logoImageDesktop',
  'logo image mobile': 'logoImageMobile',
  home: 'home',
  segment: 'segment',
  search: 'search',
  cart: 'cart',
  bag: 'cart',
  account: 'account',
};

const MENU_LABELS = new Set([
  'categories',
  'category',
  'brands',
  'brand',
  'deals',
  'promotions',
  'batik label',
  'new arrivals',
  'travel',
  'sale',
]);

function normalizeHref(value) {
  const href = value?.trim();
  return href || '#';
}

function getCellText(cell) {
  return cell.textContent.trim().replace(/\s+/g, ' ');
}

function getCellValue(cell) {
  const anchor = cell.querySelector('a[href]');
  return normalizeHref(anchor ? anchor.getAttribute('href') : getCellText(cell));
}

function getRows(fragment) {
  return [...fragment.querySelectorAll('tr')]
    .map((row) => [...row.children].map((cell) => ({
      text: getCellText(cell),
      value: getCellValue(cell),
    })))
    .filter((cells) => cells.length >= 2 && cells[0].text);
}

function getLineRows(fragment) {
  const lines = fragment.textContent
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];
  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i] && lines[i + 1]) {
      rows.push([{ text: lines[i], value: lines[i] }, { text: lines[i + 1], value: lines[i + 1] }]);
    }
  }
  return rows;
}

function parseNav(fragment) {
  const rows = getRows(fragment);
  const sourceRows = rows.length ? rows : getLineRows(fragment);
  const config = { ...DEFAULT_CONFIG };
  const navItems = [];

  sourceRows.forEach((row) => {
    const [labelCell, valueCell] = row;
    const { text: label } = labelCell;
    const { value } = valueCell;
    const normalized = label.toLowerCase();
    const configKey = KEY_ALIASES[normalized];

    if (configKey) {
      config[configKey] = value;
      return;
    }

    if (MENU_LABELS.has(normalized)) {
      navItems.push({ text: label.toUpperCase(), href: normalizeHref(value) });
    }
  });

  return {
    config,
    navItems: navItems.length ? navItems : DEFAULT_NAV,
  };
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createLink(item, className) {
  const link = createElement('a', className, item.text);
  link.href = normalizeHref(item.href);
  return link;
}

function createIconLink(href, className, label) {
  const link = createElement('a', `ks-icon-link ${className}`);
  link.href = normalizeHref(href);
  link.setAttribute('aria-label', label);
  link.title = label;
  return link;
}

function buildMainHeader(config, navItems) {
  const nav = createElement('nav', 'ks-header-main');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  const hamburger = createElement('div', 'nav-hamburger');
  const hamburgerButton = createElement('button');
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  hamburgerButton.append(createElement('span', 'nav-hamburger-icon'));
  hamburger.append(hamburgerButton);

  const brand = createElement('div', 'nav-brand');
  const logoLink = createLink({ text: config.logoImageDesktop ? '' : config.logo, href: config.home }, 'ks-logo');
  if (config.logoImageDesktop) {
    const picture = createElement('picture');
    if (config.logoImageMobile) {
      const mobileSource = createElement('source');
      mobileSource.media = '(max-width: 899px)';
      mobileSource.srcset = config.logoImageMobile;
      picture.append(mobileSource);
    }
    const image = createElement('img');
    image.src = config.logoImageDesktop;
    image.alt = config.logo;
    image.loading = 'eager';
    picture.append(image);
    logoLink.append(picture);
  }
  brand.append(logoLink);

  const segment = createElement('button', 'ks-segment-select');
  segment.type = 'button';
  segment.textContent = config.segment;

  const navSections = createElement('div', 'nav-sections');
  const list = createElement('ul');
  navItems.forEach((item) => {
    const li = createElement('li');
    li.append(createLink(item));
    list.append(li);
  });
  navSections.append(list);

  const navTools = createElement('div', 'nav-tools');
  const searchForm = createElement('form', 'ks-search-form');
  searchForm.action = normalizeHref(config.search);
  searchForm.role = 'search';

  const searchInput = createElement('input', 'ks-search-input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = 'SEARCH';
  searchInput.setAttribute('aria-label', 'Search');

  const searchButton = createElement('button', 'ks-search-button');
  searchButton.type = 'submit';
  searchButton.setAttribute('aria-label', 'Search');
  searchForm.append(searchInput, searchButton);

  navTools.append(
    searchForm,
    createIconLink(config.cart, 'ks-cart-link', 'Shopping bag'),
    createIconLink(config.account, 'ks-account-link', 'Account'),
  );

  nav.append(hamburger, brand, segment, navSections, navTools);
  return nav;
}

function setMenuState(nav, expanded) {
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

function buildHeader(config, navItems) {
  const wrapper = createElement('div', 'nav-wrapper ks-header');
  const nav = buildMainHeader(config, navItems);
  nav.querySelector('.nav-hamburger button').addEventListener('click', () => {
    setMenuState(nav, nav.getAttribute('aria-expanded') !== 'true');
  });

  isDesktop.addEventListener('change', () => setMenuState(nav, false));
  wrapper.append(nav);
  return wrapper;
}

/**
 * Loads and decorates the header.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const { config, navItems } = parseNav(fragment);

  block.replaceChildren(buildHeader(config, navItems));
}
