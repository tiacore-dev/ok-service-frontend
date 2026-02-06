import React, { useState, useEffect, useRef } from "react";
import { Button, Space, InputNumber, Typography, Alert } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import "./MapPicker.less";

const { Text } = Typography;

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onCoordinatesSelect: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export const MapPicker: React.FC<MapPickerProps> = ({
  initialLat = 55.030204,
  initialLng = 82.92043,
  onCoordinatesSelect,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
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
      markerRef.current = null;
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    try {
      // Убедимся, что предыдущая карта уничтожена
      if (mapRef.current) {
        mapRef.current.destroy();
      }

      // Создаем новую карту
      mapRef.current = new window.ymaps.Map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 10,
        controls: ["zoomControl", "fullscreenControl"],
      });

      // Создаем маркер
      markerRef.current = new window.ymaps.Placemark(
        [initialLat, initialLng],
        {
          hintContent: "Перетащите маркер или кликните по карте",
          balloonContent: `Координаты: ${initialLat}, ${initialLng}`,
        },
        {
          draggable: true,
          preset: "islands#redIcon",
        }
      );

      // Добавляем маркер на карту
      mapRef.current.geoObjects.add(markerRef.current);

      // Обработчик клика по карте
      mapRef.current.events.add("click", (e: any) => {
        const coords = e.get("coords");
        updateCoordinates(coords[0], coords[1]);
      });

      // Обработчик перетаскивания маркера
      markerRef.current.events.add("dragend", () => {
        const coords = markerRef.current.geometry.getCoordinates();
        updateCoordinates(coords[0], coords[1]);
      });

      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError("Ошибка при инициализации карты");
      setIsLoading(false);
    }
  };

  const updateCoordinates = (newLat: number, newLng: number) => {
    const roundedLat = Number(newLat.toFixed(6));
    const roundedLng = Number(newLng.toFixed(6));

    setLat(roundedLat);
    setLng(roundedLng);

    // Обновляем подпись маркера
    if (markerRef.current) {
      markerRef.current.properties.set({
        balloonContent: `Координаты: ${roundedLat}, ${roundedLng}`,
      });
    }
  };

  const handleManualCoordinateChange = () => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.geometry.setCoordinates([lat, lng]);
      mapRef.current.setCenter([lat, lng]);

      // Обновляем подпись маркера
      markerRef.current.properties.set({
        balloonContent: `Координаты: ${lat}, ${lng}`,
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = Number(position.coords.latitude.toFixed(6));
          const newLng = Number(position.coords.longitude.toFixed(6));

          updateCoordinates(newLat, newLng);

          if (markerRef.current && mapRef.current) {
            markerRef.current.geometry.setCoordinates([newLat, newLng]);
            mapRef.current.setCenter([newLat, newLng]);
          }
        },
        (error) => {
          console.error("Ошибка получения геолокации:", error);
          let errorMessage = "Не удалось получить текущее местоположение.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Информация о местоположении недоступна.";
              break;
            case error.TIMEOUT:
              errorMessage = "Время ожидания получения местоположения истекло.";
              break;
          }

          setError(errorMessage);
        }
      );
    } else {
      setError("Геолокация не поддерживается вашим браузером");
    }
  };

  const handleConfirm = () => {
    onCoordinatesSelect(lat, lng);
  };

  return (
    <div className="map-picker">
      <Space direction="vertical" className="map-picker__content" size="middle">
        {error && (
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <div>
          <Text strong>
            Выберите точку на карте или введите координаты вручную:
          </Text>
        </div>

        <Space size="middle" wrap>
          <InputNumber
            value={lat}
            onChange={(value) => setLat(value || 0)}
            placeholder="Широта"
            min={-90}
            max={90}
            precision={6}
            step={0.0001}
            className="map-picker__coordinate-input"
          />
          <InputNumber
            value={lng}
            onChange={(value) => setLng(value || 0)}
            placeholder="Долгота"
            min={-180}
            max={180}
            precision={6}
            step={0.0001}
            className="map-picker__coordinate-input"
          />
          <Button onClick={handleManualCoordinateChange} disabled={isLoading}>
            Применить координаты
          </Button>
          <Button
            icon={<EnvironmentOutlined />}
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
          >
            Текущее местоположение
          </Button>
        </Space>

        <div
          ref={mapContainerRef}
          className={[
            "map-picker__map",
            isLoading ? "map-picker__map--loading" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isLoading && (
            <div
              className="map-picker__loading"
            >
              Загрузка карты...
            </div>
          )}
        </div>

        <div>
          <Text type="secondary">
            Выбранные координаты: {lat}, {lng}
          </Text>
        </div>

        <div className="map-picker__actions">
          <Button type="primary" onClick={handleConfirm} disabled={isLoading}>
            Использовать эти координаты
          </Button>
        </div>
      </Space>
    </div>
  );
};
