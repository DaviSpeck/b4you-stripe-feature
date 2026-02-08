import './style.scss';

export const InputSize = (props) => {
  const { label, form, name, isActive } = props;
  return (
    <div className='wrapper-input-font-size'>
      <label
        htmlFor='font-size-label'
        style={{
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </label>
      <div className='input-font-size'>
        <input
          type='text'
          name={name}
          disabled={!isActive}
          {...form.register(name)}
        />
        <span>px</span>
      </div>
      {form.formState.errors[name] && (
        <InputSize.FieldError message='Campo obrigatório' />
      )}
    </div>
  );
};

// eslint-disable-next-line react/display-name
InputSize.FieldError = function (props) {
  const { message } = props;

  if (!message || (message && message.length === 0)) return <></>;

  return (
    <div className='form-error' id='cep_help'>
      <span>{message}</span>
    </div>
  );
};
