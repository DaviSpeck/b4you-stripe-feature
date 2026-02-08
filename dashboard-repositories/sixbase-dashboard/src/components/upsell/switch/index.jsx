import './style.scss';
import { Controller } from 'react-hook-form7';

export const SwitchInput = ({
  form,
  label,
  name,
  isActive = true,
  style = {},
}) => {
  return (
    <div className='wrapper-switch-media' style={style}>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <label className='switch'>
            <input
              type='checkbox'
              disabled={!isActive}
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <span className='slider round'></span>
          </label>
        )}
      />
      <span className='label-switch'>{label}</span>
    </div>
  );
};
