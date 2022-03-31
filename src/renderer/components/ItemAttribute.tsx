import { ReactElement } from 'react';
import { marked } from 'marked';
import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { HTMLToPlainText } from 'renderer/utils';
import { Icons } from '../assets/icons';

type ItemAttributeType = 'repeat' | 'due' | 'scheduled' | 'subtask';
type ItemAttributeProps = {
  type: ItemAttributeType;
  text: string;
  tooltipText: string;
  completed: boolean;
  compact: boolean;
  isOverdue?: boolean;
};

const ItemAttribute = ({
  compact,
  tooltipText,
  text,
  completed,
  type,
  isOverdue,
}: ItemAttributeProps): ReactElement => {
  const iconSize = compact ? '12px' : '14px';
  return (
    <Tooltip label={HTMLToPlainText(tooltipText)}>
      <Flex
        direction="row"
        alignItems="center"
        py={0}
        px={1}
        my={0}
        mx={1}
        textDecoration={completed ? 'strike-through' : 'none'}
      >
        <Flex p={0} m={0} alignItems="center">
          <Text color={isOverdue ? 'red' : 'inherit'}>
            {Icons[type](iconSize, iconSize)}
          </Text>
        </Flex>
        {!compact && (
          <Text
            fontSize="xs"
            fontWeight="light"
            px={1}
            dangerouslySetInnerHTML={{ __html: marked(text) }}
          />
        )}
      </Flex>
    </Tooltip>
  );
};
export default ItemAttribute;
