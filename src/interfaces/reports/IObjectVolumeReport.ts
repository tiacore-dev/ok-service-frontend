// Интерфейс для отчета по объемам по объектам
export interface IObjectVolumeReport {
  date_from: string;
  date_to: string;
  objects: IObjectVolumeReportObject[];
}

export interface IObjectVolumeReportObject {
  name: string; // Наименование объекта
  projects: IObjectVolumeReportProject[];
}

export interface IObjectVolumeReportProject {
  name: string; // Наименование спецификации (проекта)
  project_details: IObjectVolumeReportProjectDetail[];
}

export interface IObjectVolumeReportProjectDetail {
  name: string; // Наименование записи спецификации
  quantity: number | null; // Количество суммированное по всем записям отчетов по смене за период
}
