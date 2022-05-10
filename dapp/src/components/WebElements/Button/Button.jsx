import React from 'react';
import "./button.scss"

export const Button = ({content, onClickButton, blue, red, green, disabled}) => {
  return <div className={`button ${blue ? 'blue' : ''} ${red? 'red' : ''} ${green? 'green' : ''} ${disabled? 'disabled' : ''} `}
                onClick={() => {
                  if (!disabled) {
                    onClickButton()
                  }
                }}
    >
      {content}
  </div>;
};
