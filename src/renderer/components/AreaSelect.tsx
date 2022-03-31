import { useQuery } from '@apollo/client';
import { Flex, Box, Text } from '@chakra-ui/react';
import { Emoji } from 'emoji-mart';
import { Area } from 'main/generated/typescript-helpers';
import { ReactElement } from 'react';
import { GET_AREAS } from 'renderer/queries';
import Select from './Select';

type Props = {
  currentArea: Area;
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
  const { loading, error, data } = useQuery(GET_AREAS);
  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }

  const filteredAreas = data.areas?.filter((a: Area) => a.deleted === false);
  type AreaOption = { value: string; label: ReactElement };
  const options: AreaOption[] = [
    ...filteredAreas?.map((a: Area) => {
      return {
        value: a.key,
        label: (
          <Flex>
            {a.emoji && (
              <Box pr={1}>
                <Emoji emoji={a.emoji} size={12} native />
              </Box>
            )}
            <Text pl={1}>{a.name}</Text>
          </Flex>
        ),
      };
    }),
    { value: null, label: 'None' },
  ];
  console.log(options.filter((a) => a.value === currentArea?.key));
  console.log(currentArea);

  return (
    <Box w="100%" cursor={completed || deleted ? 'not-allowed' : 'inherit'}>
      <Select
        isMulti={false}
        isDisabled={completed || deleted}
        onChange={(a) => {
          onSubmit(a.value);
        }}
        options={options}
        escapeClearsValue
        placeholder="Add area"
        defaultValue={options.find((a) => a.value === currentArea?.key)}
        invertColours={invert}
        renderLabelAsElement
      />
    </Box>
  );
}
