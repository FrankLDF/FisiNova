import React from 'react';
import { Select, type SelectProps } from 'antd';

interface CustomSelectProps extends SelectProps {
  readOnly?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  readOnly = false,
  className,
  disabled,
  ...props
}) => {
  const finalClassName = readOnly 
    ? `${className || ''} custom-readonly`.trim()
    : className;
  
  return (
    <Select
      {...props}
      className={finalClassName}
      disabled={readOnly || disabled}
    />
  );
};

export const { Option, OptGroup } = Select;