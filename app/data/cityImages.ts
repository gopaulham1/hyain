// import { febWhatsOnStatic } from "@/data/whatsOnSoonStatic";

// // City -> your own curated image
// export const CITY_IMAGES: Record<string, string> = Object.fromEntries(
//   febWhatsOnStatic.map((c) => [c.city.toLowerCase(), c.img]),
// );

// // Optional fallback if you want a generic image:
// export const DEFAULT_CITY_IMAGE = "/images/world.jpg";

export const CITY_IMAGES: Record<string, string> = {
  paris: "/images/paris.jpg",
  london: "/images/london2.jpg",
  amsterdam: "/images/amsterdam.jpg", // change to your real file if needed
  trier: "/images/trier.jpg",
  berlin: "/images/trier.jpg",
  cologne: "/images/trier.jpg", // temporary if no cologne image
  munich: "/images/trier.jpg",
  hamburg: "/images/trier.jpg",
  barcelona: "/images/barcelona.jpg",
  rome: "/images/rome.jpg",
  beijing: "/images/beijing.jpg",
  marrakesh: "/images/morocco.jpg",
};

export const DEFAULT_CITY_IMAGE = "/images/world.jpg";
