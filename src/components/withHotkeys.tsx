import React from 'react'

export const withHotkeys = (WrappedComponent) => {
    return (props) => (
        <WrappedComponent handleHotkey={(e) => console.log(e.key)} {...props} />
    )
}
