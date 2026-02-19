export type WhatsOnCard = {
  id: string;
  title: string;
  meta: string; // e.g. "Feb · Paris"
  img: string;
  alt: string;

  city: string; // used for routing/search
  countryCode: string; // optional, handy later
};

export const whatsOnSoonCards: WhatsOnCard[] = [
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
    meta: "Feb · Marrakech",
    img: "/images/morocco.jpg",
    alt: "Marrakech",
    city: "Marrakech",
    countryCode: "MA",
  },
  {
    id: "feb-carnival",
    title: "Carnival",
    meta: "Feb · Rio De Janeiro",
    img: "/images/rio3.jpg",
    alt: "Rio De Janeiro",
    city: "Rio De Janeiro",
    countryCode: "BR",
  },
  {
    id: "feb-james-arthur",
    title: "James Arthur",
    meta: "Feb · London",
    img: "/images/london.jpg",
    alt: "London",
    city: "London",
    countryCode: "GB",
  },
  {
    id: "feb-jason-derulo",
    title: "Jason Derulo",
    meta: "Feb · Hamburg",
    img: "/images/trier.jpg",
    alt: "Hamburg, Germany",
    city: "Hamburg",
    countryCode: "DE",
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
  // add 3 more for your 2nd column
];
