function getMetaContent(name) {
  return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFilter({
  skus,
  categoryIds,
  brandIds,
  topicIds,
  priceMin,
  priceMax,
}) {
  const filter = [];

  if (skus.length) filter.push(`sku: { in: ${JSON.stringify(skus)} }`);
  if (categoryIds.length) filter.push(`category_id: { in: ${JSON.stringify(categoryIds)} }`);
  if (brandIds.length) filter.push(`product_brand: { in: ${JSON.stringify(brandIds)} }`);
  if (topicIds.length) filter.push(`kso_topics: { in: ${JSON.stringify(topicIds)} }`);
  if (priceMin || priceMax) {
    const range = [
      priceMin ? `from: "${priceMin}"` : '',
      priceMax ? `to: "${priceMax}"` : '',
    ].filter(Boolean).join(', ');
    filter.push(`price: { ${range} }`);
  }

  return filter.length ? `filter: { ${filter.join(', ')} }` : '';
}

function buildSort(sort) {
  if (!sort) return '';
  const [field, direction = 'DESC'] = String(sort).split('|').map((item) => item.trim());
  if (!field) return '';
  return `sort: { ${field}: ${direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'} }`;
}

function buildProductsQuery(options) {
  const filter = buildFilter(options);
  const sort = buildSort(options.sort);
  const args = [
    filter,
    sort,
    `pageSize: ${Number(options.count) || 8}`,
    'currentPage: 1',
  ].filter(Boolean).join(', ');

  return `query ProductCarousel {
    products(${args}) {
      total_count
      items {
        __typename
        sku
        name
        title
        url_key
        stock_status
        detail_image_url1
        image {
          url
          label
        }
        custom_attributes {
          miles_point
          product_brand {
            option_label
          }
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
          }
        }
      }
    }
  }`;
}

function formatPrice(price) {
  const value = Number(price?.value);
  if (!Number.isFinite(value)) return '';
  try {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: price.currency || 'SGD',
    }).format(value);
  } catch {
    return `${price.currency || ''} ${value.toFixed(2)}`.trim();
  }
}

function productUrl(product, productBasePath = '/en/product') {
  if (!product?.url_key && !product?.sku) return '#';
  const key = product.url_key || product.sku;
  return `${productBasePath.replace(/\/$/, '')}/${key}`;
}

function normalizeProduct(product, productBasePath) {
  const minimum = product?.price_range?.minimum_price;
  return {
    brand: product?.custom_attributes?.product_brand?.option_label || '',
    image: product?.detail_image_url1 || product?.image?.url || '',
    imageAlt: product?.image?.label || product?.title || product?.name || product?.sku || '',
    miles: product?.custom_attributes?.miles_point || '',
    name: product?.title || product?.name || product?.sku || '',
    price: formatPrice(minimum?.final_price || minimum?.regular_price),
    regularPrice: formatPrice(minimum?.regular_price),
    sku: product?.sku || '',
    stockStatus: product?.stock_status || '',
    url: productUrl(product, productBasePath),
  };
}

export default async function fetchProducts(options = {}) {
  const endpoint = options.endpoint || getMetaContent('commerce-graphql-url');
  if (!endpoint) throw new Error('Missing Commerce GraphQL endpoint');

  const skus = splitList(options.skus);
  const categoryIds = splitList(options.categoryIds);
  const brandIds = splitList(options.brandIds);
  const topicIds = splitList(options.topicIds);
  const query = buildProductsQuery({
    ...options,
    skus,
    categoryIds,
    brandIds,
    topicIds,
  });

  const headers = { 'content-type': 'application/json' };
  const store = options.storeCode || getMetaContent('commerce-store-code');
  if (store) headers.Store = store;
  const contentCurrency = options.contentCurrency || getMetaContent('commerce-content-currency');
  if (contentCurrency) headers['Content-Currency'] = contentCurrency;

  // eslint-disable-next-line no-console
  console.debug('EDS product carousel GraphQL', { endpoint, headers, query });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) throw new Error(`Commerce GraphQL failed: ${response.status}`);

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  return (payload.data?.products?.items || [])
    .filter((product) => product?.stock_status !== 'OUT_OF_STOCK')
    .map((product) => normalizeProduct(product, options.productBasePath));
}
