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

function placeFragment(target, fragment, position) {
  if (position === 'prepend') {
    target.prepend(fragment);
    return;
  }

  if (position === 'before-header-block') {
    const headerBlock = target.querySelector('.header-wrapper');
    if (headerBlock) {
      headerBlock.before(fragment);
      return;
    }
  }

  target.append(fragment);
}

export default async function decorate(block) {
  const items = parseRows(block);
  block.style.display = 'none';

  await Promise.all(items.map(async (item) => {
    const target = getTarget(item.target);
    if (!target || document.querySelector(`[data-header-fragment="${item.path}"]`)) return;

    const fragment = await loadFragment(item.path);
    if (!fragment) return;

    fragment.dataset.headerFragment = item.path;
    fragment.dataset.headerFragmentLabel = item.label;
    placeFragment(target, fragment, item.position);
  }));
}
