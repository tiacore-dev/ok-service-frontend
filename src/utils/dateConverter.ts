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

export const dateTimestampToLocalString = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("ru");
};

export const timeToLocalString = (string: string) => {
  const timestamp = Date.parse(string);
  if (timestamp > 0) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ru", { timeStyle: "short" });
  }
};

export const formatDate = (d: Date) => {
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
