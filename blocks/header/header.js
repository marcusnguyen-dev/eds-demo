import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');
const KRISSHOP_MEDIA_BASE = 'https://www.krisshop.com/adobe/dynamicmedia/deliver';

const DEFAULT_CONFIG = {
  logo: 'KrisShop',
  logoImageDesktop: `${KRISSHOP_MEDIA_BASE}/dm-aid--e9845dd2-25d4-4955-99b3-5cf8784beac4/default-logo.svg.webp?preferwebp=true`,
  logoImageMobile: `${KRISSHOP_MEDIA_BASE}/dm-aid--72251e7b-8684-422b-abef-239ce01b99a1/mobile-default-logo.svg.webp?preferwebp=true`,
  home: '/content/krisshop/sg/en.html',
  segment: 'Non-Travellers',
  traveller: 'Travellers',
  travellerDesc: 'Shop tax and duty-free with a Singapore Airlines/Scoot flight booking.',
  nonTraveller: 'Non-Travellers',
  nonTravellerDesc: 'Shop products available for home delivery.',
  currency: 'SGD',
  search: '/content/krisshop/sg/en/search/product.html',
  cart: '/content/krisshop/sg/en/cart.html',
  account: '/content/krisshop/sg/en/my-account.html',
  wishlist: '/content/krisshop/sg/en/wishlist.html',
  rootCategoryId: '53',
  pageCountryCode: 'sg',
  storeCode: 'default',
};

const DEFAULT_NAV = [
  { text: 'CATEGORIES', href: '/content/krisshop/sg/en/category.html' },
  { text: 'BRANDS', href: '/content/krisshop/sg/en/brands.html' },
  { text: 'DEALS', href: '/content/krisshop/sg/en/deals.html' },
  { text: 'BATIK LABEL', href: '/content/krisshop/sg/en/store/batik-label.html' },
  { text: 'NEW ARRIVALS', href: '/content/krisshop/sg/en/store/newarrivals.html' },
  { text: 'SALE', href: '/content/krisshop/sg/en/sale.html' },
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
  wishlist: 'wishlist',
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
  if (!href) return '#';
  if (href.startsWith('http') || href.startsWith('#') || href.includes('.')) return href;
  if (href.startsWith('/content/')) return `${href}.html`;
  return href;
}

function sanitizeAssetUrl(value, fallback = '') {
  const src = value?.trim();
  if (!src || src.includes('%E2%80%A6') || src.includes('…')) return fallback;
  if (src.startsWith('/adobe/dynamicmedia/') || src.startsWith('/content/dam/')) {
    return `https://www.krisshop.com${src}`;
  }
  return src;
}

function getCellText(cell) {
  return cell?.textContent.trim().replace(/\s+/g, ' ') || '';
}

