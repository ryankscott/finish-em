import { ReactElement } from 'react';
import { PAGE_SIZE } from '../../consts';
import Button from './Button';
import { Flex, Text } from '@chakra-ui/layout';

export type PaginationProps = {
  currentPage: number;
  itemsLength: number;
  setCurrentPage: (page: number) => void;
};
function Pagination(props: PaginationProps): ReactElement {
  if (props.itemsLength < PAGE_SIZE) return <></>;
  const totalPages = Math.ceil(props.itemsLength / PAGE_SIZE);

  return (
    <Flex
      direction={'row'}
      w={'100%'}
      justifyContent={'center'}
      alignItems={'center'}
      py={2}
    >
      {/* Start page button  */}
      <Button
        size="sm"
        variant="default"
        icon="slideLeft"
        onClick={() =>
          props.setCurrentPage(
            props.currentPage == 1 ? props.currentPage : props.currentPage - 1
          )
        }
      />

      {/* First page button  */}
      {props.currentPage != 1 && (
        <Button
          size="sm"
          variant="default"
          text={'1'}
          onClick={() => props.setCurrentPage(1)}
        />
      )}
      {/* More pages indicator (small no. of pages) */}
      {props.currentPage >= 4 && '...'}

      {/* Next page button (if we're not at the end) */}
      {props.currentPage >= 3 && (
        <Button
          size="sm"
          variant="default"
          text={(props.currentPage - 1).toString()}
          onClick={() => props.setCurrentPage(props.currentPage - 1)}
        />
      )}

      {/* Current page button */}
      <Button
        size="sm"
        isActive={true}
        variant="default"
        text={props.currentPage.toString()}
      />

      {/* Next page button (if we're not at the end) */}
      {props.currentPage <= totalPages - 2 && (
        <Button
          size="sm"
          variant="default"
          text={(props.currentPage + 1).toString()}
          onClick={() => props.setCurrentPage(props.currentPage + 1)}
        />
      )}
      {/* More pages indicator */}
      {props.currentPage <= totalPages - 2 && (
        <Text px={1} fontSize="md">
          ...
        </Text>
      )}
      {/* Last page button */}
      {props.currentPage != totalPages && (
        <Button
          size="sm"
          variant="default"
          text={totalPages.toString()}
          onClick={() => {
            props.setCurrentPage(totalPages);
          }}
        />
      )}
      {/* End button */}
      <Button
        size="sm"
        variant="default"
        icon="slideRight"
        onClick={() =>
          props.setCurrentPage(
            props.currentPage == totalPages ? totalPages : props.currentPage + 1
          )
        }
      />
    </Flex>
  );
}

export default Pagination;
