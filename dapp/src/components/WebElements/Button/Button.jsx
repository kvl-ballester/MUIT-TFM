import React from 'react';
import "./button.scss"

export const Button = ({content, onClickButton, blue, red}) => {
  return <div className={`button ${blue ? 'blue' : ''} ${red? 'red' : ''}`}
                onClick={() => onClickButton()}
    >
      {content}
  </div>;
};
