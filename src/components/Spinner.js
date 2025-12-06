import React from 'react';
import { createPortal } from 'react-dom';
import './Spinner.scss';

const Spinner = () => {
  const circleElements = Array.from({ length: 12 }, (_, index) => <div key={index} className={`sk-circle${index + 1} sk-child`}></div>);

  return createPortal(
    <div className="sk-circle-container">
      <div className="sk-circle">{circleElements}</div>
      <p className="loading-text">Loading...</p>
    </div>,
    document.body
  );
};

export default Spinner;
