import React, { ReactElement } from 'react'
import BeatLoader from 'react-spinners/BeatLoader'
import styled, { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  padding: 20px 0px;
`

type SpinnerProps = {
  loading: boolean
}

export const Spinner = (props: SpinnerProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <SpinnerContainer>
        <BeatLoader size={10} color={theme.colours.primaryColour} loading={props.loading} />
      </SpinnerContainer>
    </ThemeProvider>
  )
}
