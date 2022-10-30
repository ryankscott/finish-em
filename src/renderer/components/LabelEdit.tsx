import {
  Flex,
  Editable,
  EditableInput,
  EditablePreview,
  Icon,
  IconButton,
  useOutsideClick,
  useColorMode,
} from '@chakra-ui/react';
import { createRef, useState } from 'react';
import { Icons } from 'renderer/assets/icons';
import { HexColorPicker } from 'react-colorful';
import { useDebouncedCallback } from 'use-debounce';

interface LabelEditProps {
  name: string;
  colour: string;
  renameLabel: (name: string) => void;
  deleteLabel: () => void;
  colourChange: (colour: string) => void;
}
const LabelEdit = ({
  name,
  colour,
  renameLabel,
  deleteLabel,
  colourChange,
}: LabelEditProps) => {
  const [showColourPicker, setShowColourPicker] = useState<boolean>(false);
  const [labelName, setLabelName] = useState<string>(name);
  const { colorMode } = useColorMode();
  const ref = createRef<HTMLDivElement>();
  useOutsideClick({
    ref,
    handler: () => {
      setShowColourPicker(false);
    },
  });

  const debouncedColourChange = useDebouncedCallback(
    // function
    (colour) => {
      colourChange(colour);
    },
    250
  );

  return (
    <Flex
      w="250px"
      justifyContent="space-between"
      alignItems="center"
      height="auto"
    >
      <Editable
        mx={2}
        value={labelName}
        onChange={(name) => setLabelName(name)}
        fontSize="sm"
        w="100%"
        onSubmit={(input) => {
          renameLabel(input);
        }}
        submitOnBlur={true}
      >
        <EditablePreview p={2} py={1} fontSize="sm" />
        <EditableInput p={2} py={1} />
      </Editable>
      <Flex
        bg={colour ?? '#000'}
        cursor="pointer"
        minW="24px"
        minH="24px"
        borderRadius="50%"
        borderWidth="3px"
        borderColor={colorMode === 'light' ? 'gray.100' : 'gray.900'}
        onClick={(e) => {
          setShowColourPicker(!showColourPicker);
          e.stopPropagation();
        }}
      />
      <IconButton
        size="sm"
        mx={2}
        variant="ghost"
        aria-label="delete label"
        icon={<Icon as={Icons.trash} />}
        onClick={() => {
          deleteLabel();
        }}
      />
      {showColourPicker && (
        <Flex
          w="200px"
          ref={ref}
          position="absolute"
          zIndex={99}
          border="1px solid"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
          borderRadius="8px"
          shadow="md"
        >
          <HexColorPicker
            color={colour ?? '#000'}
            onChange={(colour) => {
              debouncedColourChange(colour);
            }}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default LabelEdit;
