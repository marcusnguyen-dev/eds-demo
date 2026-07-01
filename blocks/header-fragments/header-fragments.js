import { loadFragment } from '../fragment/fragment.js';

function cellText(cell) {
  return cell?.textContent.trim() || '';
}

function cellValue(cell) {
  const link = cell?.querySelector('a[href]');
  return link ? link.getAttribute('href') : cellText(cell);
}

function getRows(block) {
  return [...block.children].map((row) => [...row.children]).filter((cells) => cells.length >= 2);
}

function parseRows(block) {
  return getRows(block)
    .map((cells) => ({
      label: cellText(cells[0]),
      path: cellValue(cells[1]),
      target: cellText(cells[2]).toLowerCase() || 'header',
      position: cellText(cells[3]).toLowerCase() || 'append',
    }))
    .filter((item) => item.path && item.path.startsWith('/'));
}

function getTarget(targetName) {
  if (targetName === 'body') return document.body;
  if (targetName === 'main') return document.querySelector('main');
  return document.querySelector('body > header');
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

function addFragmentClass(wrapper, path) {
  if (path.includes('delivery-notice')) wrapper.classList.add('header-fragment-delivery-notice');
  if (path.includes('traveller-maintenance')) wrapper.classList.add('header-fragment-traveller-maintenance');
  if (path.includes('traveller-mode-message')) wrapper.classList.add('header-fragment-traveller-mode-message');
  if (path.includes('promo-message')) wrapper.classList.add('header-fragment-promo-message');
  if (path.includes('target-segment')) wrapper.classList.add('header-fragment-target-segment');
  if (path.includes('become-krisshopper')) wrapper.classList.add('header-fragment-become-krisshopper');
  if (path.includes('cookies')) wrapper.classList.add('header-fragment-cookies');
}

function getPosition(path, position) {
  if (path.includes('delivery-notice')) return 'prepend';
  if (path.includes('target-segment')) return 'prepend';
  return position;
}

function placeFragment(target, fragment, position) {
  const wrapper = document.createElement('div');
  wrapper.className = 'header-fragment';
  wrapper.dataset.headerFragment = fragment.dataset.headerFragment;
  wrapper.dataset.headerFragmentLabel = fragment.dataset.headerFragmentLabel;
  addFragmentClass(wrapper, fragment.dataset.headerFragment);
  wrapper.append(...fragment.childNodes);

  if (getPosition(fragment.dataset.headerFragment, position) === 'prepend') {
    target.prepend(wrapper);
    return;
  }

  if (getPosition(fragment.dataset.headerFragment, position) === 'before-header-block') {
    const headerBlock = target.querySelector('.header-wrapper');
    if (headerBlock) {
      headerBlock.before(wrapper);
      return;
    }
  }

  target.append(wrapper);
}

export default async function decorate(block) {
  const items = parseRows(block);
  const targetSegment = decodeCookieValue(getCookie('targetSegment') || 'nonTraveller');
  document.body.dataset.targetSegment = targetSegment;
  block.style.display = 'none';

  await items.reduce((promise, item) => promise.then(async () => {
    const target = getTarget(item.target);
    if (!target || document.querySelector(`[data-header-fragment="${item.path}"]`)) return;

    const fragment = await loadFragment(item.path);
    if (!fragment) return;

    fragment.dataset.headerFragment = item.path;
    fragment.dataset.headerFragmentLabel = item.label;
    placeFragment(target, fragment, item.position);
  }), Promise.resolve());
}
