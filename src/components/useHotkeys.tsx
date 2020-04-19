import React, { useEffect, useState } from 'react'

const MAX_SEQUENCE_LENGTH = 3
// Create a function that takes handlers and hotkeys and runs the handler
export function useHotkeys(
    shortcuts: {},
    handlers: {},
    stopListening: boolean,
): void {
    const [activeKeys, setActiveKeys] = useState([])
    const [timeouts, addTimeout] = useState([])

    const handleKeydown = (event: React.KeyboardEvent): null => {
        if (!document.hasFocus(event.currentTarget)) {
            return
        }

        setActiveKeys([...activeKeys, event.key])

        // Don't handle key presses if we're editing the description
        if (stopListening) return

        // Remove the first value in the array
        if (activeKeys.length >= MAX_SEQUENCE_LENGTH) {
            setActiveKeys([...activeKeys.slice(1), event.key])
        } else {
            setActiveKeys([...activeKeys, event.key])
        }
        /*
 // Clear keypress history if using the arrow keys. Enables quick scrolling
 if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
     setTimeout(() => {
         setKeyPresses([])
     }, 200)


*/
        for (const [name, shortcut] of Object.entries(shortcuts)) {
            /*
                name: "TOGGLE_CHILDREN"
                shortcut: "i t"
            */
            const pressedKeys = activeKeys.join(' ')
            if (pressedKeys.includes(shortcut)) {
                if (handlers[name]) {
                    if (document.hasFocus(event.currentTarget)) {
                        handlers[name](event)
                    }
                } else {
                    console.log('unhandled shortcut - ' + name)
                }
            }
        }
    }
    useEffect(() => {
        // Add our event listeners
        window.addEventListener('keydown', handleKeydown)
        return () => {
            // Remove our event listeners on cleanup
            window.removeEventListener('keydown', handleKeydown)
        }
    })

    // TODO: This always fires as it alters activeKeys
    useEffect(() => {
        timeouts.map((t) => clearTimeout(t))
        addTimeout([
            setTimeout(() => {
                setActiveKeys(activeKeys.slice(1))
            }, 200),
        ])
    }, [activeKeys])
}
