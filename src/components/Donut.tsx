import React from 'react'

interface DonutProps {
    size: number
    activeColour: string
    inactiveColour: string
    progress: number
}

export const Donut = (props: DonutProps): React.ReactElement => {
    return (
        <svg width={props.size} height={props.size} viewBox={`0 0 40 40`}>
            <circle
                className="donut-hole"
                cx={20}
                cy={20}
                r="15.91549430918954"
                stroke="transparent"
                fill="transparent"
            ></circle>
            <circle
                cx={20}
                cy={20}
                r="15.91549430918954"
                fill="transparent"
                color="white"
                stroke={props.inactiveColour}
                strokeWidth={2}
            ></circle>
            <circle
                cx={20}
                cy={20}
                r="15.91549430918954"
                fill="transparent"
                stroke={props.activeColour}
                strokeWidth={3}
                strokeDasharray={`${props.progress} ${100 - props.progress}`}
                strokeDashoffset="50"
            ></circle>
        </svg>
    )
}
