export const dateFormat = "DD.MM.YYYY";
export const dateTimeFormat = "DD.MM.YYYY HH:mm";
export const timeFormat = "HH:mm";

// export const dateToLocalString = (string: string) => {
//   const timestamp = Date.parse(string);
//   if (timestamp > 0) {
//     const date = new Date(timestamp);
//     return date.toLocaleDateString("ru");
//   }
// };

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

export const getTenDaysAgo = () => {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  tenDaysAgo.setHours(0, 0, 0, 0);
  return tenDaysAgo;
};

export const getToday = () => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  return todayDate;
};

export const getLast21stDate = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  let targetMonth, targetYear;

  if (currentDay >= 21) {
    // Если сегодня 21 или позже, берем 21 число текущего месяца
    targetMonth = currentMonth;
    targetYear = currentYear;
  } else {
    // Если сегодня раньше 21, берем 21 число предыдущего месяца
    targetMonth = currentMonth - 1;
    targetYear = currentYear;

    // Если текущий месяц январь (0), то предыдущий месяц будет декабрь (11) предыдущего года
    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    }
  }

  // Создаем дату 21 числа нужного месяца и года
  const last21stDate = new Date(targetYear, targetMonth, 21);

  return last21stDate;
};
