import { BiSolidCheckShield, BiSolidLock } from "react-icons/bi";

export const FooterPage = () => {
  return (
    <footer className="flex items-center justify-center bg-white px-2 py-5">
      <div className="flex justify-center gap-[32px] min-[830px]:gap-[70px]">
        <div className="flex items-center justify-center gap-[2px]">
          <BiSolidCheckShield className="text-[1.5rem]" color="#0F1B35" />
          <p className="text-[0.65rem] leading-[12px] font-bold text-[#0f1b35] min-[600px]:text-[1rem] min-[600px]:leading-[20px]">
            COMPRA <br /> SEGURA
          </p>
        </div>
        <div className="flex items-center justify-center gap-1">
          <img className="h-[20px] w-[40px]" src="/trophy.svg" />
          <p className="text-[0.65rem] leading-[12px] font-bold text-[#0f1b35] min-[600px]:text-[1rem] min-[600px]:leading-[20px]">
            SATISFAÇÃO <br /> GARANTIDA
          </p>
        </div>
        <div className="flex items-center justify-center gap-[2px]">
          <BiSolidLock className="text-[1.5rem]" color="#0F1B35" />
          <p className="text-[0.65rem] leading-[12px] font-bold text-[#0f1b35] min-[600px]:text-[1rem] min-[600px]:leading-[20px]">
            PRIVACIDADE <br /> PROTEGIDA
          </p>
        </div>
      </div>
    </footer>
  );
};
