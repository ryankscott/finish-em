import { ReactElement } from 'react';
import { Icons } from '../assets/icons';
import { marked } from 'marked';
import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { HTMLToPlainText } from 'renderer/utils';

type ItemAttributeProps = {
  type: 'repeat' | 'due' | 'scheduled' | 'subtask';
  text: string;
  tooltipText: string;
  completed: boolean;
  compact: boolean;
};

const ItemAttribute = (props: ItemAttributeProps): ReactElement => {
  const iconSize = props.compact ? '12px' : '14px';
  return (
    <Tooltip delay={500} label={HTMLToPlainText(props.tooltipText)}>
      <Flex
        direction="row"
        alignItems="center"
        py={0}
        px={1}
        my={0}
        mx={1}
        textDecoration={props.completed ? 'strike-through' : 'none'}
      >
        <Flex p={0} m={0} alignItems="center">
          {Icons[props.type](iconSize, iconSize)}
        </Flex>
        {!props.compact && (
          <Text
            fontSize="xs"
            fontWeight={'light'}
            px={1}
            dangerouslySetInnerHTML={{ __html: marked(props.text) }}
          />
        )}
      </Flex>
    </Tooltip>
  );
};
export default ItemAttribute;
