import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import 'emoji-mart/css/emoji-mart.css';
import { transparentize } from 'polished';
import { GET_LABELS } from 'renderer/queries';
import { Label } from '../../main/generated/typescript-helpers';
import Select from './Select';

type LabelSelectProps = {
  currentLabel: Label | null;
  completed: boolean;
  deleted: boolean;
  onSubmit: (key: string) => void;
  invert?: boolean;
};

export default function LabelSelect({
  currentLabel,
  completed,
  deleted,
  onSubmit,
  invert = false,
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
            color: transparentize(0.7, l.colour ?? '#FFFFFF'),
          };
        }),
        { value: '', label: 'No label', color: '' },
      ]
    : [];

  return (
    <Box w="100%" cursor={completed || deleted ? 'not-allowed' : 'inherit'}>
      <Select
        isMulti={false}
        isDisabled={completed || deleted}
        onChange={(p) => {
          onSubmit(p.value);
        }}
        options={options}
        escapeClearsValue
        placeholder="Add label"
        defaultValue={options.find((l) => l.value === currentLabel?.key)}
        invertColours={invert}
      />
    </Box>
  );
}
