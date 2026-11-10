export const isValidWorkPrice = (price: unknown): price is number =>
  typeof price === "number" &&
  Number.isFinite(price) &&
  (price >= 0 || price === -1);

export const formatWorkPrice = (price?: number | null): string =>
  price == null ? "-" : `${price} руб.`;
