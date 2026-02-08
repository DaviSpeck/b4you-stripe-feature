import { motion } from "motion/react";
import { useState } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import { queryClient } from "@/pages/_app";
import { cn } from "@/shared/libs/cn";
import { iPixData } from ".";

export function QrCodeComponent() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center gap-4 bg-[#f1f1f1] p-4">
      <QrCodeComponent.Copy />
    </div>
  );
}

QrCodeComponent.Copy = function () {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const pixData = queryClient.getQueryData(["upsell-pix-info"]) as iPixData;

  function handleCopy() {
    navigator.clipboard
      .writeText(pixData.qrcode)
      .then(() => {
        setIsCopied(true);
      })
      .finally(() => {
        setTimeout(() => setIsCopied(false), 2000);
      });
  }

  if (!pixData) return <></>;

  return (
    <div className="flex w-full flex-col justify-center gap-2.5">
      <h2 className="text-center text-[0.85rem] font-semibold whitespace-nowrap">
        Clique e copie o código Pix abaixo
      </h2>
      <img src={pixData.qrcode_url} />
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
          {pixData.qrcode}
        </span>
      </div>
    </div>
  );
};
