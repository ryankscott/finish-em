import { Icon } from '@chakra-ui/react';
import { Icons } from '../renderer/assets/icons';
import {
  determineIcon,
  determineIconColour,
} from '../renderer/components/ItemActionButton';

describe('Determining icon colour', () => {
  it('should return the colour if provided, with light mode', () => {
    expect(determineIconColour('light', '#FFF000')).toEqual('#FFF000');
  });
  it('should return the colour if provided', () => {
    expect(determineIconColour('dark', '#FFF000')).toEqual('#FFF000');
  });
  it('should return the dark mode colour if dark mode is set', () => {
    expect(determineIconColour('dark', undefined)).toEqual('gray.50');
  });

  it('should return the light mode colour if light mode is set', () => {
    expect(determineIconColour('light', undefined)).toEqual('gray.800');
  });
});

describe('Determining icon', () => {
  it('should return a completed icon of the colour provided when deleted and disableOnDelete is set and the item is completed', () => {
    expect(determineIcon('light', '#FFF000', true, true, true)).toEqual(
      <Icon
        as={Icons.todoChecked}
        w={3.5}
        h={3.5}
        fill={undefined}
        fillOpacity={0.6}
        color="#FFF000"
      />
    );
  });

  it('should return a completed icon of the colour provided when deleted and disableOnDelete is set and the item is uncompleted', () => {
    expect(determineIcon('light', '#FFF000', false, true, true)).toEqual(
      <Icon
        as={Icons.todoUnchecked}
        w={3.5}
        h={3.5}
        fill="#FFF000"
        fillOpacity={0.6}
        color="#FFF000"
      />
    );
  });

  it('should return a restore icon of the colour provided when deleted and disableOnDelete is false', () => {
    expect(determineIcon('light', '#FFF000', true, true, false)).toEqual(
      <Icon as={Icons.restore} w={3.5} h={3.5} color="#FFF000" />
    );
  });

  it('should return a completed icon of the colour provided when not deleted and disableOnDelete is false', () => {
    expect(determineIcon('light', '#FFF000', true, false, false)).toEqual(
      <Icon as={Icons.todoChecked} w={3.5} h={3.5} color="#FFF000" />
    );
  });

  it('should return a uncompleted icon of the colour provided when deleted and disableOnDelete is false', () => {
    expect(determineIcon('light', '#FFF000', false, false, false)).toEqual(
      <Icon
        as={Icons.todoUnchecked}
        w={3.5}
        h={3.5}
        fill="#FFF000"
        fillOpacity={0.6}
        color="#FFF000"
      />
    );
  });
});
