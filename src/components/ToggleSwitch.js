import React from 'react';

const ToggleSwitch = ({ checked, onToggle, label, name, id }) => {
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