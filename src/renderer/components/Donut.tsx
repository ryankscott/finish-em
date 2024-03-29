import { useTheme } from '@chakra-ui/react';
import React from 'react';

interface DonutProps {
  size: number;
  progress: number;
}

export const Donut = (props: DonutProps): React.ReactElement => {
  const theme = useTheme();
  return (
    <div style={{ margin: '5px' }}>
      <svg width={props.size} height={props.size} viewBox={`0 0 40 40`}>
        <circle
          className="donut-hole"
          cx={20}
          cy={20}
          r="15.91549430918954"
          stroke="transparent"
          fill="transparent"
        />
        <circle
          cx={20}
          cy={20}
          r="15.91549430918954"
          fill="transparent"
          color="white"
          stroke={theme.colors.gray[300]}
          strokeWidth={2}
        />
        <circle
          cx={20}
          cy={20}
          r="15.91549430918954"
          fill="transparent"
          stroke={theme.colors.blue[500]}
          strokeWidth={3}
          strokeDasharray={`${props.progress} ${100 - props.progress}`}
          strokeDashoffset="50"
          style={{ transition: 'all 0.2s ease-in-out' }}
        />
      </svg>
    </div>
  );
};
