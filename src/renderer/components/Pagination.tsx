import { ReactElement } from 'react'
import { Flex, Text } from '@chakra-ui/layout'
import { IconButton, Icon, Button } from '@chakra-ui/react'
import { Icons } from '../assets/icons'
import { PAGE_SIZE } from '../../consts'

export type PaginationProps = {
  currentPage: number
  itemsLength: number
  setCurrentPage: (page: number) => void
}
const Pagination = ({
  currentPage,
  itemsLength,
  setCurrentPage
}: PaginationProps): ReactElement => {
  if (itemsLength < PAGE_SIZE) return <></>
  const totalPages = Math.ceil(itemsLength / PAGE_SIZE)

  return (
    <Flex direction="row" w="100%" justifyContent="center" alignItems="center" py={2}>
      {/* Start page button  */}
      <IconButton
        aria-label="first"
        size="sm"
        variant="default"
        icon={<Icon as={Icons.slideLeft} />}
        onClick={() => setCurrentPage(currentPage === 1 ? currentPage : currentPage - 1)}
      />

      {/* First page button  */}
      {currentPage !== 1 && (
        <Button size="sm" variant="default" onClick={() => setCurrentPage(1)}>
          1
        </Button>
      )}
      {/* More pages indicator (small no. of pages) */}
      {currentPage >= 4 && '...'}

      {/* Next page button (if we're not at the end) */}
      {currentPage >= 3 && (
        <Button size="sm" variant="default" onClick={() => setCurrentPage(currentPage - 1)}>
          {(currentPage - 1).toString()}
        </Button>
      )}

      {/* Current page button */}
      <Button size="sm" isActive variant="default">
        {currentPage.toString()}
      </Button>

      {/* Next page button (if we're not at the end) */}
      {currentPage <= totalPages - 2 && (
        <Button size="sm" variant="default" onClick={() => setCurrentPage(currentPage + 1)}>
          {(currentPage + 1).toString()}
        </Button>
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
          onClick={() => {
            setCurrentPage(totalPages)
          }}
        >
          {totalPages.toString()}
        </Button>
      )}
      {/* End button */}
      <IconButton
        aria-label="next"
        size="sm"
        variant="default"
        icon={<Icon as={Icons.slideRight} />}
        onClick={() => setCurrentPage(currentPage === totalPages ? totalPages : currentPage + 1)}
      />
    </Flex>
  )
}

export default Pagination
