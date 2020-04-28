import React from 'react'

import * as CSS from 'csstype'

export const repeatIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        key="repeatIcon"
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="17 1 21 5 17 9"> </polyline>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"> </path>
        <polyline points="7 23 3 19 7 15"> </polyline>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"> </path>
    </svg>
)

export const dueIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        key="dueIcon"
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
<line x1="4" y1="22" x2="4" y2="15"></line>
</svg>
)

export const scheduledIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill={colour ? colour : 'currentColor'}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
)

export const noteIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '18'}
        height={height ? height : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"> </polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"> </polyline>
    </svg>
)

export const todoCheckedIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"> </path>
        <polyline points="22 4 12 14.01 9 11.01"> </polyline>
    </svg>
)

export const todoUncheckedIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
    </svg>
)

export const addIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '18'}
        height={height ? height : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

export const collapsedIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height={height ? height : '18'}
        width={width ? width : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6 9 12 15 18 9"> </polyline>
    </svg>
)

export const expandedIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height={height ? height : '18'}
        width={width ? width : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6"> </polyline>
    </svg>
)

export const helpIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        id="help"
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '24'}
        height={height ? height : '24'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"> </path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
)

export const closeIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
)

export const trashIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="3 6 5 6 21 6"> </polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
)

export const showIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '14'}
        height={height ? height : '14'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"> </path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
)

export const hideIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width ? width : '14'}
            height={height ? height : '14'}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colour ? colour : 'currentColor'}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    )

export const sortIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width ? width : '16'}
            height={height ? height : '16'}
            viewBox="0 0 24 24"
            stroke={colour ? colour : 'currentColor'}
        >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
        </svg>
    )
}

export const trashSweepIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 32 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="3 6 5 6 21 6"> </polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
        <line x1="25" y1="8" x2="32" y2="8"></line>
        <line x1="25" y1="14" x2="30" y2="14"></line>
        <line x1="25" y1="20" x2="28" y2="20"></line>
    </svg>
)

export const inboxIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    </svg>
)

export const calendarIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
)

export const slideLeftIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="11 17 6 12 11 7"></polyline>
        <polyline points="18 17 13 12 18 7"></polyline>
    </svg>
)

export const slideRightIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="13 17 18 12 13 7"></polyline>
        <polyline points="6 17 11 12 6 7"></polyline>
    </svg>
)

export const upLevelIcon = (
    width?: CSS.WidthProperty<number>,
    height?: CSS.HeightProperty<number>,
    colour?: CSS.Color,
): React.SVGProps<SVGSVGElement> => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour ? colour : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 14 4 9 9 4"></polyline>
        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
    </svg>
)
