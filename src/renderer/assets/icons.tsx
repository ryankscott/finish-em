/* eslint-disable react/display-name */
import React from 'react';
import * as CSS from 'csstype';
import { tint } from 'polished';
import { IconType } from '../interfaces';

export const convertSVGElementToReact = (svg: React.SVGProps<SVGElement>) => (
  <>{svg}</>
);

export const Icons: Record<
  IconType,
  (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ) => React.SVGProps<SVGSVGElement>
> = {
  repeat: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      key="repeat"
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      key="due"
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z" />
    </svg>
  ),

  scheduled: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '18'}
      height={height || '18'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8"> </polyline>
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9"> </polyline>
    </svg>
  ),

  todoChecked: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour ? tint(0.4, colour) : 'none'}
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),

  add: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '14'}
      height={height || '14'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),

  collapse: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height || '18'}
      width={width || '18'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height || '18'}
      width={width || '18'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      id="help"
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"> </path>
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),

  close: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  trash: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"> </polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),

  show: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '14'}
      height={height || '14'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"> </path>
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  hide: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '14'}
      height={height || '14'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),

  sort: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      stroke="none"
      fill={colour || 'currentColor'}
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
    </svg>
  ),

  trashSweep: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 32 24"
      fill="none"
      stroke={colour || 'currentColor'}
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
      <line
        id="line78"
        y2="13.59158"
        x2="29.99979"
        y1="13.59158"
        x1="23.99979"
      />
      <line
        id="line80"
        y2="18.540035"
        x2="26.99979"
        y1="18.540035"
        x1="23.99979"
      />
      <line x1="8.5953751" y1="9" x2="8.5953751" y2="20.998405" id="line74-9" />
    </svg>
  ),

  inbox: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),

  calendar: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  ),

  slideRight: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  ),

  upLevel: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
    >
      <polyline points="14 9 9 4 4 9" />
      <path d="M20 20h-7a4 4 0 0 1-4-4V4" />
    </svg>
  ),

  back: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  forward: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),

  settings: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  subtask: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      stroke={colour || 'currentColor'}
      fill={colour || 'currentColor'}
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        fill="none"
        height="24"
        width="24"
        id="rect881"
        x="0"
        y="-24"
        transform="rotate(90)"
      />
      <path d="m 12.75,24 h 10.5 v -8 h -4.5 c -0.0351,-1.235437 -0.06497,-3.76714 0,-5 h -6 V 8 H 17 V 0 H 7 v 8 h 4.25 v 3 h -6 v 5 h -4.5 v 8 h 10.6 l -0.1,-8 h -4.5 v -3.5 h 10.5 V 16 h -4.5 z M 8.5,6.5 v -5 h 7 v 5 z m 1.25,11 v 5 h -7.5 v -5 z m 12,0 v 5 h -7.5 v -5 z" />
    </svg>
  ),

  more: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),

  flag: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),

  trashPermanent: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),

  label: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),

  sortDirection: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '12'}
      height={height || '12'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),

  colour: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '12'}
      height={height || '12'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '12'}
      height={height || '12'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '12'}
      height={height || '12'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="1"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="rgba(255,255,255,255)"
      fillOpacity="0"
      stroke={colour || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  feedback: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="1"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="0"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  area: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="0"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  project: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="1"
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="0"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  reminder: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      fillOpacity="0"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  weekly: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill={colour || 'currentColor'}
      stroke={colour || 'currentColor'}
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
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  move: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 16 16 12 12 8" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  refresh: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  lightMode: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '16'}
      height={height || '16'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour || 'currentColor'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  finish_em: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 1200"
      width={width || '16'}
      height={height || '16'}
    >
      <g filter="url(#filter0_d)">
        <rect
          x="100"
          y="100"
          width="1000"
          height="1000"
          rx="200"
          fill="#DBDBDB"
        />
        <rect
          x="100"
          y="100"
          width="1000"
          height="1000"
          rx="200"
          fill="url(#paint0_linear)"
        />
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
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
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
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
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
  notes: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 32"
      width={width || '16'}
      height={height || '16'}
    >
      <g filter="url(#filter0_d)">
        <path d="M9 16.7768H19V19.1735H9V16.7768Z" fill="url(#paint0_linear)" />
        <path d="M9 11.9835H19V14.3801H9V11.9835Z" fill="url(#paint1_linear)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.5 0H6.5C5.125 0 4 1.07851 4 2.39669V21.5702C4 22.8884 5.1125 23.9669 6.4875 23.9669H21.5C22.875 23.9669 24 22.8884 24 21.5702V7.19007L16.5 0ZM21.5 21.5702H6.5V2.39669H15.25V8.38842H21.5V21.5702Z"
          fill="url(#paint2_linear)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0"
          y="0"
          width="28"
          height="31.9669"
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
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear"
          x1="25.0075"
          y1="4.39617"
          x2="5.0326"
          y2="26.1273"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4AAFE9" />
          <stop offset="1" stopColor="#6720FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="25.0075"
          y1="4.39617"
          x2="5.0326"
          y2="26.1273"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4AAFE9" />
          <stop offset="1" stopColor="#6720FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="25.0075"
          y1="4.39617"
          x2="5.0326"
          y2="26.1273"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4AAFE9" />
          <stop offset="1" stopColor="#6720FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  todos: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 32"
      width={width || '16'}
      height={height || '16'}
    >
      <g filter="url(#filter0_d)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.9104 23.1387C15.1225 23.0487 15.2953 22.8427 15.6409 22.4309L29.9103 5.42531C30.2559 5.01345 30.4287 4.80751 30.4805 4.58295C30.5261 4.38541 30.508 4.17851 30.4288 3.99189C30.3388 3.77974 30.1328 3.60694 29.721 3.26135L26.5431 0.594843C26.1313 0.249248 25.9253 0.0764509 25.7008 0.0246052C25.5032 -0.0209996 25.2963 -0.00289791 25.1097 0.0763158C24.8976 0.16637 24.7248 0.372302 24.3792 0.784167L13.7842 13.4108L9.42457 9.74615C9.01301 9.40019 8.80723 9.22721 8.58278 9.17523C8.38534 9.1295 8.17852 9.14751 7.99196 9.22666C7.77986 9.31664 7.60707 9.52257 7.26147 9.93444L4.59497 13.1123C4.24938 13.5241 4.07658 13.73 4.02467 13.9547C3.97902 14.1523 3.99704 14.3593 4.07615 14.546C4.16609 14.7583 4.37187 14.9313 4.78343 15.2772L9.72223 19.4288C9.8404 19.5688 10.0237 19.7226 10.2991 19.9537L10.2991 19.9537L13.4769 22.6202C13.8888 22.9658 14.0947 23.1386 14.3193 23.1904C14.5168 23.236 14.7238 23.2179 14.9104 23.1387Z"
          fill="url(#paint0_linear)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0"
          y="0"
          width="34.5051"
          height="31.215"
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
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear"
          x1="28.3396"
          y1="1.28752"
          x2="11.0596"
          y2="20.4395"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0000" />
          <stop offset="1" stopColor="#6720FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  bear: (
    width?: CSS.Property.Width,
    height?: CSS.Property.Height,
    colour?: CSS.Property.Color
  ): React.SVGProps<SVGSVGElement> => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={width || '16'}
      height={height || '16'}
    >
      <defs>
        <path
          d="M36.4731588,54.1000025 C32.1372057,53.8032112 20.3108863,53.0117794 12.3384586,49.3912148 C5.89109393,46.4632359 2.63600006,40.5350121 2.63600006,40.5350121 C2.63600006,40.5350121 4.90456161,29.8098131 6.59236116,25.5510862 C8.27598837,21.3028873 12.7547143,15.0303309 12.7547143,15.0303309 C12.7547143,15.0303309 12.2709698,10.1779824 14.3143534,10.1779824 C16.8491107,10.1779824 19.2033412,12.722764 19.2033412,12.722764 C19.2033412,12.722764 26.8910907,11.6736603 29.4367595,14.6837345 C32.3184106,18.0910841 38.8505708,19.9718349 38.8505708,19.9718349 C38.8505708,19.9718349 41.188477,19.2870699 40.2251575,22.951569 C39.2618379,26.6160682 36.0237119,29.8373991 29.5359385,29.8421559 C27.2195011,29.8438542 26.4954309,31.2599202 26.6176816,33.105413 C26.8733604,36.965135 30.6960205,42.8773535 30.6960205,42.8773535 C30.6960205,42.8773535 38.3119065,54.2258627 36.4731588,54.1000025 Z"
          id="path-4"
        />
        <path
          d="M34.0731588,44.1000025 C30.5848924,43.8612344 16.2824932,43.6845712 9.49658538,40.7488808 C1.02612008,37.0844244 0.236000061,30.5350121 0.236000061,30.5350121 C0.236000061,30.5350121 2.50456161,19.8098131 4.19236116,15.5510862 C5.87598837,11.3028873 10.3547143,5.03033089 10.3547143,5.03033089 C10.3547143,5.03033089 9.87096977,0.177982367 11.9143534,0.177982367 C14.4491107,0.177982367 16.8033412,2.72276403 16.8033412,2.72276403 C16.8033412,2.72276403 24.4910907,1.67366034 27.0367595,4.68373452 C29.9184106,8.09108414 36.4505708,9.9718349 36.4505708,9.9718349 C36.4505708,9.9718349 38.788477,9.28706986 37.8251575,12.951569 C36.8618379,16.6160682 33.6237119,19.8373991 27.1359385,19.8421559 C24.8195011,19.8438542 24.0954309,21.2599202 24.2176816,23.105413 C24.4733604,26.965135 28.2960205,32.8773535 28.2960205,32.8773535 C28.2960205,32.8773535 35.9119065,44.2258627 34.0731588,44.1000025 Z"
          id="path-7"
        />
      </defs>
      <g
        id="bear-logo-page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <g id="header" transform="translate(-449.000000, -31.000000)">
          <g id="navigation" transform="translate(449.000000, 31.000000)">
            <g id="icon">
              <g id="Oval-mask-copy" />
              <g id="Bear-fill" mask="url(#mask-2)">
                <use
                  fill={colour || '#000'}
                  fillRule="evenodd"
                  xlinkHref="#path-4"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  ),
};
