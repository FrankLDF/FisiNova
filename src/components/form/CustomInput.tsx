import React from 'react';
import { Input, type InputProps } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import './customInput.css'; // Importar estilos globales

interface CustomInputProps extends InputProps {
  readOnly?: boolean;
}

interface CustomTextAreaProps extends TextAreaProps {
  readOnly?: boolean;
}

interface CustomPasswordProps extends InputProps {
  readOnly?: boolean;
}

const useReadOnlyClass = (readOnly: boolean, existingClassName?: string) => {
  return readOnly 
    ? `${existingClassName || ''} custom-readonly`.trim()
    : existingClassName;
};

const BaseCustomInput: React.FC<CustomInputProps> = ({
  readOnly = false,
  className,
  disabled,
  ...props
}) => {
  const finalClassName = useReadOnlyClass(readOnly, className);
  
  return (
    <Input
      {...props}
      className={finalClassName}
      disabled={readOnly || disabled}
    />
  );
};

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  readOnly = false,
  className,
  disabled,
  ...props
}) => {
  const finalClassName = useReadOnlyClass(readOnly, className);
  
  return (
    <Input.TextArea
      {...props}
      className={finalClassName}
      disabled={readOnly || disabled}
    />
  );
};

const CustomPassword: React.FC<CustomPasswordProps> = ({
  readOnly = false,
  className,
  disabled,
  ...props
}) => {
  const finalClassName = useReadOnlyClass(readOnly, className);
  
  return (
    <Input.Password
      {...props}
      className={finalClassName}
      disabled={readOnly || disabled}
    />
  );
};

export const CustomInput = Object.assign(BaseCustomInput, {
  TextArea: CustomTextArea,
  Password: CustomPassword,
  Search: Input.Search,
  Group: Input.Group,
});