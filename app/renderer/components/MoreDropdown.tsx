import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import { Container, DialogContainer, Icon, Option } from './styled/MoreDropdown'
import { IconType, ThemeType } from '../interfaces'
import { Icons } from '../assets/icons'
import { gql, useQuery } from '@apollo/client'

const GET_THEME = gql`
  query {
    theme @client
  }
`

const DropdownOption = (
  key: number,
  onClick: (e: React.MouseEvent) => void,
  icon: IconType,
  label: string,
): ReactElement => {
  return (
    <Option key={key} onClick={onClick}>
      <Icon>{Icons[icon](14, 14)}</Icon>
      {label}
    </Option>
  )
}

export type MoreDropdownOptions = {
  label: string
  icon: IconType
  onClick: (e: React.MouseEvent) => void
}[]

type MoreDropdownProps = {
  showDialog?: boolean
  disableClick?: boolean
  options: MoreDropdownOptions
  subtle?: boolean
}

function MoreDropdown(props: MoreDropdownProps): ReactElement {
  const [showDialog, setShowDialog] = useState(false)

  const node = useRef<HTMLDivElement>()

  const handleClick = (e): null => {
    if (node.current.contains(e.target)) {
      return
    }
    setShowDialog(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container ref={node}>
        <Button
          variant={props.subtle ? 'subtle' : 'default'}
          icon="more"
          size="sm"
          tooltipText="More actions"
          onClick={(e) => {
            setShowDialog(!showDialog)
            e.stopPropagation()
          }}
        />

        {(showDialog || props.showDialog) && (
          <>
            <DialogContainer
              onClick={() => {
                setShowDialog(false)
              }}
            >
              {props.options.map((v, i) => DropdownOption(i, v.onClick, v.icon, v.label))}
            </DialogContainer>
          </>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default MoreDropdown
