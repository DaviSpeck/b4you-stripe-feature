import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface iProps {
  text: string;
  color: string;
  loading: boolean;
  fontSize: string;
  btnColor: string;
  onClick: VoidFunction;
}

export const BtnUpsellBuy = (props: iProps) => {
  const { btnColor, loading, text, color, fontSize, onClick } = props;

  return (
    <button
      className="btn-upsell-native-accept flex h-[45px] w-full cursor-pointer items-center justify-center gap-2 rounded-[8px]"
      disabled={loading}
      style={{
        color,
        fontSize,
        backgroundColor: btnColor,
      }}
      onClick={onClick}
    >
      <span className="block">{text}</span>
      {loading && (
        <AiOutlineLoading3Quarters size={20} className="block animate-spin" />
      )}
    </button>
  );
};
