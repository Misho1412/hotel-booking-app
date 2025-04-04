import React, { useEffect, useState } from 'react';
import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  defaultValue?: [number, number];
  onChange?: (values: [number, number]) => void;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 10,
  defaultValue = [min, max],
  onChange,
  className = '',
}) => {
  const [values, setValues] = useState<[number, number]>(defaultValue);

  useEffect(() => {
    // Initialize with default values
    setValues(defaultValue);
  }, [defaultValue]);

  const handleChange = (newValues: number | number[]) => {
    // Ensure we have an array of two numbers
    if (Array.isArray(newValues) && newValues.length === 2) {
      const typedValues: [number, number] = [newValues[0], newValues[1]];
      setValues(typedValues);
      
      if (onChange) {
        onChange(typedValues);
      }
    }
  };

  return (
    <div className={`px-2 py-4 ${className}`}>
      <RcSlider
        range
        min={min}
        max={max}
        step={step}
        value={values}
        onChange={handleChange}
        trackStyle={[{ backgroundColor: '#10b981' }]} // Tailwind emerald-500
        handleStyle={[
          { 
            backgroundColor: 'white', 
            borderColor: '#10b981',
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
            width: 20,
            height: 20,
            marginTop: -8
          },
          { 
            backgroundColor: 'white', 
            borderColor: '#10b981',
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
            width: 20,
            height: 20,
            marginTop: -8
          },
        ]}
        railStyle={{ backgroundColor: '#e5e7eb' }} // Tailwind gray-200
      />
      
      <div className="flex justify-between mt-2 text-sm text-neutral-500">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
};

export default RangeSlider; 