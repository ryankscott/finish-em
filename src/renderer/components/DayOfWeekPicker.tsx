import { useEffect, useState } from 'react';
import { Flex, Button, useColorMode } from '@chakra-ui/react';
import { dayToString } from '../utils';

interface DayOfWeekPickerPropTypes {
  selectedDays: number[];
  onSelect: (days: number[]) => void;
}

const days = [...Array(7).keys()];
const DayOfWeekPicker = ({
  selectedDays,
  onSelect,
}: DayOfWeekPickerPropTypes) => {
  const { colorMode } = useColorMode();
  const [activeDays, setActiveDays] = useState<Set<number>>(
    new Set(selectedDays)
  );

  useEffect(() => {
    setActiveDays(new Set(selectedDays));
  }, [selectedDays]);

  return (
    <Flex
      border="1px solid"
      borderRadius="md"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
    >
      {days.map((d) => (
        <Button
          padding={1}
          borderRadius={0}
          borderColor="transparent"
          borderTopRightRadius={d == 6 ? 'md' : '0'}
          borderBottomRightRadius={d == 6 ? 'md' : '0'}
          borderTopLeftRadius={d == 0 ? 'md' : '0'}
          borderBottomLeftRadius={d == 0 ? 'md' : '0'}
          variant="outline"
          bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{
            bg: colorMode === 'light' ? 'blue.100' : 'blue.200',
            color: colorMode === 'light' ? 'gray.600' : 'gray.800',
          }}
          _focus={{}}
          _active={{
            bg: colorMode === 'light' ? 'blue.400' : 'blue.500',
            color: colorMode === 'light' ? 'gray.100' : 'gray.100',
          }}
          m={0}
          isActive={activeDays?.has(d)}
          onClick={() => {
            if (activeDays?.has(d)) {
              setActiveDays((prev) => new Set([...prev].filter((p) => p != d)));
              onSelect([...activeDays].filter((p) => p != d));
            } else {
              setActiveDays((prev) => new Set(prev?.add(d)));
              onSelect([...activeDays.add(d)]);
            }
          }}
        >
          {dayToString(d).at(0)}
        </Button>
      ))}
    </Flex>
  );
};

export { DayOfWeekPicker };
