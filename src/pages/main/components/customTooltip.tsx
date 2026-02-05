import React from "react";
import { TooltipProps } from "recharts";

export const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div
      style={{
        background: "#fff",
        padding: "4px 10px",
        border: "1px solid #ccc",
        borderRadius: 4,
        overflowY: "auto",
        maxHeight: 300,
        pointerEvents: "auto",
      }}
      onWheel={(e) => {
        const target = e.currentTarget;
        const canScroll = target.scrollHeight > target.clientHeight;
        if (canScroll) {
          e.stopPropagation();
        }
      }}
    >
      <div>
        <strong>{label}</strong>
      </div>
      {!!data.notOpened && (
        <div>
          Не открыто: {data.notOpened}
          <ul style={{ fontSize: "9pt" }}>
            {data.notOpenedData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
      {!!data.empty && (
        <div>
          Не заполнено: {data.empty}
          <ul style={{ fontSize: "9pt" }}>
            {data.emptyData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
      {!!data.notSigned && (
        <div>
          Не согласовано: {data.notSigned}
          <ul style={{ fontSize: "9pt" }}>
            {data.notSignedData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
      {!!data.signed && (
        <div>
          Согласовано: {data.signed}
          <ul style={{ fontSize: "9pt" }}>
            {data.signedData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
