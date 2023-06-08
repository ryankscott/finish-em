import { useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { transparentize } from "polished";
import { Icons } from "../assets/icons";
import { IconType } from "../interfaces";
import { GET_LABELS } from "../queries";
import { Label } from "../resolvers-types";
import Select from "./Select";

type LabelSelectProps = {
  currentLabelKey: string | undefined;
  completed: boolean;
  deleted: boolean;
  onSubmit: (key: string) => void;
  invert?: boolean;
  showIcon?: boolean;
};

export default function LabelSelect({
  currentLabelKey,
  completed,
  deleted,
  onSubmit,
  invert = false,
  showIcon,
}: LabelSelectProps) {
  const { loading, error, data } = useQuery<{ labels: Label[] }>(GET_LABELS);
  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }

  const options = data?.labels
    ? [
        ...data.labels?.map((l: Label) => {
          return {
            value: l.key,
            label: l.name,
            color: transparentize(0.7, l.colour ?? "#FFFFFF"),
          };
        }),
        {
          value: "",
          label: "No label",
          color: transparentize(0.7, "#CCC"),
        },
      ]
    : [];

  return (
    <Box w="100%" cursor={completed || deleted ? "not-allowed" : "inherit"}>
      <Select
        icon={showIcon ? Icons.label : undefined}
        isMulti={false}
        isDisabled={completed || deleted}
        onChange={(p) => {
          onSubmit(p.value);
        }}
        options={options}
        escapeClearsValue
        placeholder="Label:"
        defaultValue={options.find((l) => l.value === currentLabelKey)}
        invertColours={invert}
      />
    </Box>
  );
}
