function getText(row, index) {
  return row.children[index]?.textContent.trim() || '';
}

function getLink(row, index) {
  const anchor = row.children[index]?.querySelector('a');
  return anchor?.href || getText(row, index) || '#';
}

function getImage(row, index) {
  const image = row.children[index]?.querySelector('img');
  if (image) {
    return {
      src: image.src,
      alt: image.alt || getText(row, 1),
    };
  }

  const value = getText(row, index);
  return value ? { src: value, alt: getText(row, 1) } : null;
}

function createCard(row) {
  const image = getImage(row, 0);
  const title = getText(row, 1);
  const description = getText(row, 2);
  const link = getLink(row, 3);
  const target = getText(row, 4);

  const card = document.createElement('a');
  card.className = 'quick-links-card';
  card.href = link;
  card.title = title;

  if (target) {
    card.target = target;
    if (target === '_blank') card.rel = 'noopener noreferrer';
  }

  if (image) {
    const icon = document.createElement('img');
    icon.className = 'quick-links-card-icon';
    icon.loading = 'lazy';
    icon.src = image.src;
    icon.alt = image.alt;
    card.append(icon);
  }

  const content = document.createElement('span');
  content.className = 'quick-links-card-content';

  const headline = document.createElement('span');
  headline.className = 'quick-links-card-title';
  headline.textContent = title;
  content.append(headline);

  if (description) {
    const copy = document.createElement('span');
    copy.className = 'quick-links-card-description';
    copy.textContent = description;
    content.append(copy);
  }

  const arrow = document.createElement('span');
  arrow.className = 'quick-links-card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '>';

  card.append(content, arrow);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  const items = rows.filter((row) => getText(row, 1).toLowerCase() !== 'title');

  const list = document.createElement('div');
  list.className = 'quick-links-list';

  items.forEach((row) => {
    if (getText(row, 1)) list.append(createCard(row));
  });

  block.replaceChildren(list);
}
