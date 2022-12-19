import { useEffect, useState } from 'react';
import { Flex, Button, useColorMode } from '@chakra-ui/react';
import { dayToString } from '../utils';

interface DayOfWeekPickerPropTypes {
  selectedDays: number[];
  onSelect: (days: number[]) => void;
}

const generateTextColour = (
  colorMode: 'light' | 'dark',
  state: 'hover' | 'active' | 'default',
  isToday: boolean
) => {
  switch (state) {
    case 'hover': {
      return colorMode === 'light' ? 'gray.100' : 'gray.800';
    }
    case 'active': {
      return 'gray.100';
    }
    case 'default': {
      if (isToday) return 'red.500';
      return colorMode === 'light' ? 'gray.600' : 'gray.200';
    }
  }
};

const generateBackgroundColour = (
  colorMode: 'light' | 'dark',
  state: 'hover' | 'active' | 'default'
) => {
  switch (state) {
    case 'hover': {
      return colorMode === 'light' ? 'blue.300' : 'blue.300';
    }
    case 'active': {
      return colorMode === 'light' ? 'blue.500' : 'blue.500';
    }
    case 'default': {
      return colorMode === 'light' ? 'gray.50' : 'gray.800';
    }
  }
};

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
      {days.map((d) => {
        const isToday = new Date().getDay() - 1 === d;
        return (
          <Button
            padding={1}
            borderRadius={0}
            borderColor="transparent"
            borderTopRightRadius={d == 6 ? 'md' : '0'}
            borderBottomRightRadius={d == 6 ? 'md' : '0'}
            borderTopLeftRadius={d == 0 ? 'md' : '0'}
            borderBottomLeftRadius={d == 0 ? 'md' : '0'}
            variant="outline"
            bg={generateBackgroundColour(colorMode, 'default')}
            color={generateTextColour(colorMode, 'default', isToday)}
            _hover={{
              bg: generateBackgroundColour(colorMode, 'hover'),
              color: generateTextColour(colorMode, 'hover', isToday),
            }}
            _focus={{}}
            _active={{
              bg: generateBackgroundColour(colorMode, 'active'),
              color: generateTextColour(colorMode, 'active', isToday),
            }}
            m={0}
            isActive={activeDays?.has(d)}
            onClick={() => {
              if (activeDays?.has(d)) {
                setActiveDays(
                  (prev) => new Set([...prev].filter((p) => p != d))
                );
                onSelect([...activeDays].filter((p) => p != d));
              } else {
                setActiveDays((prev) => new Set(prev?.add(d)));
                onSelect([...activeDays.add(d)]);
              }
            }}
          >
            {dayToString(d).at(0)}
          </Button>
        );
      })}
    </Flex>
  );
};

export { DayOfWeekPicker };
