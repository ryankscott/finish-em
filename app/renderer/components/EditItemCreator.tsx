import { gql, useMutation, useQuery } from '@apollo/client'
import React, { ReactElement, useEffect, useState } from 'react'
import Select from 'react-select'
import Switch from 'react-switch'
import { Label, Project } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
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
} from './styled/EditItemCreator'
import { ItemCreatorProps } from './ItemCreator'

const GET_COMPONENT_BY_KEY = gql`
  query ComponentByKey($key: String!) {
    projects(input: { deleted: false }) {
      key
      name
    }
    areas {
      key
      name
    }
    labels {
      key
      name
    }
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

type EditItemCreatorProps = {
  componentKey: string
  onClose: () => void
}

const EditItemCreator = (props: EditItemCreatorProps): ReactElement => {
  const [initiallyExpanded, setInitiallyExpanded] = useState(true)
  const [projectKey, setProjectKey] = useState('')
  const [labelKey, setLabelKey] = useState('')

  const [updateComponent] = useMutation(UPDATE_COMPONENT)
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  })
  useEffect(() => {
    if (loading === false && data) {
      setInitiallyExpanded(params.initiallyExpanded)
      setProjectKey(params.projectKey)
      setLabelKey(params.labelKey)
    }
  }, [loading, data])

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  let params: ItemCreatorProps = { initiallyExpanded: false }
  try {
    params = JSON.parse(data.component.parameters)
  } catch (error) {
    console.log('Failed to parse parameters')
    console.log(error)
    return null
  }

  const generateProjectOptions = (projects: Project[]): { value: string; label: string }[] => {
    return projects.map((p) => {
      return {
        value: p.key,
        label: p.name,
      }
    })
  }

  const generateLabelOptions = (labels: Label[]): { value: string; label: string }[] => {
    return [
      ...labels.map((a) => {
        return {
          value: a.key,
          label: a.name,
        }
      }),
      { value: '', label: 'No label' },
    ]
  }

  const theme: ThemeType = themes[data.theme]
  const projectOptions = generateProjectOptions(data.projects)
  const labelOptions = generateLabelOptions(data.labels)
  return (
    <ThemeProvider theme={theme}>
      <DialogContainer>
        <DialogHeader>
          <CloseButtonContainer>
            <Button
              type="default"
              iconSize="14"
              icon="close"
              onClick={() => {
                props.onClose()
              }}
            />
          </CloseButtonContainer>
        </DialogHeader>
        <Setting>
          <SettingLabel>Initially expanded:</SettingLabel>
          <SettingValue style={{ paddingTop: '7px' }}>
            <Switch
              checked={initiallyExpanded}
              onChange={(input) => {
                setInitiallyExpanded(input)
              }}
              onColor={theme.colours.primaryColour}
              checkedIcon={false}
              uncheckedIcon={false}
              width={24}
              height={14}
            />
          </SettingValue>
        </Setting>
        <Setting>
          <SettingLabel>Project:</SettingLabel>
          <SettingValue>
            <SelectContainer>
              <Select
                value={projectOptions.find((p) => p.value == projectKey)}
                onChange={(p) => {
                  setProjectKey(p.value)
                }}
                options={projectOptions}
                styles={selectStyles({
                  fontSize: 'xxsmall',
                  theme: theme,
                  minWidth: '180px',
                })}
                escapeClearsValue={true}
              />
            </SelectContainer>
          </SettingValue>
        </Setting>
        <Setting>
          <SettingLabel>Label:</SettingLabel>
          <SettingValue>
            <SelectContainer>
              <Select
                value={labelOptions.find((l) => l.value == labelKey)}
                onChange={(l) => {
                  setLabelKey(l.value)
                }}
                options={labelOptions}
                styles={selectStyles({
                  fontSize: 'xxsmall',
                  theme: theme,
                  minWidth: '180px',
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
                  parameters: {
                    initiallyExpanded: initiallyExpanded,
                    projectKey: projectKey,
                    labelKey: labelKey,
                  },
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

export default EditItemCreator
