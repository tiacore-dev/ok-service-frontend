export const formatNumber = (num: number) => {
  return num.toLocaleString("ru-RU", {
    style: "currency", // Добавляет ₽ (если локаль ru-RU)
    currency: "RUB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
