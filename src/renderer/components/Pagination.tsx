import { ReactElement } from 'react';
import { Flex, Text } from '@chakra-ui/layout';
import { PAGE_SIZE } from '../../consts';
import Button from './Button';

export type PaginationProps = {
  currentPage: number;
  itemsLength: number;
  setCurrentPage: (page: number) => void;
};
const Pagination = ({
  currentPage,
  itemsLength,
  setCurrentPage,
}: PaginationProps): ReactElement => {
  if (itemsLength < PAGE_SIZE) return <></>;
  const totalPages = Math.ceil(itemsLength / PAGE_SIZE);

  return (
    <Flex
      direction="row"
      w="100%"
      justifyContent="center"
      alignItems="center"
      py={2}
    >
      {/* Start page button  */}
      <Button
        size="sm"
        variant="default"
        icon="slideLeft"
        onClick={() =>
          setCurrentPage(currentPage === 1 ? currentPage : currentPage - 1)
        }
      />

      {/* First page button  */}
      {currentPage !== 1 && (
        <Button
          size="sm"
          variant="default"
          text="1"
          onClick={() => setCurrentPage(1)}
        />
      )}
      {/* More pages indicator (small no. of pages) */}
      {currentPage >= 4 && '...'}

      {/* Next page button (if we're not at the end) */}
      {currentPage >= 3 && (
        <Button
          size="sm"
          variant="default"
          text={(currentPage - 1).toString()}
          onClick={() => setCurrentPage(currentPage - 1)}
        />
      )}

      {/* Current page button */}
      <Button
        size="sm"
        isActive
        variant="default"
        text={currentPage.toString()}
      />

      {/* Next page button (if we're not at the end) */}
      {currentPage <= totalPages - 2 && (
        <Button
          size="sm"
          variant="default"
          text={(currentPage + 1).toString()}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      )}
      {/* More pages indicator */}
      {currentPage <= totalPages - 2 && (
        <Text px={1} fontSize="md">
          ...
        </Text>
      )}
      {/* Last page button */}
      {currentPage !== totalPages && (
        <Button
          size="sm"
          variant="default"
          text={totalPages.toString()}
          onClick={() => {
            setCurrentPage(totalPages);
          }}
        />
      )}
      {/* End button */}
      <Button
        size="sm"
        variant="default"
        icon="slideRight"
        onClick={() =>
          setCurrentPage(
            currentPage === totalPages ? totalPages : currentPage + 1
          )
        }
      />
    </Flex>
  );
};

export default Pagination;
