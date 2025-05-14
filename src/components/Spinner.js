import React from 'react';
import './Spinner.scss';

const Spinner = () => {
  const circleElements = Array.from({ length: 12 }, (_, index) => <div key={index} className={`sk-circle${index + 1} sk-child`}></div>);

  return (
    <div className="sk-circle-container">
      <div className="sk-circle">{circleElements}</div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default Spinner;
