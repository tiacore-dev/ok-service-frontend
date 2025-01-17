import { Button, Descriptions, Space } from "antd";
import * as React from "react";
import { useDispatch } from "react-redux";
import {
  IauthToken,
  useAuthData,
  // checkPermission,
} from "../../../hooks/useAuth";
import { authlogout } from "../../../store/modules/auth";
import { useloadSourse } from "../../../components/App/App";
// import { clearParcelsSettingsState } from "../../../store/modules/settings/parcels";
// import { clearParcelsState } from "../../../store/modules/pages/parcels";
// import { clearCitiesState } from "../../../store/modules/dictionaries/cities";
// import { clearTemplatesState } from "../../../store/modules/dictionaries/templates";
// import { clearParcelState } from "../../../store/modules/pages/parcel";
// import { clearCreateParcelState } from "../../../store/modules/editableEntities/editableParcel";
// import { clearPricesState } from "../../../store/modules/pages/prices";
// import { clearDocumentsState } from "../../../store/modules/pages/documents";
// import { clearParcelsAsignedState } from "../../../store/modules/pages/parcelsAsigned";
// import { clearParcelsAsignedSettingsState } from "../../../store/modules/settings/parcelsAsigned";
// import { clearParcelsInStorageSettingsState } from "../../../store/modules/settings/parcelsInStorage";
// import { clearParcelsInStorageState } from "../../../store/modules/pages/parcelsInStorage";
// import { clearCreateManifestState } from "../../../store/modules/editableEntities/editableManifest";

interface notificationsSubscribeData {
  authToken: IauthToken;
  endpoint: string;
  p256dh: string;
  auth: string;
}
interface notificationsSubscribeResponse {
  status: boolean;
}

export const Account = () => {
  const data = useAuthData();
  const dispatch = useDispatch();

  // const handleSubscribe = React.useCallback(async () => {
  //   try {
  //     const registration = await navigator.serviceWorker.ready;
  //     const subscription = await registration.pushManager.subscribe({
  //       userVisibleOnly: true,
  //       applicationServerKey: process.env.REACT_APP_WP_SVS,
  //     });

  //     const subscriptionData = JSON.parse(JSON.stringify(subscription));

  //     useApi<notificationsSubscribeResponse, notificationsSubscribeData>(
  //       "notifications",
  //       "subscribe",
  //       {
  //         authToken: token,
  //         endpoint: subscriptionData.endpoint,
  //         p256dh: subscriptionData.keys.p256dh,
  //         auth: subscriptionData.keys.auth,
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error subscribing to Push:", error);
  //   }
  // }, []);

  const { load, clearStates } = useloadSourse();
  const refresh = () => {
    clearStates();
    load();
  };

  return (
    <>
      <Descriptions
        title="Данные пользователя"
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Имя пользователя">
          {data.name}
        </Descriptions.Item>
      </Descriptions>
      <Space direction="vertical">
        <Button size="large" onClick={refresh}>
          Обновить данные
        </Button>
        {/* <Button size="large" onClick={handleSubscribe}>
          Подписаться
        </Button> */}

        <Button
          size="large"
          onClick={() => {
            // dispatch(clearParcelsSettingsState());
            // dispatch(clearParcelsState());
            // dispatch(clearParcelsAsignedState());
            // dispatch(clearParcelsAsignedSettingsState());
            // dispatch(clearParcelsInStorageSettingsState());
            // dispatch(clearParcelsInStorageState());
            // dispatch(clearCitiesState());
            // dispatch(clearCitiesState());
            // dispatch(clearTemplatesState());
            // dispatch(clearParcelState());
            // dispatch(clearCreateParcelState());
            // dispatch(clearCreateManifestState());
            // dispatch(clearPricesState());
            // dispatch(clearDocumentsState());
            dispatch(authlogout());
          }}
        >
          Выход
        </Button>
      </Space>
    </>
  );
};
