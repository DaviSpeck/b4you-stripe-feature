import { FaCircleCheck } from 'react-icons/fa6';

export const Step = (props) => {
  const { data } = props;

  const { stepColorBackground, stepColor } = data;

  return (
    <header
      style={{ backgroundColor: stepColorBackground, paddingTop: '40px' }}
    >
      <div style={{ display: 'flex' }}>
        <Step.ItemCheck label='Pedido' color={stepColor} isChecked />
        <Step.ItemCheck label='Compra efetuada' color={stepColor} isChecked />
        <Step.ItemCheck label='Você está aqui' color={stepColor} isCurrent />
        <Step.ItemCheck
          label='Pedido Finalizado'
          color={stepColor}
          isUncheck
          isLastItem
        />
      </div>
    </header>
  );
};

// eslint-disable-next-line react/display-name
Step.ItemCheck = (props) => {
  const { label, color, isLastItem, isChecked, isCurrent, isUncheck } = props;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '4px',
        marginLeft: '-2px',
      }}
    >
      <div style={{ padding: '1px', display: 'flex', alignItems: 'center' }}>
        {isCurrent && (
          <div
            style={{
              border: '2px solid gray',
              padding: '2px',
              borderRadius: '999px',
            }}
          >
            <div
              style={{
                backgroundColor: color,
                width: '10px',
                height: '10px',
                borderRadius: '999px',
              }}
            />
          </div>
        )}
        {isUncheck && (
          <div
            style={{
              border: '2px solid gray',
              padding: '7px',
              borderRadius: '999px',
            }}
          />
        )}
        {isChecked && (
          <FaCircleCheck color={color} style={{ display: 'block' }} />
        )}
        {!isLastItem && (
          <div
            style={{
              height: '1.5px',
              maxHeight: '2px',
              width: '150px',
              backgroundColor: color,
            }}
          />
        )}
      </div>
      <span
        style={{
          display: 'block',
          width: '90px',
          lineHeight: '15px',
          fontSize: '0.775rem',
          textAlign: 'center',
          marginLeft: '-34px',
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
};
