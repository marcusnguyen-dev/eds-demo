const COOKIE_NAME = 'krisshop-cookie-consent';

function getText(cell) {
  return cell.textContent.trim();
}

function getConfig(block) {
  const config = {
    description: '',
    buttonLabel: 'Accept all cookies',
    cookieExpiryTime: '365',
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = getText(cells[0]).toLowerCase();
    const value = cells[1];
    if (key === 'description') config.description = value.innerHTML.trim();
    if (key === 'button label') config.buttonLabel = getText(value);
    if (key === 'cookie expiry time' || key === 'expiry days') config.cookieExpiryTime = getText(value);
  });

  return config;
}

function setCookie(days) {
  const maxAge = Number.parseInt(days, 10) * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=accepted; path=/; max-age=${Number.isFinite(maxAge) ? maxAge : 31536000}`;
}

function hasCookie() {
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${COOKIE_NAME}=`));
}

export default function decorate(block) {
  const config = getConfig(block);
  if (!config.description || hasCookie()) {
    block.remove();
    return;
  }

  block.classList.add('cookie-container', 'default');
  block.dataset.cookieExpiryTime = config.cookieExpiryTime;
  block.innerHTML = `
    <div class="cookie-content">
      <div class="cookieConsentBarText">
        <div class="cookieConsentBarContent">${config.description}</div>
      </div>
      <div class="cookieConsentBarButtons">
        <button class="button buttonSizeSmall buttonStylePrimary cookieConsentBarButton" type="button" id="cookies-eu-accept">
          <span class="buttonContent">${config.buttonLabel}</span>
        </button>
      </div>
    </div>
  `;

  block.querySelector('#cookies-eu-accept').addEventListener('click', () => {
    setCookie(block.dataset.cookieExpiryTime);
    block.remove();
  });
}
