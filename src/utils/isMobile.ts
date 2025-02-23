export const isMobile = (): boolean => {
  const pageWidth = document.documentElement.scrollWidth;
  return pageWidth < 768;
};
