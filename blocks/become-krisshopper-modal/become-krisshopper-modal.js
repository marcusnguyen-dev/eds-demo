function getConfig(block) {
  const config = {
    title: 'Be Rewarded for What You Love with KrisShopper',
    description: '',
    descriptionBeforeCheckbox: '',
    descriptionForCheckBox1: '',
    descriptionForCheckBox2: '',
    descriptionForCheckBox3: '',
    errorMessage: 'This field is required.',
    joinKrisShopperButtonLabel: 'Join KrisShopper',
    titlePreferences: 'Tell us what you like!',
    descriptionPreferences: '',
    skipButtonLabel: 'Skip',
    saveButtonLabel: 'Save',
    imageWelcome: '',
    titleWelcome: 'You are now a KrisShopper',
    descriptionWelcome: '',
    continueShoppingButtonLabel: 'Continue Shopping',
  };
  const items = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1];
    const text = value.textContent.trim();
    const html = value.innerHTML.trim();

    if (key === 'title') config.title = text;
    if (key === 'description') config.description = html;
    if (key === 'description before checkbox') config.descriptionBeforeCheckbox = html;
    if (key === 'checkbox 1') config.descriptionForCheckBox1 = html;
    if (key === 'checkbox 2') config.descriptionForCheckBox2 = html;
    if (key === 'checkbox 3') config.descriptionForCheckBox3 = html;
    if (key === 'error message') config.errorMessage = text;
    if (key === 'join button label') config.joinKrisShopperButtonLabel = text;
    if (key === 'preferences title') config.titlePreferences = text;
    if (key === 'preferences description') config.descriptionPreferences = html;
    if (key === 'skip button label') config.skipButtonLabel = text;
    if (key === 'save button label') config.saveButtonLabel = text;
    if (key === 'welcome image') config.imageWelcome = text;
    if (key === 'welcome title') config.titleWelcome = text;
    if (key === 'welcome description') config.descriptionWelcome = html;
    if (key === 'continue shopping button label') config.continueShoppingButtonLabel = text;
    if (key === 'benefit' && cells.length >= 4) {
      items.push({
        image: text,
        title: cells[2].textContent.trim(),
        description: cells[3].innerHTML.trim(),
      });
    }
  });

  return { config, items };
}

function renderBenefit(item) {
  return `
    <div class="carouselSliderItem">
      <div class="carouselSliderImageContainer">
        <img class="carouselSliderImage" loading="lazy" src="${item.image}" alt="${item.title}">
      </div>
      <h4 class="carouselSliderTitle">${item.title}</h4>
      <div class="carouselSliderText">${item.description}</div>
    </div>
  `;
}

