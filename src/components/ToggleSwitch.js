import React from 'react';

const ToggleSwitch = ({ checked, onToggle, label, name, id }) => {
  const handleChange = (e) => {
    onToggle(e.target.checked);
  };

  return (
    <div className="toggle-switch-container">
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
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