import React, { ReactElement } from 'react'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'
import { PAGE_SIZE } from '../consts'
import Button from './Button'
import { PaginationContainer } from './styled/Pagination'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

export type PaginationProps = {
  currentPage: number
  itemsLength: number
  setCurrentPage: (page: number) => void
}
function Pagination(props: PaginationProps): ReactElement {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  const totalPages = Math.ceil(props.itemsLength / PAGE_SIZE)
  if (props.itemsLength < PAGE_SIZE) return null

  return (
    <ThemeProvider theme={theme}>
      <PaginationContainer>
        <Button
          variant="default"
          icon="slideLeft"
          onClick={() =>
            props.setCurrentPage(props.currentPage == 1 ? props.currentPage : props.currentPage - 1)
          }
        />
        {props.currentPage != 1 && (
          <Button variant="default" text={'1'} onClick={() => props.setCurrentPage(1)} />
        )}
        {props.currentPage >= 4 && '...'}
        {props.currentPage >= 3 && (
          <Button
            variant="default"
            text={(props.currentPage - 1).toString()}
            onClick={() => props.setCurrentPage(props.currentPage - 1)}
          />
        )}

        <Button textWeight="700" variant="default" text={props.currentPage.toString()} />
        {props.currentPage <= totalPages - 2 && (
          <Button
            variant="default"
            text={(props.currentPage + 1).toString()}
            onClick={() => props.setCurrentPage(props.currentPage + 1)}
          />
        )}
        {props.currentPage <= totalPages - 2 && '...'}
        {props.currentPage != totalPages && (
          <Button
            variant="default"
            text={totalPages.toString()}
            onClick={() => {
              props.setCurrentPage(totalPages)
            }}
          />
        )}
        <Button
          variant="default"
          icon="slideRight"
          onClick={() =>
            props.setCurrentPage(
              props.currentPage == totalPages ? totalPages : props.currentPage + 1,
            )
          }
        />
      </PaginationContainer>
    </ThemeProvider>
  )
}

export default Pagination
