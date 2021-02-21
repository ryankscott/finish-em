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
      fill={colour ? colour : 'currentColor'}
      fillOpacity="1"
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l4 3.99L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" />
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
  dragHandle: (
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
      <path d="M20,9H4v2h16V9z M4,15h16v-2H4V15z" />
    </svg>
  ),
  terminal: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={'none'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  ),
  link: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={'none'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  ),
  bold: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={'none'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    </svg>
  ),
  italic: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={'none'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="4" x2="10" y2="4"></line>
      <line x1="14" y1="20" x2="5" y2="20"></line>
      <line x1="15" y1="4" x2="9" y2="20"></line>
    </svg>
  ),
  underline: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : '16'}
      height={height ? height : '16'}
      viewBox="0 0 24 24"
      fill={'none'}
      stroke={colour ? colour : 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
      <line x1="4" y1="21" x2="20" y2="21"></line>
    </svg>
  ),
  finish_em: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 1200"
      width={width ? width : '16'}
      height={height ? height : '16'}
    >
      <g filter="url(#filter0_d)">
        <rect x="100" y="100" width="1000" height="1000" rx="200" fill="#DBDBDB" />
        <rect x="100" y="100" width="1000" height="1000" rx="200" fill="url(#paint0_linear)" />
      </g>
      <g filter="url(#filter1_d)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M548.666 938.23L548.666 938.23L994.584 406.806C1005.38 393.935 1010.78 387.5 1012.4 380.482C1013.83 374.309 1013.26 367.843 1010.79 362.011C1007.97 355.382 1001.54 349.982 988.667 339.182L889.361 255.854C876.49 245.054 870.055 239.654 863.037 238.034C856.864 236.609 850.398 237.174 844.566 239.65C837.937 242.464 832.537 248.899 821.737 261.77L490.643 656.353L354.405 541.832C341.544 531.021 335.113 525.615 328.099 523.991C321.929 522.562 315.466 523.125 309.636 525.598C303.008 528.41 297.608 534.845 286.808 547.716L203.48 647.023C192.68 659.894 187.281 666.329 185.658 673.349C184.232 679.524 184.795 685.993 187.267 691.828C190.078 698.462 196.508 703.868 209.37 714.679L363.707 844.414C367.4 848.789 373.128 853.596 381.734 860.817L381.735 860.817L381.735 860.818L481.042 944.146L481.043 944.147C493.913 954.946 500.348 960.346 507.366 961.966C513.539 963.391 520.005 962.826 525.836 960.35C532.466 957.536 537.866 951.101 548.666 938.23Z"
          fill="url(#paint1_linear)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="92"
          y="100"
          width="1016"
          height="1018"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="10" />
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter1_d"
          x="180.887"
          y="237.265"
          width="836.285"
          height="733.47"
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
        <linearGradient
          id="paint0_linear"
          x1="600"
          y1="100"
          x2="600"
          y2="1100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.589017" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="945.5"
          y1="277.5"
          x2="405.5"
          y2="876"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0000" />
          <stop offset="1" stopColor="#6720FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
}
