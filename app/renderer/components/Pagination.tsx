import React, { ReactElement } from 'react'
import { PAGE_SIZE } from '../consts'
import Button from './Button'
import { Flex } from '@chakra-ui/layout'

export type PaginationProps = {
  currentPage: number
  itemsLength: number
  setCurrentPage: (page: number) => void
}
function Pagination(props: PaginationProps): ReactElement {
  const totalPages = Math.ceil(props.itemsLength / PAGE_SIZE)
  if (props.itemsLength < PAGE_SIZE) return null

  return (
    <Flex direction={'row'} w={'100%'} justifyContent={'center'} alignItems={'center'} py={2}>
      <Button
        size="sm"
        variant="default"
        icon="slideLeft"
        onClick={() =>
          props.setCurrentPage(props.currentPage == 1 ? props.currentPage : props.currentPage - 1)
        }
      />
      {props.currentPage != 1 && (
        <Button size="sm" variant="default" text={'1'} onClick={() => props.setCurrentPage(1)} />
      )}
      {props.currentPage >= 4 && '...'}
      {props.currentPage >= 3 && (
        <Button
          size="sm"
          variant="default"
          text={(props.currentPage - 1).toString()}
          onClick={() => props.setCurrentPage(props.currentPage - 1)}
        />
      )}

      <Button size="sm" variant="default" text={props.currentPage.toString()} />
      {props.currentPage <= totalPages - 2 && (
        <Button
          size="sm"
          variant="default"
          text={(props.currentPage + 1).toString()}
          onClick={() => props.setCurrentPage(props.currentPage + 1)}
        />
      )}
      {props.currentPage <= totalPages - 2 && '...'}
      {props.currentPage != totalPages && (
        <Button
          size="sm"
          variant="default"
          text={totalPages.toString()}
          onClick={() => {
            props.setCurrentPage(totalPages)
          }}
        />
      )}
      <Button
        size="sm"
        variant="default"
        icon="slideRight"
        onClick={() =>
          props.setCurrentPage(props.currentPage == totalPages ? totalPages : props.currentPage + 1)
        }
      />
    </Flex>
  )
}

export default Pagination
