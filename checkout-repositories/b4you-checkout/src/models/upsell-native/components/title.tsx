interface iProps {
  title: string;
  titleSize: number;
  titleColor: string;
}

export const Title = (props: iProps) => {
  const { title, titleColor, titleSize } = props;

  if (title.length === 0) return <></>;

  return (
    <h2
      className="text-center font-semibold"
      style={{
        fontSize: `${titleSize}px`,
        color: titleColor,
      }}
    >
      {title}
    </h2>
  );
};
