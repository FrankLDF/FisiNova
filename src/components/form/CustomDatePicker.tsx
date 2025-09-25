import React from 'react';
import { DatePicker, TimePicker, type DatePickerProps, type TimePickerProps } from 'antd';

interface CustomDatePickerProps extends DatePickerProps {
  readOnly?: boolean;
}

interface CustomTimePickerProps extends TimePickerProps {
  readOnly?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  readOnly = false,
  className,
  disabled,
  ...props
}) => {
  const finalClassName = readOnly 
    ? `${className || ''} custom-readonly`.trim()
    : className;
  
  return (
    <DatePicker
      {...props}
      className={finalClassName}
      disabled={readOnly || disabled}
    />
  );
};

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  readOnly = false,
  className,
  disabled,
  ...props
}) => {
  const finalClassName = readOnly 
    ? `${className || ''} custom-readonly`.trim()
    : className;
  
  return (
    <TimePicker
      {...props}
      className={finalClassName}
      disabled={readOnly || disabled}
    />
  );
};

export const { RangePicker } = DatePicker;