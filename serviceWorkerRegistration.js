import { Workbox } from "workbox-window";

export default function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const wb = new Workbox("sw.js");

    wb.addEventListener("installed", (event) => {
      if (event.isUpdate) {
        if (
          confirm(
            `Доступно новое обновление!. Нажмите OK для перезагрузки страницы`,
          )
        ) {
          window.location.reload();
        }
      }
    });

    wb.register();
  }
}
