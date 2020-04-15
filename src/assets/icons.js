import React from 'react'

// TODO: Support colours
// TODO: Add types

export const repeatIcon = (width, height) => (
    <svg
        key="repeatIcon"
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="17 1 21 5 17 9"> </polyline>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"> </path>
        <polyline points="7 23 3 19 7 15"> </polyline>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"> </path>
    </svg>
)

export const dueIcon = (width, height) => (
    <svg
        key="dueIcon"
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10">
            {' '}
        </circle>
        <line x1="12" y1="8" x2="12" y2="12">
            {' '}
        </line>
        <line x1="12" y1="16" x2="12.01" y2="16">
            {' '}
        </line>
    </svg>
)

export const scheduledIcon = (width, height) => (
    <svg
        key="scheduledIcon"
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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

export const noteIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '18'}
        height={height ? height : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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

export const todoCheckedIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"> </path>
        <polyline points="22 4 12 14.01 9 11.01"> </polyline>
    </svg>
)

export const todoUncheckedIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
    </svg>
)

export const addIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '18'}
        height={height ? height : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

export const collapsedIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height={height ? height : '18'}
        width={width ? width : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6 9 12 15 18 9"> </polyline>
    </svg>
)

export const expandedIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height={height ? height : '18'}
        width={width ? width : '18'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6"> </polyline>
    </svg>
)

export const helpIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '24'}
        height={height ? height : '24'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CCC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"> </path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
)

export const closeIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
)

export const sortIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"> </polyline>
    </svg>
)

export const trashIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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

export const showIcon = (width, height) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ? width : '16'}
        height={height ? height : '16'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"> </path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
)

export const hideIcon = (width, height) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width ? width : '16'}
            height={height ? height : '16'}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    )
}
