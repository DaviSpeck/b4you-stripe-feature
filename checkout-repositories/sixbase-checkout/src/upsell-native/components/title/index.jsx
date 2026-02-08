import './style.scss';

export const Title = ({ title, titleColor, titleSize }) => {
  if (!title) return null;

  return (
    <h2
      style={{
        fontSize: `${titleSize}px`,
        color: titleColor,
      }}
    >
      {title}
    </h2>
  );
};