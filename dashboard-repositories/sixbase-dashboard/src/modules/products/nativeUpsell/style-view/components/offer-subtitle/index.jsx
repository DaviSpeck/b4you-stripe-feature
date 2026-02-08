export const Subtitle = (props) => {
  const { data } = props;

  return (
    <p>
      <span
        style={{
          color: data.subtitleOneColor,
          fontSize: `${data.subtitleOneSize}px`,
          fontWeight: data.subtitleOneWeight,
        }}
      >
        {data.subtitleOne}
      </span>
      <span
        style={{
          color: data.subtitleTwoColor,
          fontSize: `${data.subtitleTwoSize}px`,
          fontWeight: data.subtitleTwoWeight,
        }}
      >
        {data.subtitleTwo}
      </span>
    </p>
  );
};
