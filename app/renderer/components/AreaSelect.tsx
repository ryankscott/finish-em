import React, { ReactElement } from 'react'
import { Area } from '../../main/generated/typescript-helpers'
import ButtonDropdown from './ButtonDropdown'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'
import CSS from 'csstype'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Property.Color }
const generateAreaOptions = (area: Area, areas: Area[]): OptionType[] => {
  const filteredAreas = areas.filter((a) => a.key != area?.key).filter((a) => a.deleted == false)
  return [
    ...filteredAreas.map((a) => {
      return {
        value: a.key,
        label: a.name,
      }
    }),
    { value: null, label: 'None' },
  ]
}

const GET_DATA = gql`
  query {
    areas {
      key
      name
      deleted
    }
    theme @client
  }
`
interface AreaSelectProps {
  area: Area
  completed: boolean
  deleted: boolean
  onSubmit: (areaKey: string) => void
}

export default function AreaSelect(props: AreaSelectProps): ReactElement {
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
          buttonText={props.area?.name}
          defaultButtonIcon={'area'}
          defaultButtonText={'No area'}
          selectPlaceholder={'Area: '}
          options={generateAreaOptions(props.area, data.areas)}
          deleted={props.deleted}
          completed={props.completed}
          onSubmit={(areaKey) => {
            props.onSubmit(areaKey)
          }}
        />
      </div>
    </ThemeProvider>
  )
}
