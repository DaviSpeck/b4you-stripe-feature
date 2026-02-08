import { FaCircleExclamation } from 'react-icons/fa6';

export const HeaderPageComponent = (props) => {
  const { data } = props;

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: '50px',
        backgroundColor: data.headerBackgroundColor,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRight: `2px solid ${data.headerTextColor}`,
          paddingRight: '24px',
        }}
      >
        <FaCircleExclamation color={data.headerTextColor} size={20} />
        <span
          style={{
            display: 'block',
            color: data.headerTextColor,
            fontWeight: 600,
            fontSize: `${data.titleSize}`,
            whiteSpace: 'nowrap',
          }}
        >
          CHANCE ÚNICA!
        </span>
      </div>
      <h1
        style={{
          fontSize: '1rem',
          paddingLeft: '24px',
          color: data.headerTextColor,
          margin: '0px',
        }}
      >
        {data.header}
      </h1>
    </header>
  );
};
