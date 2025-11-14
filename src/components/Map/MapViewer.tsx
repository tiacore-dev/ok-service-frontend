import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Space, Typography, Alert } from "antd";
import { EyeOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Coordinate {
  lat: number;
  lng: number;
  title?: string;
  color?: string;
}

interface MapViewerProps {
  coordinates: Coordinate | Coordinate[];
  buttonType?: "icon" | "text" | "both";
  buttonText?: string;
  modalTitle?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export const MapViewer: React.FC<MapViewerProps> = ({
  coordinates,
  buttonType = "icon",
  buttonText = "Посмотреть на карте",
  modalTitle = "Просмотр на карте",
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  const points = Array.isArray(coordinates) ? coordinates : [coordinates];

  useEffect(() => {
    if (!isModalVisible) return;

    // Проверяем, не загружены ли уже Яндекс Карты
    if (window.ymaps) {
      initializeMap();
      return;
    }

    // Проверяем, не загружается ли уже скрипт
    if (scriptLoadedRef.current) {
      return;
    }

    scriptLoadedRef.current = true;
    setIsLoading(true);

    // Загружаем Яндекс Карты
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.async = true;

    script.onload = () => {
      window.ymaps.ready(() => {
        initializeMap();
      });
    };

    script.onerror = () => {
      setError("Не удалось загрузить Яндекс Карты");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Очистка при размонтировании компонента
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [isModalVisible]);

  const initializeMap = () => {
    if (!mapContainerRef.current || points.length === 0) return;

    try {
      // Убедимся, что предыдущая карта уничтожена
      if (mapRef.current) {
        mapRef.current.destroy();
      }

      // Определяем центр карты
      const center =
        points.length === 1
          ? [points[0].lat, points[0].lng]
          : calculateCenter(points);

      // Создаем новую карту
      mapRef.current = new window.ymaps.Map(mapContainerRef.current, {
        center: center,
        zoom: points.length === 1 ? 15 : 12,
        controls: ["zoomControl", "fullscreenControl"],
      });

      // Добавляем точки на карту
      points.forEach((point, index) => {
        const preset =
          point.color === "red"
            ? "islands#redIcon"
            : point.color === "blue"
              ? "islands#blueIcon"
              : "islands#darkOrangeIcon";

        const marker = new window.ymaps.Placemark(
          [point.lat, point.lng],
          {
            hintContent: point.title || `Точка ${index + 1}`,
            balloonContent:
              point.title || `Координаты: ${point.lat}, ${point.lng}`,
          },
          {
            preset: preset,
            draggable: false,
          }
        );

        mapRef.current.geoObjects.add(marker);
      });

      // Если точек несколько, устанавливаем подходящие границы
      if (points.length > 1) {
        mapRef.current.setBounds(mapRef.current.geoObjects.getBounds(), {
          checkZoomRange: true,
        });
      }

      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError("Ошибка при инициализации карты");
      setIsLoading(false);
    }
  };

  const calculateCenter = (points: Coordinate[]): [number, number] => {
    const avgLat =
      points.reduce((sum, point) => sum + point.lat, 0) / points.length;
    const avgLng =
      points.reduce((sum, point) => sum + point.lng, 0) / points.length;
    return [avgLat, avgLng];
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setError(null);
  };

  const renderButton = () => {
    if (buttonType === "icon") {
      return (
        <Button
          type="link"
          icon={<EyeOutlined style={{ color: "red" }} />}
          onClick={handleOpenModal}
          disabled={disabled}
          title={buttonText}
          size="small"
        />
      );
    }

    if (buttonType === "text") {
      return (
        <Button
          type="link"
          onClick={handleOpenModal}
          disabled={disabled}
          size="small"
        >
          {buttonText}
        </Button>
      );
    }

    return (
      <Button
        type="link"
        icon={<EyeOutlined style={{ color: "red" }} />}
        onClick={handleOpenModal}
        disabled={disabled}
        size="small"
      >
        {buttonText}
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Закрыть
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 1200 }}
        destroyOnClose={true}
      >
        {error && (
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {points.length === 0 ? (
          <Text type="secondary">Нет координат для отображения</Text>
        ) : (
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "500px",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#999",
                }}
              >
                Загрузка карты...
              </div>
            )}
          </div>
        )}

        {points.length > 0 && !isLoading && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Отображаемые точки:</Text>
            <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
              {points.map((point, index) => (
                <li key={index}>
                  <Text>
                    {point.title || `Точка ${index + 1}`}: {point.lat},{" "}
                    {point.lng}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  );
};
