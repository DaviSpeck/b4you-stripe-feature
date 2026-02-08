import { FaCircleExclamation } from "react-icons/fa6";

interface iProps {
  text: string;
  backgroundColor: string;
  textColor: string;
  isVisible: boolean;
}

export const HeaderText = (props: iProps) => {
  const { backgroundColor, textColor, text, isVisible } = props;

  if (!isVisible) return <></>;

  return (
    <header
      className="flex min-h-12 w-full items-center justify-center px-4"
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      <div
        className="flex items-center gap-2 pr-6"
        style={{
          borderRight: `2px solid ${textColor}`,
        }}
      >
        <FaCircleExclamation color={textColor} size={20} />
        <span
          className="block font-semibold whitespace-nowrap"
          style={{
            color: textColor,
          }}
        >
          CHANCE ÚNICA!
        </span>
      </div>
      <h1
        className="m-0 pl-6 text-[1rem]"
        style={{
          color: textColor,
        }}
      >
        {text}
      </h1>
    </header>
  );
};
