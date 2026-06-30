function getConfig(block) {
  const config = {
    segmentBannerTitle: 'CHOOSE YOUR SHOPPING JOURNEY',
    travellersTitle: 'Flying soon? Shop duty-free products (with a Singapore Airlines/Scoot flight booking)',
    travellersButtonLabel: 'TRAVELLER',
    travellerLink: '/en/traveller',
    nonTravellersTitle: 'Not flying? More products available for home delivery',
    nonTravellersButtonLabel: 'NON-TRAVELLER',
    nonTravellerLink: '/en',
    travellersReminder: '',
    nonTravellersReminder: '',
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1];
    const text = value.textContent.trim();
    if (key === 'segment banner title' || key === 'banner') config.segmentBannerTitle = text;
    if (key === 'travellers title' || key === 'traveller title') config.travellersTitle = text;
    if (key === 'travellers button label' || key === 'traveller label') config.travellersButtonLabel = text;
    if (key === 'traveller link') config.travellerLink = text;
    if (key === 'non travellers title' || key === 'non traveller title') config.nonTravellersTitle = text;
    if (key === 'non travellers button label' || key === 'non traveller label') config.nonTravellersButtonLabel = text;
    if (key === 'non traveller link') config.nonTravellerLink = text;
    if (key === 'travellers reminder') config.travellersReminder = value.innerHTML.trim();
    if (key === 'non travellers reminder') config.nonTravellersReminder = value.innerHTML.trim();
  });

  return config;
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

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function setSegment(segmentName) {
  setCookie('targetSegment', segmentName);
  setCookie('targetSegmentReminderSeen', 'true');
}

export default function decorate(block) {
  const config = getConfig(block);

  block.classList.add('targetSegmentPrompt');
  block.innerHTML = `
    <div class="targetSegmentPromptBanner">${config.segmentBannerTitle}</div>
    <div class="targetSegmentPromptContent">
      <div class="targetSegmentPromptOptions">
        <div class="targetSegmentPromptOption">
          <div class="targetSegmentPromptOptionHeadline">${config.travellersTitle}</div>
          <button class="button buttonSizeRegular buttonStyleTertiary targetSegmentPromptOptionButton" type="button" data-segment-name="traveller">
            <span class="buttonContent buttonContentTargetSegment">
              <div class="svgIcon svgIconPlane buttonContentIcon" aria-hidden="true"></div>
              ${config.travellersButtonLabel}
            </span>
          </button>
        </div>
        <div class="targetSegmentPromptOption">
          <div class="targetSegmentPromptOptionHeadline">${config.nonTravellersTitle}</div>
          <button class="button buttonSizeRegular buttonStyleTertiary targetSegmentPromptOptionButton" type="button" data-segment-name="nonTraveller">
            <span class="buttonContent buttonContentTargetSegment">
              <div class="svgIcon svgIconHome buttonContentIcon" aria-hidden="true"></div>
              ${config.nonTravellersButtonLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="targetSegmentPromptBackdrop"></div>
  `;

  if (!getCookie('targetSegment') && !getCookie('targetSegmentReminderSeen')) {
    block.classList.add('targetSegmentPromptActive');
  }

  block.querySelectorAll('[data-segment-name]').forEach((element) => {
    element.addEventListener('click', () => setSegment(element.dataset.segmentName));
  });
}
