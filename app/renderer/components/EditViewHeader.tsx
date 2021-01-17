import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
import { ThemeType } from '../interfaces'
import { gql, useMutation, useQuery } from '@apollo/client'
import Button from './Button'
import {
  CloseButtonContainer,
  DialogContainer,
  DialogHeader,
  SaveButtonContainer,
  SelectContainer,
  Setting,
  SettingLabel,
  SettingValue,
} from './styled/EditViewHeader'
import EditableText from './EditableText'
import Select from 'react-select'
import { startCase, upperFirst } from 'lodash'
import { Icons } from '../assets/icons'
import { ViewHeaderPropsInput } from '../../main/generated/typescript-helpers'

const GET_COMPONENT_BY_KEY = gql`
  query ComponentByKey($key: String!) {
    component(key: $key) {
      key
      parameters
    }
    theme @client
  }
`

const UPDATE_COMPONENT = gql`
  mutation SetParametersOfComponent($key: String!, $parameters: JSON!) {
    setParametersOfComponent(input: { key: $key, parameters: $parameters }) {
      key
      parameters
    }
  }
`

export type ViewHeaderProps = {
  componentKey: string
  onClose: () => void
}

const generateIconOptions = (): { value: string; label: string | JSX.Element }[] => {
  return Object.keys(Icons).map((i) => {
    return {
      value: i,
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ paddingRight: '5px', alignItems: 'center', display: 'flex' }}>
            {Icons[i](12, 12)}
          </span>
          {startCase(i)}
        </div>
      ),
    }
  })
}

const EditViewHeader = (props: ViewHeaderProps): ReactElement => {
  const nameRef = useRef<HTMLInputElement>()
  const [updateComponent] = useMutation(UPDATE_COMPONENT)
  const [headerName, setHeaderName] = useState('')
  const [icon, setIcon] = useState('')
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  })

  useEffect(() => {
    if (loading === false && data) {
      setHeaderName(params.name)
      setIcon(params.icon)
    }
  }, [loading, data])

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  let params: ViewHeaderPropsInput = { name: '' }
  try {
    params = JSON.parse(data.component.parameters)
  } catch (error) {
    console.log('Failed to parse parameters')
    console.log(error)
    return null
  }

  const theme: ThemeType = themes[data.theme]
  const options = generateIconOptions()

  return (
    <ThemeProvider theme={theme}>
      <DialogContainer>
        <DialogHeader>
          <CloseButtonContainer>
            <Button type="default" iconSize="14" icon="close" onClick={props.onClose} />
          </CloseButtonContainer>
        </DialogHeader>
        <Setting>
          <SettingLabel>Name:</SettingLabel>
          <SettingValue>
            <EditableText
              innerRef={nameRef}
              key={'ed-name'}
              input={headerName}
              fontSize={'xsmall'}
              shouldSubmitOnBlur={true}
              onEscape={() => {}}
              singleline={true}
              shouldClearOnSubmit={false}
              onUpdate={(input) => {
                setHeaderName(input)
              }}
            />
          </SettingValue>
        </Setting>
        <Setting>
          <SettingLabel>Icon:</SettingLabel>
          <SettingValue>
            <SelectContainer>
              <Select
                value={options.find((o) => o.value == icon)}
                onChange={(i) => {
                  setIcon(i.value)
                }}
                options={generateIconOptions()}
                styles={selectStyles({
                  fontSize: 'xsmall',
                  theme: theme,
                  minWidth: '140px',
                })}
                escapeClearsValue={true}
              />
            </SelectContainer>
          </SettingValue>
        </Setting>
        <SaveButtonContainer>
          <Button
            text="Save"
            type={'primary'}
            icon="save"
            onClick={() => {
              updateComponent({
                variables: {
                  key: props.componentKey,
                  parameters: { name: headerName, icon: icon },
                },
              })
              props.onClose()
            }}
          />
        </SaveButtonContainer>
      </DialogContainer>
    </ThemeProvider>
  )
}
export default EditViewHeader
