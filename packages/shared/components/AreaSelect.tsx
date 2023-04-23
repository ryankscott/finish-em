import { useQuery } from "@apollo/client";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Area } from "../resolvers-types";
import { ReactElement } from "react";
import { GET_AREAS } from "../queries";
import Select from "./Select";
import EmojiDisplay from "./EmojiDisplay";

type Props = {
  currentArea: Area | null;
  completed: boolean;
  deleted: boolean;
  onSubmit: (key: string) => void;
  invert?: boolean;
};

export default function AreaSelect({
  currentArea,
  completed,
  deleted,
  onSubmit,
  invert,
}: Props) {
  const { loading, error, data } = useQuery<{ areas: Area[] }, null>(GET_AREAS);

  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }
  const filteredAreas = data?.areas?.filter((a: Area) => a.deleted === false);

  type AreaOption = { value: string; label: ReactElement | string };
  const options: AreaOption[] | [] = filteredAreas
    ? [
        ...filteredAreas?.map((a: Area) => {
          return {
            value: a.key,
            label: (
              <Flex>
                {a.emoji && (
                  <Box pr={1}>
                    <EmojiDisplay emojiId={a.emoji} size={12} />
                  </Box>
                )}
                <Text pl={1}>{a.name}</Text>
              </Flex>
            ),
          };
        }),
        { value: "", label: "None" },
      ]
    : [];

  return (
    <Box w="100%" cursor={completed || deleted ? "not-allowed" : "inherit"}>
      <Select
        isMulti={false}
        isDisabled={completed || deleted}
        onChange={(a) => {
          onSubmit(a.value);
        }}
        options={options}
        escapeClearsValue
        placeholder="Add area"
        // @ts-ignore
        defaultValue={options.find((a) => a?.value === currentArea?.key)}
        invertColours={invert}
        renderLabelAsElement
      />
    </Box>
  );
}
