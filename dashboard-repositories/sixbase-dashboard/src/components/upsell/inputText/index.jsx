import { Form } from 'react-bootstrap';
import './style.scss';

export const InputText = (props) => {
  const { form, isActive, name, placeholder, label } = props;
  return (
    <InputText.InputWrapper label={label}>
      <Form.Control
        {...form.register(name)}
        name={name}
        placeholder={placeholder}
        className='input-text'
        disabled={!isActive}
      />
      <InputText.FieldError message={form.formState?.errors?.[name]?.message} />
    </InputText.InputWrapper>
  );
};

// eslint-disable-next-line react/display-name
InputText.InputWrapper = function (props) {
  const { label, children } = props;
  return (
    <div className='input-native-upsell'>
      <label>{label}</label>
      {children}
    </div>
  );
};

// eslint-disable-next-line react/display-name
InputText.FieldError = function (props) {
  const { message } = props;

  if (!message || (message && message.length === 0)) return <></>;

  return (
    <div className='form-error' id='cep_help'>
      <span>{message}</span>
    </div>
  );
};
