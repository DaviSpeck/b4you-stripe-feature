import { Root as LabelProps } from "@radix-ui/react-label";
import {
  ChangeEvent,
  ComponentProps,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/libs/cn";
import { Checkbox } from "../ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type inputStylesType = {
  labelStyle?: Pick<ComponentProps<typeof LabelProps>, "className"> | undefined;
  inputStyle?: Pick<ComponentProps<"input">, "className"> | undefined;
  helpTextStyle?: Pick<ComponentProps<"input">, "className"> | undefined;
};

export interface iRegularInputProps<TField extends FieldValues = FieldValues>
  extends ComponentProps<"input"> {
  name: Path<TField>;
  control: Control<TField>;
  label?: string | null;
  inputStyles?: inputStylesType;
  checkboxLabel?: string;
  icon?: ReactElement;
  isSingleCheckout?: boolean;
  checkValue?: boolean;
  checkboxPosition?: "in" | "out";
  formater?: (value: string) => string;
  onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onCheckChenge?: (value: boolean) => void;
  remove?: {
    label?: boolean;
    helpText?: boolean;
  };
}

export function RegularInput<TField extends FieldValues>(
  props: iRegularInputProps<TField>,
) {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const {
    name,
    onValueChange,
    inputStyles = {},
    label = null,
    remove = {},
    control,
    icon,
    formater,
    className,
    isSingleCheckout,
    checkboxPosition = "out",
    checkboxLabel,
    checkValue,
    onCheckChenge,
    ...inputProps
  } = props;

  const { labelStyle, helpTextStyle, inputStyle } = inputStyles;

  const { label: labelRemove = false, helpText: helpTextRemove = false } =
    remove;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <FormField
      {...(isMounted && { control: control })}
      name={name}
      render={({ field, fieldState }) => {
        const rawValue = field.value ?? "";
        const displayValue =
          formater && typeof rawValue === "string"
            ? formater(rawValue)
            : rawValue;

        return (
          <FormItem className="w-full gap-1.5">
            {remove && !labelRemove && (
              <FormLabel
                className={cn(
                  "pl-1 text-[0.8128rem] font-medium text-[#3f3f3f]",
                  labelStyle,
                )}
              >
                {label}
              </FormLabel>
            )}
            <div
              className={cn(
                "flex w-full flex-col gap-0.5",
                checkboxPosition === "in" && "relative w-full",
              )}
            >
              <FormControl className="w-full">
                <div className="relative w-full">
                  <Input
                    className={cn(
                      "h-[33px] w-full rounded-[4px] border-[#dad5da] text-[1rem] placeholder:text-[0.813rem] disabled:cursor-not-allowed",
                      Boolean(checkboxPosition === "in") && "w-full pr-[60px]",
                      Boolean(checkboxPosition === "in" && icon) && "w-full pr-[65px]",
                      icon && "pl-[42px]",
                      fieldState.invalid && "bg-[#ffdada]",
                      inputStyle,
                      className,
                    )}
                    {...field}
                    {...inputProps}
                    value={String(displayValue ?? "")}
                    onChange={(e) => {
                      const next = formater ? formater(e.target.value) : e.target.value;

                      field.onChange(next);

                      onValueChange?.({
                        ...e,
                        target: { ...e.target, value: next },
                      } as ChangeEvent<HTMLInputElement>);
                    }}
                  />

                  {icon && icon}
                </div>
              </FormControl>
              <div className="relative">
                {remove && !helpTextRemove && (
                  <FormMessage
                    id={`helptext-${name}`}
                    className={cn(
                      "pl-1 text-[0.75rem] underline underline-offset-2",
                      helpTextStyle,
                    )}
                  />
                )}
                {checkboxPosition === "out" && onCheckChenge && (
                  <div className="absolute top-2 right-0 bottom-0">
                    <RegularInput.Checkbox
                      checkboxLabel={checkboxLabel}
                      onCheckChenge={onCheckChenge}
                      {...(checkValue && { checkValue: checkValue })}
                    />
                  </div>
                )}
              </div>
              {checkboxPosition === "in" && onCheckChenge && (
                <div
                  className={cn(
                    "absolute bottom-[calc(100%-25px)] left-[calc(100%-60px)]",
                    isSingleCheckout && "bottom-[calc(100%-27px)]",
                  )}
                >
                  <RegularInput.Checkbox
                    checkboxLabel={checkboxLabel}
                    onCheckChenge={onCheckChenge}
                    {...(checkValue && { checkValue: checkValue })}
                  />
                </div>
              )}
            </div>
          </FormItem>
        )
      }}
    />
  );
}

interface iCheckbox
  extends Pick<iRegularInputProps, "checkboxLabel" | "onCheckChenge"> {
  checkValue?: boolean;
}

RegularInput.Checkbox = function (props: iCheckbox) {
  const { checkValue, checkboxLabel, onCheckChenge } = props;

  return (
    <div className="flex items-center gap-1">
      {(checkboxLabel || onCheckChenge) && (
        <>
          <label
            htmlFor="terms2"
            className="text-[0.75rem] leading-none font-normal whitespace-nowrap peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {checkboxLabel}
          </label>
          <Checkbox
            id="terms2"
            className="cursor-pointer border data-[state=checked]:border-transparent data-[state=checked]:bg-[#409eff]"
            checked={checkValue ?? false}
            onCheckedChange={(value: boolean) => {
              onCheckChenge && onCheckChenge(value);
            }}
          />
        </>
      )}
    </div>
  );
};
