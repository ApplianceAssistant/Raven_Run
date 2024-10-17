import React from 'react';
import '../css/ToggleSwitch.scss';

const ToggleSwitch = ({ checked, onToggle, label, name, id }) => {
  console.log("ToggleSwitch ","label:", label , " checked: ", checked);
  return (
    <div className="toggle-switch-container">
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          name={name}
          id={id}
        />
        <span className="slider round"></span>
      </label>
      <span className="toggle-label">{label}</span>

    </div>
  );
};

export default ToggleSwitch;