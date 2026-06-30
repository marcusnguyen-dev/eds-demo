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

function setSegment(segmentName) {
  window.localStorage.setItem('ks-target-segment', segmentName);
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
          <a class="button buttonSizeRegular buttonStyleTertiary targetSegmentPromptOptionButton" href="${config.travellerLink}" data-segment-name="traveller">
            <span class="buttonContent buttonContentTargetSegment">
              <span class="buttonContentIcon buttonContentIconPlane" aria-hidden="true"></span>
              ${config.travellersButtonLabel}
            </span>
          </a>
        </div>
        <div class="targetSegmentPromptOption">
          <div class="targetSegmentPromptOptionHeadline">${config.nonTravellersTitle}</div>
          <a class="button buttonSizeRegular buttonStyleTertiary targetSegmentPromptOptionButton" href="${config.nonTravellerLink}" data-segment-name="nonTraveller">
            <span class="buttonContent buttonContentTargetSegment">
              <span class="buttonContentIcon buttonContentIconHome" aria-hidden="true"></span>
              ${config.nonTravellersButtonLabel}
            </span>
          </a>
        </div>
      </div>
    </div>
    <div class="targetSegmentPromptBackdrop"></div>
  `;

  block.querySelectorAll('[data-segment-name]').forEach((element) => {
    element.addEventListener('click', () => setSegment(element.dataset.segmentName));
  });
}
