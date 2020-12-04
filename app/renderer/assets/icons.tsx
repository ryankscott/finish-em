/* eslint-disable react/display-name */
import React from 'react'
import * as CSS from 'csstype'
import { IconType } from '../interfaces'

export const Icons: {
  [key: IconType]: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ) => React.SVGProps<SVGSVGElement>
} = {
  repeat: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      key="repeat"
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
  ),
  due: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      key="due"
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
    </svg>
  ),
  scheduled: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  note: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  todoChecked: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  todoUnchecked: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  add: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <line x1="12" y1="4" x2="12" y2="20"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
    </svg>
  ),

  collapse: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),
  expand: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  help: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  close: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  trash: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  show: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  hide: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  sort: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      stroke="none"
      fill={colour ? colour : 'currentColor'}
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
    </svg>
  ),

  trashSweep: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <polyline
        transform="matrix(1.2986688,0,0,1.3641064,-3.7558438,-4.2473659)"
        id="polyline68"
        points="3 6 5 6 21 6"
      />
      <path
        id="path70"
        d="M 20.56441,3.9177464 V 23.060795 a 2.5242294,2.7347212 0 0 1 -2.524229,2.73472 H 5.4190333 A 2.5242294,2.7347212 0 0 1 2.894804,23.060795 V 3.9177464 m 3.7863441,0 V 1.1830252 A 2.5242294,2.7347212 0 0 1 9.205377,-1.551696 h 5.04846 a 2.5242294,2.7347212 0 0 1 2.52423,2.7347212 v 2.7347212"
      />
      <line id="line74" y2="20.998405" x2="14.595375" y1="9" x1="14.595375" />
      <line id="line76" y2="8.5773249" x2="32" y1="8.5773249" x1="24" />
      <line id="line78" y2="13.59158" x2="29.99979" y1="13.59158" x1="23.99979" />
      <line id="line80" y2="18.540035" x2="26.99979" y1="18.540035" x1="23.99979" />
      <line x1="8.5953751" y1="9" x2="8.5953751" y2="20.998405" id="line74-9" />
    </svg>
  ),

  inbox: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  calendar: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z" />
    </svg>
  ),

  slideLeft: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  slideRight: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  upLevel: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
  ),

  back: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  forward: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),

  settings: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),

  subtask: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      stroke={colour ? colour : 'currentColor'}
      fill={colour ? colour : 'currentColor'}
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect fill="none" height="24" width="24" id="rect881" x="0" y="-24" transform="rotate(90)" />
      <path d="m 12.75,24 h 10.5 v -8 h -4.5 c -0.0351,-1.235437 -0.06497,-3.76714 0,-5 h -6 V 8 H 17 V 0 H 7 v 8 h 4.25 v 3 h -6 v 5 h -4.5 v 8 h 10.6 l -0.1,-8 h -4.5 v -3.5 h 10.5 V 16 h -4.5 z M 8.5,6.5 v -5 h 7 v 5 z m 1.25,11 v 5 h -7.5 v -5 z m 12,0 v 5 h -7.5 v -5 z" />
    </svg>
  ),

  more: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  ),

  flag: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  ),

  trashPermanent: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
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
      <polyline id="polyline90" points="3 6 5 6 21 6" />
      <path
        id="path92"
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      />
      <g transform="translate(0.5,0.5)" id="g108">
        <line x1="14.671" y1="10.463" x2="8.463" y2="16.670" />
        <line x1="8.463" y1="10.463" x2="14.671" y2="16.670" />
      </g>
    </svg>
  ),

  stale: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g>
        <path d="M18,22l-0.01-6L14,12l3.99-4.01L18,2H6v6l4,4l-4,3.99V22H18z M8,7.5V4h8v3.5l-4,4L8,7.5z" />
      </g>
    </svg>
  ),

  darkMode: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),

  label: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  ),

  sortDirection: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
    </svg>
  ),
  edit: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '12'}
      height={height ? height : '12'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  ),

  colour: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '12'}
      height={height ? height : '12'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z" />
      <circle cx="6.5" cy="11.5" r="1.5" />
      <circle cx="9.5" cy="7.5" r="1.5" />
      <circle cx="14.5" cy="7.5" r="1.5" />
      <circle cx="17.5" cy="11.5" r="1.5" />
    </svg>
  ),
  expandAll: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '12'}
      height={height ? height : '12'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z" />
    </svg>
  ),

  collapseAll: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '12'}
      height={height ? height : '12'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z" />
    </svg>
  ),
  restore: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill="transparent"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path
        d="m 11.99562,17.511384 -0.0078,-7.009398 3.014629,3.506433 -3.014643,-3.506433 -2.9989796,3.506433 3.0067416,-3.502966 z"
        fill={colour ? colour : 'currentColor'}
      />
    </svg>
  ),
  save: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill="rgba(255,255,255,255)"
      fillOpacity="0"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  feedback: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      fillOpacity="1"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zm-9-4h2v2h-2zm0-6h2v4h-2z" />
    </svg>
  ),
  view: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      fillOpacity="0"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  ),
  area: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      fillOpacity="0"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  project: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      fillOpacity="1"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 9l-1.41-1.42L10 14.17l-2.59-2.58L6 13l4 4zm1-6h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04-.39.08-.74.28-1.01.55-.18.18-.33.4-.43.64-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z" />
    </svg>
  ),
  copy: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      fillOpacity="0"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  reminder: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      fillOpacity="0"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  weekly: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={colour ? colour : 'currentColor'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
    </svg>
  ),
  finish_em: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 752 688"
      width={width ? width : '16'}
      height={height ? height : '16'}
    >
      <g filter="url(#filter0_d)">
        <path
          d="M328.821 639.56C318.021 652.431 312.622 658.866 305.992 661.681C300.16 664.156 293.694 664.722 287.521 663.297C280.503 661.676 274.068 656.276 261.197 645.477L181.529 578.627C168.658 567.827 162.223 562.427 159.408 555.797C156.933 549.965 156.367 543.5 157.792 537.327C159.413 530.309 164.813 523.874 175.612 511.003L563.856 48.312C574.656 35.4412 580.056 29.0058 586.686 26.1917C592.517 23.7162 598.983 23.1505 605.156 24.5757C612.174 26.1959 618.609 31.5958 631.48 42.3956L711.149 109.246C724.019 120.045 730.455 125.445 733.269 132.075C735.744 137.907 736.31 144.373 734.885 150.546C733.265 157.563 727.865 163.999 717.065 176.869L328.821 639.56Z"
          fill="#995DE5"
          fillOpacity="0.6"
        />
      </g>
      <g filter="url(#filter1_d)">
        <path
          d="M28.7431 449.095C15.8818 438.284 9.45115 432.878 6.64058 426.244C4.16834 420.409 3.60525 413.94 5.03202 407.765C6.65404 400.745 12.054 394.31 22.8538 381.439L89.7037 301.77C100.504 288.899 105.903 282.464 112.531 279.652C118.362 277.179 124.825 276.616 130.995 278.045C138.009 279.669 144.439 285.075 157.301 295.886L390.007 491.497C402.868 502.309 409.299 507.714 412.109 514.348C414.582 520.184 415.145 526.653 413.718 532.828C412.096 539.847 406.696 546.283 395.896 559.154L329.046 638.822C318.246 651.693 312.846 658.128 306.218 660.94C300.388 663.414 293.925 663.976 287.755 662.548C280.741 660.923 274.311 655.517 261.449 644.706L28.7431 449.095Z"
          fill="#45B9EF"
          fillOpacity="0.6"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="140.759"
          y="11.5418"
          width="611.16"
          height="672.789"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter1_d"
          x="0.260986"
          y="277.272"
          width="418.228"
          height="394.048"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  ),
}
