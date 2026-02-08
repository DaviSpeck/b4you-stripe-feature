import { SelectProps } from "@radix-ui/react-select";
import { ComponentProps, FC } from "react";
import { v4 as uuid } from "uuid";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectItemType =
  | {
      id: string;
      label?: never;
      value?: never;
      title: string;
      children: { id: string; value: string; label: string }[];
    }
  | {
      id: string;
      label: string;
      value: string | number;
      title?: never;
      children?: never;
    };

export interface iRegularSelectProps extends ComponentProps<FC<SelectProps>> {
  data: SelectItemType[];
  placeholder?: string;
}

export function RegularSelect(props: iRegularSelectProps) {
  const { placeholder, data, ...otherPros } = props;

  return (
    <Select {...otherPros}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((item) => {
            if (item.children) {
              return (
                <>
                  <SelectLabel key={uuid()}>{item.title}</SelectLabel>
                  {item.children.map((i) => (
                    <SelectItem key={uuid()} value={i.value!}>
                      {i.label}
                    </SelectItem>
                  ))}
                </>
              );
            }

            return (
              <SelectItem key={uuid()} value={item.value.toString()}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