function renderCheckbox(html, errorMessage, required = false) {
  if (!html) return '';
  return `
    <div class="formItem formOptionFormItem${required ? ' formOptionFormItemRequire' : ''}">
      <div class="formItemContainer">
        <div class="formOptionContainer">
          <label class="formOptionFormLabel${required ? ' formItemlabelRequire' : ''}">
            ${html}
            ${required ? `<ul class="formErrors"><li class="formErrorsItem">${errorMessage}</li></ul>` : ''}
          </label>
          <div class="formOptionInputContainer">
            <input class="formOption" type="checkbox"${required ? ' data-required="true"' : ''}>
            <div class="formOptionRepresenter formOptionRepresenterCheckbox">
              <div class="formOptionRepresenterCheckboxCheckmark" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateButton(block) {
  const required = [...block.querySelectorAll('input[data-required="true"]')];
  const button = block.querySelector('.joinKrisshoperBtn button');
  if (button) button.disabled = required.some((input) => !input.checked);
}

export default function decorate(block) {
  const { config, items } = getConfig(block);

  block.classList.add('modal');
  block.dataset.activeStatePath = 'join.krisshopper';
  block.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-primary"></div>
      <div class="modal-header-title">Become a KrisShopper</div>
      <div class="modal-header-second">
        <button type="button" class="background-transparent navigation-close-button" data-behavior="closeModal" name="closeModalButton" aria-label="Close"></button>
      </div>
    </div>
    <div class="modal-scroll-content active krisshopperRegisterContainer m-pt30">
      <div class="modal-scroll-content-scroll">
        <div class="modal-scroll-content-inner">
          <div class="register-form-container">
            <h3 class="cmsHeadline cmsHeadlineH2 cmsHeadlineAlignCenter cmsGridColHalfGap krisshop-member">${config.title}</h3>
            <div class="cmsTextarea richtext cmsGridColHalfGap krisshop-member">${config.description}</div>
            <div class="carouselSliderContainer krisshop-member">
              <div class="carouselSliderWrapper">
                <div class="carouselSlide">${items.map(renderBenefit).join('')}</div>
              </div>
              <div class="formItemContainer mt35">
                <div class="formOptionContainer">
                  <label class="formOptionFormLabel text-color-bl">${config.descriptionBeforeCheckbox}</label>
                </div>
              </div>
            </div>
            <div class="krisshoper-register-form-content">
              <div class="modalKrisShopperSignUpForm">
                ${renderCheckbox(config.descriptionForCheckBox1, config.errorMessage)}
                ${renderCheckbox(config.descriptionForCheckBox2, config.errorMessage, true)}
                ${renderCheckbox(config.descriptionForCheckBox3, config.errorMessage, true)}
                <div class="modalButtons joinKrisshoperBtn">
                  <button class="button buttonSizeRegular buttonStylePrimary" disabled>
                    <span class="buttonContent">${config.joinKrisShopperButtonLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="ks-brandModal">
            <div class="modalKrisShopperCategoriesSelectionContent">
              <h2 class="text-color-bl1 cmsHeadline cmsHeadlineH2 cmsHeadlineAlignCenter cmsGridColHalfGap m-mt0">${config.titlePreferences}</h2>
              <div class="cmsRow text-color-bl">${config.descriptionPreferences}</div>
            </div>
            <form action="" method="post" id="ks-preferencesForm"><ul class="root-data-list"></ul></form>
            <div class="modalKrisShopperCategoriesSelectionButtons m-mt30 m-mb0">
              <button class="button buttonSizeRegular buttonStyleSecondary modalKrisShopperCategoriesSelectionSkip"><span class="buttonContent">${config.skipButtonLabel}</span></button>
              <button class="button buttonSizeRegular buttonStylePrimary modalKrisShopperCategoriesSelectionSave" type="button"><span class="buttonContent">${config.saveButtonLabel}</span></button>
            </div>
          </div>
          <div class="modalKrisShopperRegistrationSuccess">
            ${config.imageWelcome ? `<div class="modalHero mt0"><img loading="lazy" src="${config.imageWelcome}" alt="${config.titleWelcome}" class="modalHeroImage"></div>` : ''}
            <h2 class="cmsHeadline cmsHeadlineH2 cmsHeadlineAlignCenter cmsGridColHalfGap">${config.titleWelcome}</h2>
            <div class="cmsTextarea richtext cmsGridColHalfGap mb25">${config.descriptionWelcome}</div>
            <div class="modalButtons"><button class="button buttonSizeRegular buttonStylePrimary" type="button"><span class="buttonContent">${config.continueShoppingButtonLabel}</span></button></div>
          </div>
        </div>
      </div>
    </div>
    <div class="backdrop modal-backdrop" data-behavior="backdrop" data-state-path="backdrop.modal.opened"></div>
  `;

  block.querySelectorAll('.formOption').forEach((input) => {
    input.addEventListener('change', () => {
      input.closest('.formItemContainer')?.classList.toggle('formItemSelected', input.checked);
      updateButton(block);
    });
  });
  block.querySelector('[data-behavior="closeModal"]')?.addEventListener('click', () => block.classList.remove('modal-is-opened'));
  updateButton(block);
}
