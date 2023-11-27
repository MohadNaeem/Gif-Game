import React, { useState, useEffect } from 'react'

const ProgressRing = ({ progress, timer, tableTime, outside = false }) => {
  const strokeWidth = 2
  const radius = 22
  const normalizedRadius = radius - strokeWidth * 2

  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference
  return (
    <div id='countdown'>
      <div
        id='countdown-number'
        style={{
          color: `${
            tableTime === 10
              ? timer <= 3 && timer > -3
                ? '#ef4444'
                : outside
                ? 'goldenrod'
                : 'goldenrod'
              : timer <= 5 && timer > -3
              ? '#ef4444'
              : outside
              ? 'goldenrod'
              : 'goldenrod'
          }`,
        }}
      >
        {timer}
      </div>
      <svg className='countdown-svg'>
        <circle
          cx='20'
          cy='20'
          className={`stroke-current ${progress === 0 ? 'opacity-0' : ''}`}
          strokeWidth={strokeWidth}
          fill='transparent'
          r={normalizedRadius}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: strokeDashoffset,
            stroke: `${
              tableTime === 10
                ? timer <= 3 && timer > -3
                  ? '#ef4444'
                  : outside
                  ? 'goldenrod'
                  : 'goldenrod'
                : timer <= 5 && timer > -3
                ? '#ef4444'
                : outside
                ? 'goldenrod'
                : 'goldenrod'
            }`,
          }}
        />
      </svg>
    </div>
  )
}

export default ProgressRing
