import { connect } from 'react-redux'
import React, { ReactElement } from 'react'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'
import { PAGE_SIZE } from '../consts'
import Button from './Button'
import { PaginationContainer } from './styled/Pagination'

interface StateProps {
  theme: string
}

interface DispatchProps {}

export interface OwnProps {
  currentPage: number
  itemsLength: number
  setCurrentPage: (page: number) => void
}
export type FilteredItemListProps = StateProps & DispatchProps & OwnProps
function Pagination(props: PaginationProps): ReactElement {
  const theme = themes[props.theme]

  const totalPages = Math.ceil(props.itemsLength / PAGE_SIZE)
  if (props.itemsLength < PAGE_SIZE) return null

  return (
    <ThemeProvider theme={theme}>
      <PaginationContainer>
        <Button
          type="default"
          icon="slideLeft"
          onClick={() =>
            props.setCurrentPage(props.currentPage == 1 ? props.currentPage : props.currentPage - 1)
          }
        />
        {props.currentPage != 1 && (
          <Button type="default" text={'1'} onClick={() => props.setCurrentPage(1)} />
        )}
        {props.currentPage >= 4 && '...'}
        {props.currentPage >= 3 && (
          <Button
            type="default"
            text={(props.currentPage - 1).toString()}
            onClick={() => props.setCurrentPage(props.currentPage - 1)}
          />
        )}

        <Button textWeight="700" type="default" text={props.currentPage.toString()} />
        {props.currentPage <= totalPages - 2 && (
          <Button
            type="default"
            text={(props.currentPage + 1).toString()}
            onClick={() => props.setCurrentPage(props.currentPage + 1)}
          />
        )}
        {props.currentPage <= totalPages - 2 && '...'}
        {props.currentPage != totalPages && (
          <Button
            type="default"
            text={totalPages.toString()}
            onClick={() => {
              props.setCurrentPage(totalPages)
            }}
          />
        )}
        <Button
          type="default"
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

const mapStateToProps = (state, ownProps): StateProps => ({
  theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Pagination)