function getCellValue(cell) {
  const anchor = cell?.querySelector('a[href]');
  return anchor ? anchor.getAttribute('href') : getCellText(cell);
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

  config.logoImageDesktop = sanitizeAssetUrl(
    config.logoImageDesktop,
    DEFAULT_CONFIG.logoImageDesktop,
  );
  config.logoImageMobile = sanitizeAssetUrl(config.logoImageMobile, DEFAULT_CONFIG.logoImageMobile);

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

function svgIcon(name, className = '') {
  const icon = createElement('div', `svgIcon ${className}`.trim());
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = `<svg><use class="svgIconUse" xlink:href="#${name}"></use></svg>`;
  return icon;
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
          <div>
            <div class="item-currecy-text">${currencyLabel}</div>
            <div class="item-currecy-code">${currency}</div>
          </div>
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
        <div class="currency-selected default" data-behavior="currencySelector">
          <div class="dollar-icon" aria-hidden="true">
            <div class="svgIcon svgIconCurrencySGD desktop-header-select-icon" aria-hidden="true">
              <svg><use class="svgIconUse" xlink:href="#currencySGD"></use></svg>
            </div>
          </div>
          <span class="currency-name">${selectedCurrency}</span>
          <div class="svgIcon svgIconArrowChevronDown svg-arrow-icon" aria-hidden="true">
            <svg><use class="svgIconUse" xlink:href="#arrowChevronDown"></use></svg>
          </div>
        </div>
        <div class="flyout currency-list-content">
          <div class="header-currency-list">
            <div class="currency-list-items">${currencyItems}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildSegmentOption(name, label, desc, selectedSegment, first) {
  const selected = name === selectedSegment;
  return `
    <label class="segment-item ${first ? 'first' : ''} ${selected ? 'selected' : ''}" data-segment-name="${name}">
      <div class="segment-item-content">
        <div class="segment-item-content-left">
          <div class="svgIcon svgIconCheck svg-arrow-icon" aria-hidden="true">
            <svg><use class="svgIconUse" xlink:href="#check"></use></svg>
          </div>
          <div class="item-label">${label}</div>
          <div class="item-desc">${desc}</div>
        </div>
        <div class="segment-item-content-right">
          <div class="form-radio-action">
            <input type="radio" name="targetSegment" value="${name}" ${selected ? 'checked' : ''}>
            <span class="formListRowRadioRepresenter"></span>
          </div>
        </div>
      </div>
    </label>
  `;
}

function buildSegment(config) {
  const selectedSegment = decodeCookieValue(getCookie('targetSegment') || 'nonTraveller');
  const selectedLabel = selectedSegment === 'traveller' ? config.traveller : config.nonTraveller || config.segment;
  const wrapper = createElement('div', 'header-element travel-segment-wrapper');
  wrapper.dataset.activeStatePath = 'targetSegmentSelect.visible';
  wrapper.innerHTML = `
    <div class="header-element travel-segment-selected default" data-behavior="travelSelector">
      <div class="travel-selected-icon" aria-hidden="true">
        <div class="svgIcon svgIconPlane desktop-header-select-icon" aria-hidden="true">
          <svg><use class="svgIconUse" xlink:href="#plane"></use></svg>
        </div>
      </div>
      <span class="segment-name">${selectedLabel}</span>
      <div class="svgIcon svgIconArrowChevronDown svg-arrow-icon" aria-hidden="true">
        <svg><use class="svgIconUse" xlink:href="#arrowChevronDown"></use></svg>
      </div>
    </div>
    <div class="flyout travel-segment-content" data-behavior="flyout">
      <div class="target-segment-list">
        <div class="target-segment-items">
          ${buildSegmentOption('nonTraveller', config.nonTraveller || config.segment, config.nonTravellerDesc, selectedSegment, true)}
          ${buildSegmentOption('traveller', config.traveller, config.travellerDesc, selectedSegment, false)}
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildMobileSegmentOption(name, label, selectedSegment, first) {
  const selected = name === selectedSegment;
  return `
    <label class="listRow formListRow ${first ? 'headerTargetSegmentListFirstOption' : ''}" data-segment-name="${name}">
      <div class="listRowContent">
        <div class="listRowLabelArea listRowLabelAreaHasIcon listRowLabelAreaColumn">
          <div class="svgIcon svgIconCheck listRowLabelIcon">
            <svg><use class="svgIconUse" xlink:href="#check"></use></svg>
          </div>
          <div class="listRowLabel listRowLabelIsBold item-label">${label}</div>
        </div>
        <div class="listRowValueArea">
          <div class="form-radio-action">
            <input type="radio" name="targetSegmentMobile" value="${name}" ${selected ? 'checked' : ''}>
            <span class="formListRowRadioRepresenter"></span>
          </div>
        </div>
      </div>
    </label>
  `;
}

function buildMobileSegment(config) {
  const selectedSegment = decodeCookieValue(getCookie('targetSegment') || 'nonTraveller');
  const selectedLabel = selectedSegment === 'traveller' ? config.traveller : config.nonTraveller || config.segment;
  const wrapper = createElement('div', 'mobileHeaderSelect mobileHeaderSelectTargetSegment for-mobile');
  wrapper.dataset.behavior = 'mobileHeaderSelect';
  wrapper.innerHTML = `
    <div class="mobileHeaderSelectSelected default" data-behavior="travelSelector">
      <div class="svgIcon svgIconPlane mobileHeaderSelectIcon">
        <svg><use class="svgIconUse" xlink:href="#plane"></use></svg>
      </div>
      <span class="segment-name">${selectedLabel}</span>
      <div class="svgIcon svgIconArrowChevronDown mobileHeaderSelectChevronIcon">
        <svg><use class="svgIconUse" xlink:href="#arrowChevronDown"></use></svg>
      </div>
    </div>
    <div class="mobileHeaderSelectList">
      <div class="headerTargetSegmentList">
        <div class="headerTargetSegmentListItems">
          ${buildMobileSegmentOption('nonTraveller', config.nonTraveller || config.segment, selectedSegment, true)}
          ${buildMobileSegmentOption('traveller', config.traveller, selectedSegment, false)}
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildWishlist(config) {
  const wrapper = createElement('div', 'wishlist');
  wrapper.dataset.behavior = 'show.wishlist';
  wrapper.innerHTML = `
    <div class="wishlist-content">
      <a class="mini-cart-icon notLoggedWishList header-login-button">
        <div class="svgIcon svg-icon-shopping header-wishlist-icon default" aria-hidden="true">
          <svg><use class="svgIconUse" xlink:href="#heartO"></use></svg>
        </div>
      </a>
      <a href="${normalizeHref(config.wishlist)}" class="mini-cart-icon loggedWishList hidden">
        <div class="svgIcon svg-icon-shopping header-wishlist-icon default" aria-hidden="true">
          <svg><use class="svgIconUse loggedNotWishListPage" xlink:href="#heartO"></use></svg>
        </div>
      </a>
      <div class="flyout customer-account-content wishlist-action-content">
        <div class="customer-account-action-wrapper">
          <a class="button btn-primary btn-regular header-login-button" href="${normalizeHref(config.account)}">
            <span class="buttonContent">Sign in</span>
          </a>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildMiniCart(config) {
  const wrapper = createElement('div', 'mini-cart');
  wrapper.innerHTML = `
    <div class="cart">
      <div class="skeleton-headers skeleton-circle-cart"></div>
      <a href="${normalizeHref(config.cart)}" class="header-element mini-cart-icon">
        <div class="svgIcon svg-icon-shopping header-mini-cart-icon default" aria-hidden="true">
          <svg><use class="svgIconUse" xlink:href="#shopping"></use></svg>
        </div>
        <div class="notificationDot default headerMiniCartNotificationDot hidden" data-behavior="notificationDot" data-state-path="cart.itemCount">
          <span class="notificationDotCount">0</span>
        </div>
      </a>
      <div class="flyout cart-content">
        <div class="mini-cart-items">
          <div class="cart-empty">
            <div class="cart-empty-title">Your shopping bag is empty</div>
            <div class="cart-empty-action-wrapper">
              <div class="cart-empty-headline">Start shopping</div>
              <a class="button buttonSizeSmall buttonStylePrimary" href="${normalizeHref(config.home)}">
                <span class="button-content">Continue shopping</span>
              </a>
            </div>
          </div>
          <div class="cart-not-empty hidden">
            <div class="miniCartItemsFilled"></div>
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
    <div class="skeleton-headers skeleton-circle-account"></div>
    <a class="header-element" href="${normalizeHref(config.account)}">
      <div class="svgIcon svg-icon-user header-account-icon" aria-hidden="true">
        <svg><use class="svgIconUse" xlink:href="#user"></use></svg>
      </div>
    </a>
    <div class="flyout customer-account-content">
      <div class="customer-account-action-wrapper">
        <a class="button btn-primary btn-regular header-login-button" href="${normalizeHref(config.account)}">
          <span class="buttonContent">Sign in</span>
        </a>
        <div class="header-divider-wrapper">
          <div class="header-divider-line"></div>
          <div class="header-divider-text">or</div>
          <div class="header-divider-line"></div>
        </div>
        <div class="customer-register-link-wrapper cmp-text">
          <div class="customer-register-headline text-md-sb mb0">New to KrisShop?</div>
          <div class="customer-register-desc">Join KrisShopper for more deals and rewards.</div>
          <a class="customer-register-link" href="${normalizeHref(config.account)}">Register now</a>
        </div>
      </div>
      <div class="customerQuickLinksContainer hidden">
        <div class="flyoutTitle"><span class="name"></span></div>
        <div class="customerAccountQuickLinksItems"></div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildSearch(config) {
  const form = createElement('form', 'search-form');
  form.action = normalizeHref(config.search);
  form.dataset.behavior = 'searchForm';
  form.autocomplete = 'off';
  form.innerHTML = `
    <input id="headerSearchInput" class="header-search-input" type="search" name="keyword" placeholder="SEARCH" data-qa="headerSearchInput">
    <button class="header-search-submit-button" type="submit" data-qa="headerSearchButton">
      <div class="svgIcon svgIconSearch header-search-icon" aria-hidden="true">
        <svg><use class="svgIconUse" xlink:href="#search"></use></svg>
      </div>
    </button>
  `;
  return form;
}

function buildSearchResult(config) {
  const wrapper = createElement('div', 'header-search-result');
  wrapper.dataset.behavior = 'headerSearchResult';
  wrapper.innerHTML = `
    <div class="header-search-result-container">
      <div class="header-search-result-wrapper">
        <div class="header-search-result-response-content">
          <div class="search-results-animation-helper"><div class="search-results-animation-helper-border"></div></div>
          <div class="header-search-result-suggest-link d-none">
            <div class="header-search-result-suggestions hidden"></div>
          </div>
          <div class="header-search-result-response">
            <h3 class="header-search-result-title">Products</h3>
            <div class="search-results-products"><ul class="products-grid"></ul></div>
          </div>
          <div class="header-search-result-response-empty hidden">
            <h3 class="header-response-empty-headline">No matching result <strong class="header-response-empty-headline-term"></strong>.</h3>
            <button class="button buttonSizeSmall buttonStylePrimary header-search-result-reset-button" type="button">
              <span class="buttonContent">Reset search</span>
            </button>
          </div>
          <div class="spinner search-result-spinner hidden" data-behavior="spinner" data-state-path="liveSearch.loading">
            <div class="spinner-animation"></div>
          </div>
        </div>
        <div class="header-search-result-footer">
          <a class="button btn-small btn-primary" href="${normalizeHref(config.search)}" data-href="${normalizeHref(config.search)}">
            <span class="button-content">Show all results <span class="result_count"></span></span>
          </a>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function buildMobileSearch() {
  const form = createElement('form', 'mobileHeaderSearch');
  form.dataset.behavior = 'mobileHeaderSearch';
  form.dataset.statePath = 'header.mobileSearch';
  form.autocomplete = 'off';
  form.innerHTML = `
    <button class="mobileHeaderSearchSubmitButton" type="submit" data-qa="mobileHeaderSearchButton">
      <div class="svgIcon svgIconSearch mobileHeaderSearchIcon mobileHeaderSearchSubmitIcon" aria-hidden="true">
        <svg><use class="svgIconUse" xlink:href="#search"></use></svg>
      </div>
    </button>
    <input id="mobileHeaderSearchInput" class="mobileHeaderSearchInput" type="search" name="keyword" tabindex="-1" data-qa="mobileHeaderSearchInput" enterkeyhint="search">
    <label class="mobileHeaderSearchLabel" for="mobileHeaderSearchInput">Search</label>
    <button class="mobileHeaderSearchCancelButton" type="reset" data-qa="mobileHeaderCancelButton">
      <div class="svgIcon svgIconCross mobileHeaderSearchIcon mobileHeaderSearchCancelIcon" aria-hidden="true">
        <svg><use class="svgIconUse mobileHeaderSearchCancelIcon" xlink:href="#cross"></use></svg>
      </div>
    </button>
  `;
  return form;
}

function buildMobileMenu(config, navItems) {
  const wrapper = createElement('div', 'for-mobile actions-left');
  wrapper.innerHTML = `
    <div class="menuHeaderTransitionFromLeft">
      <div class="modalHeader">
        <div class="modalHeaderPrimary">
          <div class="modalHeaderButton modalHeaderWithStackNavigationBackButton">
            <div class="modalHeaderButtonIcon svg-icon" aria-hidden="true" data-behavior="back-left-menu">
              <svg><use class="svgIconUse" xlink:href="#arrowChevronLeft"></use></svg>
            </div>
            <div class="modalHeaderPrimaryLabel" id="menu">Menu</div>
          </div>
        </div>
        <div class="modalHeaderSencondary">
          <div class="modalHeaderButtonIcon svg-icon" aria-hidden="true" data-behavior="out-left-menu">
            <svg><use class="svgIconUse" xlink:href="#cross"></use></svg>
          </div>
        </div>
      </div>
      <div class="modalScrollContent">
        <div class="navigationTitle">Menu</div>
        ${navItems.map((item) => `
          <a class="listRow listRowSizeL slideNavigationTrigger" href="${normalizeHref(item.href)}" data-label="${item.text}">
            <div class="listRowContent">
              <div class="listRowLabelArea"><div class="listRowLabel">${item.text}</div></div>
              <div class="listRowValueArea">
                <div class="svgIcon modalHeaderButtonIcon" aria-hidden="true">
                  <svg><use class="svgIconUse" xlink:href="#arrowChevron"></use></svg>
                </div>
              </div>
            </div>
          </a>
        `).join('')}
        <a class="listRow menuModalShoppingBag" href="${normalizeHref(config.cart)}" data-qa="menuModalShoppingBag">
          <div class="listRowContent">
            <div class="listRowLabelArea"><div class="listRowLabel">Shopping Bag</div></div>
            <div class="listRowValueArea"><div class="listRowValue menuModalShoppingBagValue">0 items</div></div>
          </div>
        </a>
        <a class="listRow listRowValueAreaEllipsed" data-qa="menuModalAccount" href="${normalizeHref(config.account)}">
          <div class="listRowContent">
            <div class="listRowLabelArea"><div class="listRowLabel">Account</div></div>
            <div class="listRowValueArea"><div class="svgIcon modalHeaderButtonIcon"><svg><use class="svgIconUse" xlink:href="#arrowChevron"></use></svg></div></div>
          </div>
        </a>
      </div>
    </div>
    <div class="backdrop modalBackdrop" data-behavior="backdrop" data-state-path="modal.menuModal.opened"></div>
  `;
  return wrapper;
}

function buildHeaderTop(config) {
  const headerTop = createElement('div', 'header-top');
  const navIconWrapper = createElement('div', 'nav-icon-wrapper for-mobile');
  navIconWrapper.innerHTML = `
    <div class="nav-icon">
      <button class="menuModalOpenButton">
        <div class="svg-icon"><svg><use class="svgIconUse" xlink:href="#menu"></use></svg></div>
      </button>
    </div>
  `;

  const brand = createElement('div', 'logo-wrapper krisshop-normal-user');
  brand.innerHTML = `
    <a href="${normalizeHref(config.home)}" target="_self">
      <img src="${config.logoImageDesktop}" fetchpriority="high" class="for-tablet" alt="${config.logo}">
      <img src="${config.logoImageMobile}" fetchpriority="high" class="for-mobile" alt="${config.logo}">
    </a>
  `;

  const corporateBrand = createElement('div', 'logo-wrapper krisshop-corporate-user hidden');
  corporateBrand.innerHTML = brand.innerHTML;

  const headerTopRight = createElement('div', 'header-top-right for-tablet');
  const headerTopRightContent = createElement('div', 'header-top-right-content');
  headerTopRightContent.append(
    createElement('div', 'skeleton-headers skeleton-rect-currency'),
    buildCurrency(config),
    createElement('div', 'skeleton-headers skeleton-rect-travel-select'),
    buildSegment(config),
  );
  headerTopRight.append(headerTopRightContent);

  const mobileActions = createElement('div', 'for-mobile actions-right');
  mobileActions.innerHTML = [
    '<div class="action-wrapper">',
    '<div class="mobile-search"></div>',
    '<div class="mobile-wishlist-slot"></div>',
    '<div class="mobile-cart-slot"></div>',
    '</div>',
  ].join('');
  mobileActions.querySelector('.mobile-search').append(
    svgIcon('search', 'svgIconSearch mobileHeaderSearchTrigger'),
  );
  mobileActions.querySelector('.mobile-wishlist-slot').replaceWith(buildWishlist(config));
  mobileActions.querySelector('.mobile-cart-slot').replaceWith(buildMiniCart(config));

  headerTop.append(navIconWrapper, brand, corporateBrand, headerTopRight, mobileActions);
  return headerTop;
}

function buildHeaderBottom(config, navItems) {
  const headerBottom = createElement('div', 'header-bottom');
  const headerBottomWrapper = createElement('div', 'header-bottom-wrapper');
  const mainMenuWrapper = createElement('div', 'main-menu-wrapper');
  const menu = createElement('ul', 'main-menu');
  navItems.forEach((item, index) => {
    const li = createElement('li', `menu-navigation-item level0 ${index === 0 ? 'first' : ''}`);
    const link = createLink(item, 'menu-navigation-link');
    li.append(link);
    menu.append(li);
  });
  mainMenuWrapper.append(menu);

  const headerBottomRight = createElement('div', 'header-bottom-right');
  headerBottomRight.append(
    buildSearch(config),
    buildWishlist(config),
    buildMiniCart(config),
    buildAccount(config),
  );
  headerBottomWrapper.append(mainMenuWrapper, headerBottomRight);
  headerBottom.append(headerBottomWrapper);
  return headerBottom;
}

function buildHeader(config, navItems) {
  const header = createElement('div', 'header na');
  header.dataset.behavior = 'header';
  header.dataset.hideFeaturedBrands = 'false';
  header.dataset.enabledDynamic = 'true';
  header.id = 'nav';
  header.setAttribute('aria-expanded', 'false');

  const content = createElement('div', 'header-content header-content-details');
  content.dataset.storecode = config.storeCode;
  content.dataset.basecurrency = config.currency;
  content.dataset.categoryid = config.rootCategoryId;
  content.dataset.pageCountryCode = config.pageCountryCode;

  const container = createElement('div', 'container');
  container.append(
    buildHeaderTop(config),
    buildHeaderBottom(config, navItems),
    buildMobileMenu(config, navItems),
    buildSearchResult(config),
    buildMobileSearch(),
  );
  content.append(container);
  header.append(content, buildMobileSegment(config));
  return header;
}

function setMenuState(nav, expanded) {
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.classList.toggle('menuModalIsOpen', expanded);
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  nav.querySelector('[data-state-path="modal.menuModal.opened"]')?.classList.toggle('backdropShow', expanded);
}

function bindHeader(nav) {
  nav.querySelectorAll('.menuModalOpenButton').forEach((button) => {
    button.addEventListener('click', () => setMenuState(nav, true));
  });
  nav.querySelectorAll('[data-behavior="out-left-menu"], [data-state-path="modal.menuModal.opened"]').forEach((button) => {
    button.addEventListener('click', () => setMenuState(nav, false));
  });

  isDesktop.addEventListener('change', () => setMenuState(nav, false));

  nav.querySelectorAll('.currency-selected, .travel-segment-selected, .mobileHeaderSelectSelected').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const parent = button.closest('.currency-wrapper, .travel-segment-wrapper, .mobileHeaderSelect');
      parent?.classList.toggle('active');
    });
  });

  nav.querySelectorAll('.segment-item, .headerTargetSegmentListItems .formListRow').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const { segmentName } = item.dataset;
      const segmentLabel = item.querySelector('.item-label, .listRowLabel')?.innerHTML;
      if (!segmentName) return;

      nav.querySelectorAll('.segment-item, .headerTargetSegmentListItems .formListRow').forEach((segmentItem) => {
        segmentItem.classList.remove('selected');
      });
      item.classList.add('selected');
      nav.querySelectorAll('[data-behavior="travelSelector"] .segment-name').forEach((label) => {
        label.innerHTML = segmentLabel || '';
      });
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

  nav.querySelectorAll('.mobile-search').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      nav.querySelector('.mobileHeaderSearch')?.classList.add('mobileHeaderSearchIsActive');
      nav.querySelector('.header-search-result')?.classList.add('header-search-result-is-opened');
    });
  });

  nav.querySelectorAll('.header-search-input').forEach((input) => {
    input.addEventListener('input', () => {
      nav.querySelector('.header-search-result')?.classList.toggle(
        'header-search-result-is-opened',
        input.value.trim().length > 1,
      );
    });
  });

  nav.querySelector('.mobileHeaderSearchCancelButton')?.addEventListener('click', () => {
    nav.querySelector('.mobileHeaderSearch')?.classList.remove('mobileHeaderSearchIsActive');
    nav.querySelector('.header-search-result')?.classList.remove('header-search-result-is-opened');
  });

  document.addEventListener('click', (event) => {
    if (nav.contains(event.target)) return;
    nav.querySelectorAll('.active').forEach((element) => element.classList.remove('active'));
    nav.querySelector('.header-search-result')?.classList.remove('header-search-result-is-opened');
  });
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

    fragment.classList.add('header-fragment');
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

function getFragmentTarget(item, header) {
  if (item.path.includes('target-segment')) return header;
  if (item.target === 'header') return header.closest('header') || header;
  return document.body;
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
  const header = buildHeader(config, navItems);
  bindHeader(header);
  block.replaceChildren(header);

  await Promise.all(headerFragments.map((item) => loadHeaderFragment(
    item.path,
    getFragmentTarget(item, header),
    item.path.includes('target-segment') ? 'append' : item.position,
  )));
}
