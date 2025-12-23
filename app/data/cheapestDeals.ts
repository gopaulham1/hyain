export type CheapestDeal = {
  city: string;
  month: string;
  price: string; // keep as string so you can store "£24"
  img: string;
  alt: string;
};

export const cheapestDeals: CheapestDeal[] = [
  {
    city: "Paris",
    month: "Feb",
    price: "£24",
    img: "/images/paris.jpg",
    alt: "Paris",
  },
  {
    city: "Rome",
    month: "Jan",
    price: "£39",
    img: "/images/rome.jpg",
    alt: "Rome",
  },
  {
    city: "Barcelona",
    month: "Nov",
    price: "£55",
    img: "/images/barcelona.jpg",
    alt: "Barcelona",
  },
] as const;
