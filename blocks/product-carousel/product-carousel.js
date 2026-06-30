import fetchProducts from '../../scripts/commerce-api.js';

function text(cell) {
  return cell?.textContent.trim() || '';
}

function getConfig(block) {
  const rows = [...block.children];
  const config = {};

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = text(cells[0]).toLowerCase().replace(/\s+/g, '-');
    config[key] = text(cells[1]);
  });

  const firstRow = [...(rows[0]?.children || [])].map(text);
  if (firstRow.length > 3 && firstRow[0]?.toLowerCase() === 'title') {
    [
      'title',
      'skus',
      'category-ids',
      'brand-ids',
      'topic-ids',
      'price-min',
      'price-max',
      'sort',
      'count',
      'graphql-url',
      'store-code',
      'product-base-path',
    ].forEach((key, index) => {
      if (firstRow[index]) config[key] = firstRow[index];
    });
  }

  return config;
}

function createProductCard(product) {
  const card = document.createElement('a');
  card.className = 'product-carousel-card';
  card.href = product.url;
  card.title = product.name;

  const media = document.createElement('span');
  media.className = 'product-carousel-media';

  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.imageAlt || product.name;
    img.loading = 'lazy';
    media.append(img);
  }

  const body = document.createElement('span');
  body.className = 'product-carousel-body';

  if (product.brand) {
    const brand = document.createElement('span');
    brand.className = 'product-carousel-brand';
    brand.textContent = product.brand;
    body.append(brand);
  }

  const name = document.createElement('span');
  name.className = 'product-carousel-name';
  name.textContent = product.name;
  body.append(name);

  if (product.price) {
    const price = document.createElement('span');
    price.className = 'product-carousel-price';
    price.textContent = product.price;
    body.append(price);
  }

  if (product.miles) {
    const miles = document.createElement('span');
    miles.className = 'product-carousel-miles';
    miles.textContent = `or ${product.miles} miles`;
    body.append(miles);
  }

  card.append(media, body);
  return card;
}

function showMessage(track, message) {
  const item = document.createElement('p');
  item.className = 'product-carousel-message';
  item.textContent = message;
  track.replaceChildren(item);
}

export default async function decorate(block) {
  const config = getConfig(block);
  const shell = document.createElement('section');
  shell.className = 'product-carousel-shell';

  if (config.title) {
    const heading = document.createElement('h2');
    heading.textContent = config.title;
    shell.append(heading);
  }

  const track = document.createElement('div');
  track.className = 'product-carousel-track';
  track.setAttribute('aria-live', 'polite');
  shell.append(track);
  block.replaceChildren(shell);

  showMessage(track, 'Loading products...');

  try {
    const products = await fetchProducts({
      endpoint: config['graphql-url'],
      storeCode: config['store-code'],
      skus: config.skus,
      categoryIds: config['category-ids'],
      brandIds: config['brand-ids'],
      topicIds: config['topic-ids'],
      priceMin: config['price-min'],
      priceMax: config['price-max'],
      sort: config.sort,
      count: config.count,
      contentCurrency: config['content-currency'],
      productBasePath: config['product-base-path'],
    });

    if (!products.length) {
      showMessage(track, 'No products found.');
      return;
    }

    track.replaceChildren(...products.map(createProductCard));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Product carousel failed', error);
    showMessage(track, `Product data is not available. ${error.message || ''}`.trim());
  }
}
