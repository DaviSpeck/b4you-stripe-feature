interface iProps {
  subtitleOne: string;
  subtitleOneColor: string;
  subtitleOneSize: number;
  subtitleOneWeight: number;
  subtitleTwo: string;
  subtitleTwoColor: string;
  subtitleTwoSize: number;
  subtitleTwoWeight: number;
}

export const Subtitle = (props: iProps) => {
  const {
    subtitleOne,
    subtitleOneColor,
    subtitleOneSize,
    subtitleOneWeight,
    subtitleTwo,
    subtitleTwoColor,
    subtitleTwoSize,
    subtitleTwoWeight,
  } = props;

  return (
    <p className="text-center break-words">
      <span
        style={{
          color: subtitleOneColor,
          fontSize: `${subtitleOneSize}px`,
          fontWeight: subtitleOneWeight,
        }}
      >
        {subtitleOne}
      </span>
      <span
        style={{
          color: subtitleTwoColor,
          fontSize: `${subtitleTwoSize}px`,
          fontWeight: subtitleTwoWeight,
        }}
      >
        {subtitleTwo}
      </span>
    </p>
  );
};
