import { Col, Form } from "react-bootstrap";

export const UTMField = ({ name, label, register, value, onChange }) => (
  <Col md={6}>
    <div className='form-group'>
      <label htmlFor={name}>{label}</label>
      <Form.Control
        type='text'
        className='form-control filter-sales'
        placeholder={name}
        name={name}
        ref={register}
        defaultValue={value}
        onChange={onChange}
      />
    </div>
  </Col>
);
