# Header XF EDS Authoring Contract

Source of truth: AEM XF JSON for `/content/experience-fragments/.../header`.

EDS mapping:

| AEM resourceType | EDS block |
| --- | --- |
| `krisshop/components/container` | EDS section/layout |
| `krisshop/components/content/cookies` | `cookie-consent` |
| `krisshop/components/content/htmlSource` | `html-source` |
| `krisshop/components/content/header` | `/nav` fragment rendered by `blocks/header` |
| `krisshop/components/content/becomeKrisShopperModelPopUp` | `become-krisshopper-modal` |
| `krisshop/components/content/sectionContainer` | EDS section containing nested blocks |

## XF Order

Author blocks in the same order as the XF:

1. `cookie-consent`
2. `html-source` for the traveller maintenance message
3. `/nav` header fragment
4. `become-krisshopper-modal`
5. `html-source` inside a section for traveller mode message
6. `html-source` inside a section for promo message

## Cookie Consent

| cookie-consent | |
| --- | --- |
| Description | By using the website, you are agreeing to our Privacy Policy, Terms & Conditions and the use of cookies in accordance with our Cookie Policy. |
| Button Label | Accept all cookies |
| Cookie Expiry Time | 365 |

## HTML Source

| html-source | |
| --- | --- |
| Source | `<div style="background-color: #000000; padding: 10px; text-align: center;" class="maintenanceMessageBlock"><p style="font-size: 14px; font-weight: bold; color: #ffffff;">Traveller mode: Shop tax & duty-free, delivered to your Singapore Airlines or Scoot flight.</p></div>` |

## Header `/nav`

| Section | |
| --- | --- |
| Logo | Krisshop |
| Logo Image Desktop | /content/dam/krisshop/sg/common/header/header/logo/kirsshop-logo.svg |
| Logo Image Mobile | /content/dam/krisshop/sg/common/header/header/logo/mobile-default-logo.svg |
| Home | /content/krisshop/sg/en |
| Segment | Non-Travellers |
| Categories | /en/category |
| Brands | /content/krisshop/sg/en/brands |
| Deals | /content/krisshop/sg/en/deals |
| Batik Label | /content/krisshop/sg/en/store/batik-label |
| New Arrivals | /content/krisshop/sg/en/store/newarrivals |
| Sale | /content/krisshop/sg/en/Sale |
| Search | /content/krisshop/sg/en/search/product |
| Cart | /content/krisshop/sg/en/cart |
| Account | /content/krisshop/sg/en/my-account |

## Target Segment Prompt

Use this block only where the AEM `targetSegment.html` prompt is required.

| target-segment-prompt | |
| --- | --- |
| Segment Banner Title | CHOOSE YOUR SHOPPING JOURNEY |
| Travellers Title | Flying soon? Shop duty-free products (with a Singapore Airlines/Scoot flight booking) |
| Travellers Button Label | TRAVELLER |
| Traveller Link | /content/krisshop/sg/en |
| Non Travellers Title | Not flying? More products available for home delivery |
| Non Travellers Button Label | NON-TRAVELLER |
| Non Traveller Link | /content/krisshop/sg/en |
| Travellers Reminder | The site is currently showing products that are available for Singapore Airlines and Scoot passengers. |
| Non Travellers Reminder | The site is currently showing products that are available for shoppers who are not travelling. |

## Become KrisShopper Modal

| become-krisshopper-modal | | | |
| --- | --- | --- | --- |
| Title | Be Rewarded for What You Love with KrisShopper | | |
| Description | Join KrisShop's loyalty programme to unlock more miles, exclusive deals and more. | | |
| Description Before Checkbox | Get S$5 KrisShop promo code when you link your account or get S$15 KrisShop promo code when you link your account and subscribe to KrisShopper news and promotions. | | |
| Benefit | /content/dam/krisshop/sg/common/header/member-benefit-1.png | Welcome bonus | Receive a welcome bonus of up to S$15 off |
| Checkbox 1 | I want to receive news and promotions from KrisShopper via email. | | |
| Checkbox 2 | I consent to Singapore Airlines sharing data with KrisShop for KrisShopper. | | |
| Checkbox 3 | I acknowledge and accept the Terms and Conditions of the KrisShopper Programme. | | |
| Error Message | This field is required. | | |
| Join Button Label | Join KrisShopper | | |
| Preferences Title | Tell us what you like! | | |
| Preferences Description | Choose all categories you like and enjoy a tailored shopping experience. | | |
| Skip Button Label | Skip | | |
| Save Button Label | Save | | |
| Welcome Image | /content/dam/krisshop/sg/common/header/generic-success.png | | |
| Welcome Title | You are now a KrisShopper | | |
| Welcome Description | Your preferences have been saved and can be edited at any time in your account settings. | | |
| Continue Shopping Button Label | Continue Shopping | | |
