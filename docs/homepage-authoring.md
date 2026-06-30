# Home Page EDS Authoring Contract

This documents the first KSO home page migration slice.
Author these blocks as EDS tables in DA, Google Drive, or SharePoint.

## Hero Carousel

| hero-carousel | | | | | | | |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Image | Mobile Image | Eyebrow | Title | Description | CTA Text | CTA Link | Target |
| /media/home/hero.jpg | /media/home/hero-mobile.jpg | Exclusive | Shop travel essentials | Curated duty-free picks for your next trip. | Shop now | /en/category/travel | _self |

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
| GraphQL URL | https://example.com/graphql |
| Store Code | ks_online_sg_en |
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
