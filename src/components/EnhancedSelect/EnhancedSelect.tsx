import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd/lib/select";
import "./EnhancedSelect.less";

// Расширяем тип опций, добавляя поддержку title
export interface EnhancedSelectOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  title?: string;
  [key: string]: any; // Для поддержки дополнительных свойств
}

// Расширяем пропсы SelectProps, чтобы принимать наши опции
export interface EnhancedSelectProps
  extends Omit<SelectProps<any, any>, "options"> {
  options?: EnhancedSelectOption[];
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = (props) => {
  const { options, children, ...restProps } = props;

  // Преобразуем опции, добавляя title если его нет
  const enhancedOptions = options?.map((option) => {
    // Если title не указан, используем строковое представление label
    if (!option.title) {
      let title = "";
      if (typeof option.label === "string") {
        title = option.label;
      } else if (React.isValidElement(option.label)) {
        // Если label - React элемент, пытаемся извлечь текст
        const labelElement = option.label as React.ReactElement;
        if (typeof labelElement.props.children === "string") {
          title = labelElement.props.children;
        }
      }
      return { ...option, title };
    }
    return option;
  });

  return (
    <Select
      className="enhanced-select"
      optionLabelProp="title"
      optionFilterProp="title"
      dropdownClassName="enhanced-select-dropdown"
      options={enhancedOptions}
      showSearch
      {...restProps}
    >
      {children}
    </Select>
  );
};
