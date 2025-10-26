// Интерфейс для отчета по объемам по объектам
export interface IUsersReport {
  date_from: string;
  date_to: string;
  users: IUserReportData[];
}

export interface IUserReportData {
  name: string;
  projects: IUserProjectsReportData[];
  total: number;
}

export interface IUserProjectsReportData {
  date: string; // дата
  name: string; // Наименование спецификации (проекта)
  summ: number; // сумма
}
