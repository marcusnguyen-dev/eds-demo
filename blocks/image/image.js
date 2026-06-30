function text(cell) {
  return cell?.textContent.trim() || '';
}

function getImage(cell, alt) {
  const img = cell?.querySelector('img');
  if (img) return { src: img.src, alt: img.alt || alt };
  const value = text(cell);
  return value ? { src: value, alt } : null;
}

export default function decorate(block) {
  const cells = [...(block.children[0]?.children || [])];
  const desktop = getImage(cells[0], text(cells[2]));
  const mobile = getImage(cells[1], text(cells[2]));
  const alt = text(cells[2]) || desktop?.alt || '';
  const caption = text(cells[3]);
  const link = cells[4]?.querySelector('a')?.href || text(cells[4]);

  block.textContent = '';
  if (!desktop) return;

  const figure = document.createElement('figure');
  const picture = document.createElement('picture');

  if (mobile) {
    const source = document.createElement('source');
    source.media = '(max-width: 600px)';
    source.srcset = mobile.src;
    picture.append(source);
  }

  const img = document.createElement('img');
  img.src = desktop.src;
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);

  if (link) {
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.append(picture);
    figure.append(anchor);
  } else {
    figure.append(picture);
  }

  if (caption) {
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = caption;
    figure.append(figcaption);
  }

  block.append(figure);
}
