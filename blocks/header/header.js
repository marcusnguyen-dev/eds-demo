import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

const DEFAULT_CONFIG = {
  logo: 'KrisShop',
  logoImageDesktop: '',
  logoImageMobile: '',
  home: '/',
  segment: 'Non-Travellers',
  traveller: 'Travellers',
  travellerDesc: 'Shop tax and duty-free with a Singapore Airlines/Scoot flight booking.',
  nonTraveller: 'Non-Travellers',
  nonTravellerDesc: 'Shop products available for home delivery.',
  currency: 'SGD',
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
  traveller: 'traveller',
  'traveller desc': 'travellerDesc',
  'non traveller': 'nonTraveller',
  'non-traveller': 'nonTraveller',
  'non traveller desc': 'nonTravellerDesc',
  'non-traveller desc': 'nonTravellerDesc',
  currency: 'currency',
  'base currency': 'currency',
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

function getCookie(name) {
  return document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=') || '';
}

function decodeCookieValue(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function createLink(item, className) {
  const link = createElement('a', className, item.text);
  link.href = normalizeHref(item.href);
  return link;
}

function createFlyoutToggle(label, className, behavior) {
  const button = createElement('button', className);
  button.type = 'button';
  button.dataset.behavior = behavior;
  button.innerHTML = `
    <span class="ks-selector-icon" aria-hidden="true"></span>
    <span class="segment-name">${label}</span>
    <span class="ks-chevron" aria-hidden="true"></span>
  `;
  return button;
}

function buildCurrency(config) {
  const wrapper = createElement('div', 'header-element currency-wrapper mr12');
  wrapper.dataset.activeStatePath = 'currencySelect.visible';
  const selectedCurrency = decodeCookieValue(getCookie('currency') || config.currency || 'SGD').toUpperCase();
  const currencyItems = ['SGD', 'AUD'].map((currency) => {
    const currencyLabel = currency === 'SGD' ? 'Singapore Dollar' : 'Australian Dollar';
    const selected = currency === selectedCurrency;
    return `
      <label class="currency-item ${selected ? 'selected' : ''}" data-currency-code="${currency}">
        <div class="currency-item-content">
          <div class="item-currecy-text">${currencyLabel}</div>
          <div class="item-currecy-code">${currency}</div>
          <div class="form-radio-action">
            <input type="radio" name="currencyCode" value="${currency}" ${selected ? 'checked' : ''}>
            <span class="formListRowRadioRepresenter"></span>
          </div>
        </div>
      </label>
    `;
  }).join('');

  wrapper.innerHTML = `
    <div class="currency-dropdown">
      <div class="currency-dropdown-content">
        <button class="currency-selected default" type="button" data-behavior="currencySelector">
          <span class="ks-selector-icon currency-icon" aria-hidden="true"></span>
          <span class="currency-name">${selectedCurrency}</span>
          <span class="ks-chevron" aria-hidden="true"></span>
        </button>
        <div class="flyout currency-list-content">
          <div class="header-currency-list">
            <div class="currency-list-items">
              ${currencyItems}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildSegment(config) {
  const selectedSegment = decodeCookieValue(getCookie('targetSegment') || 'nonTraveller');
  const selectedLabel = selectedSegment === 'traveller' ? config.traveller : config.nonTraveller || config.segment;
  const wrapper = createElement('div', 'header-element travel-segment-wrapper');
  wrapper.dataset.activeStatePath = 'targetSegmentSelect.visible';
  const selected = createFlyoutToggle(selectedLabel, 'header-element travel-segment-selected default', 'travelSelector');
  const flyout = createElement('div', 'flyout travel-segment-content');
  const segmentItems = [
    ['nonTraveller', config.nonTraveller || config.segment, config.nonTravellerDesc],
    ['traveller', config.traveller, config.travellerDesc],
  ].map(([name, label, desc], index) => `
    <label class="segment-item ${index === 0 ? 'first' : ''} ${name === selectedSegment ? 'selected' : ''}" data-segment-name="${name}">
      <div class="segment-item-content">
        <div class="segment-item-content-left">
          <span class="svgIcon svgIconCheck svg-arrow-icon" aria-hidden="true"></span>
          <div class="item-label">${label}</div>
          <div class="item-desc">${desc}</div>
        </div>
        <div class="segment-item-content-right">
          <div class="form-radio-action">
            <input type="radio" name="targetSegment" value="${name}" ${name === selectedSegment ? 'checked' : ''}>
            <span class="formListRowRadioRepresenter"></span>
          </div>
        </div>
      </div>
    </label>
  `).join('');

  flyout.dataset.behavior = 'flyout';
  flyout.innerHTML = `
    <div class="target-segment-list">
      <div class="target-segment-items">
        ${segmentItems}
      </div>
    </div>
  `;
  wrapper.append(selected, flyout);
  return wrapper;
}

function buildMiniCart(config) {
  const wrapper = createElement('div', 'mini-cart');
  wrapper.innerHTML = `
    <div class="cart">
      <a href="${normalizeHref(config.cart)}" class="mini-cart-icon" aria-label="Shopping bag" title="Shopping bag">
        <span class="svgIcon svg-icon-shopping header-mini-cart-icon default" aria-hidden="true"></span>
        <span class="notificationDot default headerMiniCartNotificationDot hidden"><span class="notificationDotCount">0</span></span>
      </a>
      <div class="flyout cart-content">
        <div class="mini-cart-items">
          <div class="cart-empty">
            <div class="cart-empty-title">Your shopping bag is empty</div>
            <div class="cart-empty-action-wrapper">
              <div class="cart-empty-headline">Start shopping</div>
              <a class="button buttonSizeSmall buttonStylePrimary" href="${normalizeHref(config.home)}"><span class="button-content">Continue shopping</span></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildAccount(config) {
  const wrapper = createElement('div', 'customer-account');
  wrapper.dataset.activeStatePath = 'customerAccount.visible';
  wrapper.innerHTML = `
    <button class="mini-cart-icon customer-account-button" type="button" aria-label="Account" title="Account">
      <span class="svgIcon svg-icon-account header-account-icon default" aria-hidden="true"></span>
    </button>
    <div class="flyout customer-account-content">
      <div class="customer-account-action-wrapper">
        <a class="button buttonSizeSmall buttonStylePrimary header-login-button" href="${normalizeHref(config.account)}"><span class="button-content">Sign in</span></a>
        <div class="header-divider-wrapper"><span class="header-divider-line"></span><span class="header-divider-text">or</span><span class="header-divider-line"></span></div>
        <div class="customer-register-link-wrapper">
          <div class="customer-register-headline">New to KrisShop?</div>
          <div class="customer-register-desc">Join KrisShopper for more deals and rewards.</div>
          <a class="customer-register-link" href="${normalizeHref(config.account)}">Register now</a>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildMainHeader(config, navItems) {
  const header = createElement('div', 'header default');
  header.dataset.behavior = 'header';

  const content = createElement('div', 'header-content header-content-details');
  content.dataset.basecurrency = config.currency;
  const container = createElement('div', 'container');

  const hamburger = createElement('div', 'nav-hamburger');
  const hamburgerButton = createElement('button');
  hamburgerButton.type = 'button';
  hamburgerButton.className = 'menuModalOpenButton';
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  hamburgerButton.append(createElement('span', 'nav-hamburger-icon'));
  hamburger.append(hamburgerButton);

  const headerTop = createElement('div', 'header-top');
  const brand = createElement('div', 'logo-wrapper krisshop-normal-user');
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

  const headerTopRight = createElement('div', 'header-top-right for-tablet');
  const headerTopRightContent = createElement('div', 'header-top-right-content');
  headerTopRightContent.append(buildCurrency(config), buildSegment(config));
  headerTopRight.append(headerTopRightContent);

  headerTop.append(hamburger, brand, headerTopRight);

  const headerBottom = createElement('div', 'header-bottom-wrapper');
  const headerBottomInner = createElement('div', 'header-bottom');
  const navSections = createElement('div', 'nav-sections');
  const list = createElement('ul');
  navItems.forEach((item) => {
    const li = createElement('li');
    li.append(createLink(item));
    list.append(li);
  });
  navSections.append(list);

  const navTools = createElement('div', 'header-bottom-right nav-tools');
  const searchForm = createElement('form', 'search-form ks-search-form');
  searchForm.action = normalizeHref(config.search);
  searchForm.role = 'search';

  const searchInput = createElement('input', 'header-search-input ks-search-input');
  searchInput.type = 'search';
  searchInput.name = 'keyword';
  searchInput.placeholder = 'SEARCH';
  searchInput.setAttribute('aria-label', 'Search');

  const searchButton = createElement('button', 'header-search-submit-button ks-search-button');
  searchButton.type = 'submit';
  searchButton.setAttribute('aria-label', 'Search');
  searchForm.append(searchInput, searchButton);

  navTools.append(
    searchForm,
    buildMiniCart(config),
    buildAccount(config),
  );

  headerBottomInner.append(navSections, navTools);
  headerBottom.append(headerBottomInner);
  container.append(headerTop, headerBottom);
  content.append(container);
  header.append(content);
  header.id = 'nav';
  header.setAttribute('aria-expanded', 'false');
  return header;
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
  nav.querySelector('.nav-hamburger button')?.addEventListener('click', () => {
    setMenuState(nav, nav.getAttribute('aria-expanded') !== 'true');
  });

  isDesktop.addEventListener('change', () => setMenuState(nav, false));

  nav.querySelectorAll('.currency-selected, .travel-segment-selected, .customer-account-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const parent = button.closest('.currency-wrapper, .travel-segment-wrapper, .customer-account');
      parent?.classList.toggle('active');
    });
  });

  nav.querySelectorAll('.segment-item').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const { segmentName } = item.dataset;
      const segmentLabel = item.querySelector('.item-label')?.innerHTML;
      if (!segmentName) return;

      nav.querySelectorAll('.target-segment-items .segment-item').forEach((segmentItem) => {
        segmentItem.classList.remove('selected');
      });
      item.classList.add('selected');
      if (segmentLabel) {
        nav.querySelector('[data-behavior="travelSelector"] .segment-name').innerHTML = segmentLabel;
      }
      setCookie('targetSegment', segmentName);
      window.location.reload();
    });
  });

  nav.querySelectorAll('.currency-item').forEach((item) => {
    item.addEventListener('click', () => {
      setCookie('currency', item.dataset.currencyCode);
      window.location.reload();
    });
  });

  document.addEventListener('click', (event) => {
    if (nav.contains(event.target)) return;
    nav.querySelectorAll('.active').forEach((element) => element.classList.remove('active'));
  });

  wrapper.append(nav);
  return wrapper;
}

function parseFragmentConfig(fragment) {
  const tables = [...fragment.querySelectorAll('table')];
  const fragmentTable = tables.find((table) => {
    const firstCell = table.querySelector('tr:first-child td, tr:first-child th');
    return firstCell?.textContent.trim().toLowerCase() === 'header fragments';
  });

  if (!fragmentTable) return [];

  const rows = [...fragmentTable.querySelectorAll('tr')].slice(2);

  return rows.map((row) => {
    const cells = [...row.children];
    return {
      label: getCellText(cells[0]),
      path: getCellValue(cells[1]),
      target: getCellText(cells[2]).toLowerCase() || 'body',
      position: getCellText(cells[3]).toLowerCase() || 'append',
    };
  }).filter((item) => item.path);
}

async function loadHeaderFragment(path, target, position = 'append') {
  if (!path || !target) return null;

  const existing = document.querySelector(`[data-header-fragment="${path}"]`);
  if (existing) return existing;

  try {
    const fragment = await loadFragment(path);
    if (!fragment) return null;

    fragment.dataset.headerFragment = path;

    if (position === 'prepend') {
      target.prepend(fragment);
    } else {
      target.append(fragment);
    }

    return fragment;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Unable to load header fragment: ${path}`, e);
    return null;
  }
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
  const headerFragments = parseFragmentConfig(fragment);
  let header;
  try {
    header = buildHeader(config, navItems);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Unable to build AEM-like header, falling back to minimal header.', e);
    header = createElement('div', 'nav-wrapper ks-header');
    header.append(buildMainHeader(DEFAULT_CONFIG, DEFAULT_NAV));
  }
  block.replaceChildren(header);

  await Promise.all(headerFragments.map((item) => {
    const target = item.target === 'header' ? header : document.body;
    return loadHeaderFragment(item.path, target, item.position);
  }));
}
