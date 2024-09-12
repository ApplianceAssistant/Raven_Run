import React from 'react';
import '../css/ToggleSwitch.scss';

const ToggleSwitch = ({ isChecked, onToggle, label }) => {
  return (
    <div className="toggle-switch">
      <label className="switch">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
        />
        <span className="slider round"></span>
      </label>
      <span className="toggle-label">{label}</span>
    </div>
  );
};

export default ToggleSwitch;