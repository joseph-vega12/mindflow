import React, { FC } from 'react';

import InputRange from 'react-input-range';

import 'react-input-range/lib/css/index.css';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export const Slider: FC<SliderProps> = ({ min = 0, max = 10, value, step = 1, onChange, disabled = false }) => (
  <InputRange
    minValue={min}
    maxValue={max}
    value={value}
    step={step}
    disabled={disabled}
    // @ts-ignore
    onChange={(value) => onChange(value)}
  />
);
