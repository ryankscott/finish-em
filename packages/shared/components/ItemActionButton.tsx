import { IconButton, Icon, useColorMode } from '@chakra-ui/react';
import { MouseEventHandler, ReactElement } from 'react';
import { Icons } from '../assets/icons';

type Props = {
  onClick: MouseEventHandler;
  completed: boolean;
  deleted: boolean;
  colour?: string;
  disableOnDelete?: boolean;
};

export const determineIconColour = (
  colorMode: 'light' | 'dark',
  colour: string | undefined
): string => {
  if (colour) {
    return colour;
  }
  if (colorMode === 'light') {
    return 'gray.800';
  }
  return 'gray.50';
};

export const determineIcon = (
  colourMode: 'light' | 'dark',
  colour: string | undefined,
  completed: boolean,
  deleted: boolean,
  disableOnDelete?: boolean
): ReactElement => {
  const iconColour = determineIconColour(colourMode, colour);
  if (deleted) {
    if (disableOnDelete) {
      return (
        <Icon
          as={completed ? Icons.todoChecked : Icons.todoUnchecked}
          w={3.5}
          h={3.5}
          fill={completed ? undefined : iconColour}
          fillOpacity={0.6}
          color={iconColour}
        />
      );
    }
    return <Icon as={Icons.restore} w={3.5} h={3.5} color={iconColour} />;
  }
  if (completed) {
    return <Icon as={Icons.todoChecked} w={3.5} h={3.5} color={iconColour} />;
  }
  return (
    <Icon
      as={Icons.todoUnchecked}
      w={3.5}
      h={3.5}
      fill={colour ?? undefined}
      fillOpacity={0.6}
      color={iconColour}
    />
  );
};

const ItemActionButton = ({
  onClick,
  completed,
  deleted,
  colour,
  disableOnDelete,
}: Props) => {
  const { colorMode } = useColorMode();

  return (
    <IconButton
      tabIndex={-1}
      aria-label="restore"
      variant="subtle"
      p={0}
      m={0}
      disabled={disableOnDelete && deleted}
      onClick={onClick}
      icon={determineIcon(
        colorMode,
        colour,
        completed,
        deleted,
        disableOnDelete
      )}
      color={colour || undefined}
    />
  );
};
export default ItemActionButton;
