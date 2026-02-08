import { motion } from "motion/react";
import { useState } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import { useUpsellNativeStorage } from "@/models/upsell-native/storage";
import { cn } from "@/shared/libs/cn";
import { Button } from "@/components/ui/button";

interface iProps {
  timeLeft: number;
  onNewTimeLeft: VoidFunction;
}

export function QrCodeComponent(props: iProps) {
  const { timeLeft, onNewTimeLeft } = props;

  if (timeLeft === 0) {
    return (
      <div className="col-span-3 flex flex-col items-center justify-center gap-4 bg-[#f1f1f1] p-4">
        <Button className="cursor-pointer" onClick={onNewTimeLeft}>
          Gerar novo QR Code
        </Button>
      </div>
    );
  }

  return (
    <div className="col-span-3 flex flex-col items-center justify-center gap-4 bg-[#f1f1f1] p-4">
      <QrCodeComponent.Copy />
    </div>
  );
}

QrCodeComponent.Copy = function () {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const { pixData } = useUpsellNativeStorage();

  function handleCopy() {
    const text = String(pixData?.pixData.qrcode ?? "");

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    textarea.select();
    try {
      document.execCommand("copy");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  if (!pixData) return <></>;

  return (
    <div className="flex w-full flex-col justify-center gap-2.5">
      <h2 className="text-center text-[0.775rem] font-semibold whitespace-nowrap">
        Clique e copie o código Pix abaixo
      </h2>
      <div className="flex w-full justify-center">
        <img className="max-w-[200px]" src={pixData.pixData.qrcode_url} />
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border-[2px] border-[#0f1b35] p-1 px-3 hover:cursor-pointer",
          isCopied && "border-green-600",
        )}
        onClick={handleCopy}
      >
        <div>
          {!isCopied ? (
            <LuCopy size={20} />
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <LuCopyCheck className="text-green-600" size={20} />
            </motion.div>
          )}
        </div>
        <span
          className={cn(
            "line-clamp-1 block text-[1rem] text-ellipsis whitespace-nowrap",
            isCopied && "text-green-600",
          )}
        >
          {pixData.pixData.qrcode}
        </span>
      </div>
    </div>
  );
};
