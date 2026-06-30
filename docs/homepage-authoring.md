# Home Page EDS Authoring Contract

This documents the first KSO home page migration slice.
Author these blocks as EDS tables in DA, Google Drive, or SharePoint.

## Hero Carousel

| hero-carousel | | | | | | | |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Image | Mobile Image | Eyebrow | Title | Description | CTA Text | CTA Link | Target |
| https://images.krisshop.com/cms/1Ke_czY0Z0Qv0Xhw6xJopy22RDyVs9tmcRb55ao65to/1600x/bWVkaWEvZ2VuZS1jbXMvay9zL2tzc2RfbWFyMjNfa3NvXzMyMDB4MTIwMC5qcGc | https://images.krisshop.com/cms/xFqmNnDgyhBpyEi4YalRcC5FudZCnyFlZjjcth4PJ7Q/768x/bWVkaWEvZ2VuZS1jbXMvay9zL2tzc2RfbWFyMjNfa3NvXzE1MzR4ODY0LmpwZw |  | KrisShop deals |  |  | /en/category/travel | _self |
| https://images.krisshop.com/cms/WrYe_wdr2W6E8Vncl4ZzIfp1afvlCr7ujIDLoCPfYHI/1600x/bWVkaWEvZ2VuZS1jbXMvbS9tL21tZF9tYXIyM19rc29fMzIwMHgxMjAwXzJfLmpwZw | https://images.krisshop.com/cms/AUVdNKXNAEsPLmduXV_vNwYHyUpyFkgp3plWjtCe2RQ/768x/bWVkaWEvZ2VuZS1jbXMvbS9tL21tZF9tYXIyM19rc29fMTUzNHg4NjRfMV8xXy5qcGc |  | KrisShop monthly deals |  |  | /en/promotions | _self |

## Quick Links

| quick-links | | | | |
| --- | --- | --- | --- | --- |
| Icon | Title | Description | Link | Target |
| /icons/search.svg | Earn miles | Shop and collect miles on eligible purchases. | /en/earn-miles | _self |

## Product Carousel

| product-carousel | |
| --- | --- |
| Title | New arrivals |
| Category IDs | 123 |
| SKUs | SKU-1,SKU-2 |
| Brand IDs | |
| Topic IDs | |
| Price Min | |
| Price Max | |
| Sort | newfromdate\|DESC |
| Count | 8 |
| GraphQL URL | https://mcstaging.krisshop.com/graphql |
| Store Code | default |
| Content Currency | SGD |
| Product Base Path | /en/product |

## Image

| image | | | | |
| --- | --- | --- | --- | --- |
| Image | Mobile Image | Alt Text | Caption | Link |
| /media/home/promo.jpg | /media/home/promo-mobile.jpg | Promotion banner | | /en/promotions |

## Header/Footer

Header and footer use standard EDS fragments:

- `/nav` for header navigation.
- `/footer` for footer content.
- Page metadata can override paths with `nav` and `footer`.

Recommended `/nav` table:

| Section | |
| --- | --- |
| Logo | KrisShop |
| Home | / |
| Notice | Delivery Notice: Overseas Delivery Charge has been updated for selected countries. |
| Promo | Enjoy20% off miles redemption with a lowered redemption rate. |
| Journey Title | CHOOSE YOUR SHOPPING JOURNEY |
| Traveller Title | Flying soon? Shop duty-free products (with a Singapore Airlines/Scoot flight booking) |
| Traveller Label | TRAVELLER |
| Traveller Link | /en/traveller |
| Non Traveller Title | Not flying? More products available for home delivery |
| Non Traveller Label | NON-TRAVELLER |
| Non Traveller Link | /en |
| Segment | Non-Travellers |
| Categories | /en/category |
| Brands | /en/brands |
| Deals | /en/promotions |
| Batik Label | /en/batik-label |
| New Arrivals | /en/new-arrivals |
| Search | /en/search |
| Cart | /en/cart |
| Account | /en/account |
