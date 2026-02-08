import { Col } from 'react-bootstrap';
import Switch from 'react-switch';

export const FilterSwitchList = ({ item, checked, onChange, prefix }) => {
  return (
    <Col key={item.key} md={12} lg={6}>
      <div className='d-flex align-items-center mb-3'>
        <Switch
          checked={checked}
          checkedIcon={false}
          uncheckedIcon={false}
          onColor='#475569'
          offColor='#e0e0e0'
          onHandleColor='#fff'
          boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
          activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
          handleDiameter={24}
          height={30}
          width={56}
          className='react-switch'
          name={prefix}
          id={`${prefix}_${item.key}`}
          onChange={onChange}
        />

        <label
          htmlFor={`${prefix}_${item.key}`}
          className='switch-label mb-0 ml-2'
        >
          {item.label || item.name}
        </label>
      </div>
    </Col>
  );
};
