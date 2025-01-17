import { isMobile } from "./isMobile";

export const minPageHeight = () => {
  const clientHeight = document.documentElement.clientHeight;

  return isMobile() ? `${clientHeight - 110}px` : `${clientHeight - 171}px`;
};

export const pageHeight = () => {
  const scrollHeight = document.documentElement.scrollHeight;

  return isMobile() ? `${scrollHeight - 70}px` : `${scrollHeight - 134}px`;
};

export const minLeftMenuHeight = () => {
  const clientHeight = document.documentElement.clientHeight;

  return `${clientHeight - 161}px`;
};
