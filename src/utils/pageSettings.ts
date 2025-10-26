import { isMobile } from "./isMobile";

export const minPageHeight = () => {
  const clientHeight = document.documentElement.clientHeight;

  return isMobile() ? `${clientHeight - 110}px` : `${clientHeight - 108}px`;
};

export const pageHeight = () => {
  const scrollHeight = document.documentElement.scrollHeight;

  return isMobile() ? `${scrollHeight - 70}px` : `${scrollHeight - 70}px`;
};

export const minLeftMenuHeight = () => {
  const clientHeight = document.documentElement.clientHeight;

  return `${clientHeight - 161}px`;
};

export const pageWidth = () => {
  return document.documentElement.scrollWidth;
};

export const getModalWidth = () => {
  return `${Math.min(pageWidth() - 16, 500)}px`;
};

export const getModalContentWidth = () => {
  return `${Math.min(pageWidth() - 16, 500) - 48}px`;
};
