import { FieldValues } from "react-hook-form";
import { iRegularInputProps, RegularInput } from "./regular";
import { iZipcodeInputProps, ZipcodeInput } from "./zipcode";

export function CustomInput<TField extends FieldValues>(
  props: iRegularInputProps<TField>,
) {
  return <RegularInput {...props} />;
}

CustomInput.Zipcode = function <TField extends FieldValues>(
  props: iZipcodeInputProps<TField>,
) {
  return <ZipcodeInput {...props} />;
};
