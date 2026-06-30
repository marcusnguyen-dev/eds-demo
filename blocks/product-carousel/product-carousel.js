import fetchProducts from '../../scripts/commerce-api.js';
import loadFlickity from '../../scripts/flickity-loader.js';

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
  card.className = 'product-slider-item';
  card.href = product.url;
  card.title = product.name;
  card.dataset.analytic = 'ctaClick';

  const wrapper = document.createElement('div');
  wrapper.className = 'product-info-wrapper';

  if (product.image) {
    const media = document.createElement('div');
    media.className = 'product-image';

    const img = document.createElement('img');
    img.src = product.image;
    img.dataset.src = product.image;
    img.alt = product.imageAlt || product.name;
    img.className = '-widget-image widget-image';
    img.loading = 'lazy';
    media.append(img);
    wrapper.append(media);
  }

  const body = document.createElement('div');
  body.className = 'product-info-content';

  if (product.brand) {
    const brand = document.createElement('div');
    brand.className = 'brand-name';
    brand.textContent = product.brand;
    body.append(brand);
  }

  const name = document.createElement('div');
  name.className = 'product-compact-name';
  const blur = document.createElement('div');
  blur.className = 'blur-element';
  name.append(blur);
  name.append(document.createTextNode(product.name));
  body.append(name);

  const priceInfo = document.createElement('div');
  priceInfo.className = 'price-info';
  const priceContainer = document.createElement('div');
  priceContainer.className = 'price-container';
  const priceLine = document.createElement('div');
  priceLine.className = 'price-line product-price-line';

  const finalPrice = document.createElement('span');
  finalPrice.className = product.hasDiscount ? 'final-price price-discounted' : 'price-original final-price';
  finalPrice.textContent = product.finalPrice || product.regularPrice;
  priceLine.append(finalPrice);

  if (product.hasDiscount && product.regularPrice) {
    const regularPrice = document.createElement('span');
    regularPrice.className = 'price-original old-price';
    regularPrice.textContent = product.regularPrice;
    priceLine.append(regularPrice);
  }

  priceContainer.append(priceLine);

  if (product.miles) {
    const miles = document.createElement('div');
    miles.className = 'kris-shop-miles';
    miles.textContent = `or ${product.miles} miles`;
    priceContainer.append(miles);
  }

  priceInfo.append(priceContainer);
  body.append(priceInfo);

  wrapper.append(body);
  card.append(wrapper);
  return card;
}

function showMessage(track, message) {
  const item = document.createElement('p');
  item.className = 'product-carousel-message';
  item.textContent = message;
  track.replaceChildren(item);
}

function initFlickity(track) {
  loadFlickity()
    .then((Flickity) => {
      track.classList.add('product-carousel-flickity');
      // eslint-disable-next-line no-new
      new Flickity(track, {
        cellAlign: 'left',
        contain: true,
        groupCells: true,
        pageDots: false,
        prevNextButtons: true,
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.warn('Flickity failed for product carousel', error);
    });
}

export default async function decorate(block) {
  const config = getConfig(block);
  const wrapper = document.createElement('div');
  wrapper.className = 'products-slider-wrapper';

  if (config.title) {
    const heading = document.createElement('h2');
    heading.textContent = config.title;
    wrapper.append(heading);
  }

  const content = document.createElement('div');
  content.className = 'products-slider-content';
  const track = document.createElement('div');
  track.className = 'products-slider';
  track.setAttribute('aria-live', 'polite');
  content.append(track);
  wrapper.append(content);
  block.replaceChildren(wrapper);

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
    initFlickity(track);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Product carousel failed', error);
    showMessage(track, `Product data is not available. ${error.message || ''}`.trim());
  }
}
