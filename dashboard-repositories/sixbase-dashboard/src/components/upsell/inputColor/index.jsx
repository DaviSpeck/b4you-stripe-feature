import './style.scss';

export const InputColor = (props) => {
  const { isActive, form, name, label } = props;
  return (
    <div className='wrapper-input-color-field'>
      <label
        htmlFor='color-input-label'
        style={{
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </label>
      <div
        className={
          !isActive ? 'input-color input-color-disabled' : 'input-color'
        }
        disabled={!isActive}
      >
        <input
          type='color'
          name={name}
          disabled={!isActive}
          {...form.register(name)}
        />
        <input value={form.getValues(name)} disabled type='text' />
      </div>
    </div>
  );
};
