export type WhatsOnStaticCard = {
  id: string;
  title: string;
  meta: string;
  img: string;
  alt: string;

  city: string; // NEW
  countryCode: string; // NEW (for dedupe)
};

export const febWhatsOnStatic: WhatsOnStaticCard[] = [
  {
    id: "feb-valentines",
    title: "Valentine’s Day",
    meta: "Feb · Paris",
    img: "/images/paris.jpg",
    alt: "Paris",
    city: "Paris",
    countryCode: "FR",
  },
  {
    id: "feb-ramadan",
    title: "Ramadan",
    meta: "Feb · Morocco",
    img: "/images/morocco.jpg",
    alt: "Morocco",
    city: "Marrakesh",
    countryCode: "MA",
  },
  {
    id: "feb-lunar-new-year",
    title: "Lunar New Year",
    meta: "Feb · Beijing",
    img: "/images/beijing.jpg",
    alt: "Beijing",
    city: "Beijing",
    countryCode: "CN",
  },
];
