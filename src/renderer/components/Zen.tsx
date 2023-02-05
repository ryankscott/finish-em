import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Item from './Item';
import Page from './Page';
import { useBoundStore, AppState } from 'renderer/state';

const Zen = (): ReactElement => {
  const [activeItemIds] = useBoundStore((state: AppState) => [
    state.activeItemIds,
  ]);
  return (
    <Page>
      <Flex justifyContent="center" alignItems="center" height={'100%'}>
        <Item
          itemKey={activeItemIds[0]}
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
