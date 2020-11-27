import { gql, useQuery } from '@apollo/client'
import CSS from 'csstype'
import { transparentize } from 'polished'
import React, { ReactElement } from 'react'
import { Label } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import ButtonDropdown from './ButtonDropdown'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Property.Color }

const generateLabelOptions = (labels: Label[]): OptionType[] => {
  return [
    ...labels.map((l: Label) => {
      return {
        value: l.key,
        label: l.name,
        color: transparentize(0.8, l.colour),
      }
    }),
    { value: '', label: 'No label', color: '' },
  ]
}

const GET_DATA = gql`
  query {
    labels {
      key
      name
      colour
    }
    theme @client
  }
`

interface LabelSelectProps {
  label: Label
  completed: boolean
  deleted: boolean
  onSubmit: (labelKey: string) => void
}

export default function LabelSelect(props: LabelSelectProps): ReactElement {
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <div>
        <ButtonDropdown
          buttonText={props.label?.name}
          buttonIconColour={props.label?.colour}
          defaultButtonIcon={'label'}
          defaultButtonText={'Add Label'}
          selectPlaceholder={'Search for label'}
          options={generateLabelOptions(data.labels)}
          deleted={props.deleted}
          completed={props.completed}
          onSubmit={(labelKey) => {
            props.onSubmit(labelKey)
          }}
        />
      </div>
    </ThemeProvider>
  )
}
