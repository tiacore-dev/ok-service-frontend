export const dateFormat = "DD.MM.YYYY";
export const dateTimeFormat = "DD.MM.YYYY HH:mm";
export const timeFormat = "HH:mm";

export const dateToLocalString = (string: string) => {
  const timestamp = Date.parse(string);
  if (timestamp > 0) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ru");
  }
};

export const timeToLocalString = (string: string) => {
  const timestamp = Date.parse(string);
  if (timestamp > 0) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ru", { timeStyle: "short" });
  }
};
