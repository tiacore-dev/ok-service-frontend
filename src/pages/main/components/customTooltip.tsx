import React from "react";
import { TooltipProps } from "recharts";
import "./customTooltip.less";

export const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div
      className="custom-tooltip"
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
          <ul className="custom-tooltip__list">
            {data.notOpenedData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
      {!!data.empty && (
        <div>
          Не заполнено: {data.empty}
          <ul className="custom-tooltip__list">
            {data.emptyData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
      {!!data.notSigned && (
        <div>
          Не согласовано: {data.notSigned}
          <ul className="custom-tooltip__list">
            {data.notSignedData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
      {!!data.signed && (
        <div>
          Согласовано: {data.signed}
          <ul className="custom-tooltip__list">
            {data.signedData.map((el: string) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
