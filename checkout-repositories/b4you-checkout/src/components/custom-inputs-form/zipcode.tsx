import { useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";
import { fecthRead } from "@/utils/fetch";
import { FormaterZipCode } from "@/shared/formaters";
import { iRegularInputProps, RegularInput } from "./regular";

interface iZipcodeAddressDataResponse {
  cep: string;
  city: string;
  neighborhood: string;
  state: string;
  street: string;
}

export interface iZipcodeInputProps<TField extends FieldValues>
  extends iRegularInputProps<TField> {
  onData?: (data: iZipcodeAddressDataResponse | null) => void;
  onLoading?: (isLoading: boolean) => void;
}

export function ZipcodeInput<TField extends FieldValues>(
  props: iZipcodeInputProps<TField>,
) {
  const [zipcode, setZipcode] = useState<string>("");

  const { onData, onLoading, control, ...inputProps } = props;

  const { data, isLoading, isError, isSuccess } =
    fecthRead<iZipcodeAddressDataResponse>({
      queryKey: ["zipcode", String(zipcode)],
      fullUrl: `https://viacep.com.br/ws/${zipcode.replace(/[^\d]/g, "")}/json`,
      options: {
        enabled: Boolean(zipcode) && zipcode.replace(/[^\d]/g, "").length === 8,
        retry: false,
      },
    });

  useEffect(() => {
    onLoading && onLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    onData && onData(data ?? null);
  }, [isSuccess]);

  useEffect(() => {
    onData && onData(null);
  }, [isError]);

  return (
    <RegularInput
      formater={FormaterZipCode}
      disabled={isLoading}
      control={control}
      onValueChange={(e) => setZipcode(e.target.value)}
      {...inputProps}
    />
  );
}
