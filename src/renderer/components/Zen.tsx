import { useReactiveVar } from '@apollo/client';
import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { activeItemVar } from 'renderer/cache';
import Item from './Item';
import Page from './Page';

const Zen = (): ReactElement => {
  const activeItem = useReactiveVar(activeItemVar);
  return (
    <Page>
      <Flex justifyContent="center" alignItems="center" height={'100%'}>
        <Item
          itemKey={activeItem[0]}
          compact={false}
          shouldIndent={false}
          componentKey=""
          hiddenIcons={undefined}
        />
      </Flex>
    </Page>
  );
};

export default Zen;
