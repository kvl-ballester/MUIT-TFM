import React from 'react';
import "./button.scss"

export const Button = ({content, onClickButton, blue, red, disabled}) => {
  return <div className={`button ${blue ? 'blue' : ''} ${red? 'red' : ''} ${disabled? 'disabled' : ''} `}
                onClick={() => {
                  if (!disabled) {
                    onClickButton()
                  }
                }}
    >
      {content}
  </div>;
};
