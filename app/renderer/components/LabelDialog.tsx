import { gql, useMutation, useQuery } from '@apollo/client'
import React, { ReactElement } from 'react'
import { Label } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import {
  BodyContainer,
  Container,
  HeaderContainer,
  LabelContainer,
  LabelHeader,
  LabelName,
} from './styled/LabelDialog'

const GET_LABELS = gql`
  query {
    labels {
      key
      name
      colour
    }
    theme @client
  }
`

const SET_LABEL = gql`
  mutation SetLabelOfItem($key: String!, $labelKey: String) {
    setLabelOfItem(input: { key: $key, labelKey: $labelKey }) {
      key
      label {
        key
      }
    }
  }
`

type LabelDialogProps = {
  itemKey: string
  onClose: () => void
}
function LabelDialog(props: LabelDialogProps): ReactElement {
  const { loading, error, data } = useQuery(GET_LABELS)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const [setLabel] = useMutation(SET_LABEL)
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderContainer>
          <LabelHeader>Labels</LabelHeader>
          <Button
            type="default"
            spacing="compact"
            iconSize="12px"
            onClick={() => {
              props.onClose()
            }}
            icon={'close'}
          />
        </HeaderContainer>
        <BodyContainer>
          {data.labels.map((m: Label) => {
            return (
              <div key={m.key}>
                <LabelContainer
                  key={'lc-' + m.key}
                  colour={m.colour}
                  onClick={() => {
                    setLabel({ variables: { key: props.itemKey, labelKey: m.key } })
                    props.onClose()
                  }}
                >
                  <LabelName colour={m.colour}>{m.name}</LabelName>
                </LabelContainer>
              </div>
            )
          })}
          <LabelContainer key={''} colour={''}>
            <LabelName
              colour={''}
              onClick={(e) => {
                setLabel({ variables: { key: props.itemKey, labelKey: null } })
                e.stopPropagation()
                props.onClose()
              }}
            >
              {'No label'}
            </LabelName>
          </LabelContainer>
        </BodyContainer>
      </Container>
    </ThemeProvider>
  )
}

export default LabelDialog
