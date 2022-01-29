import React from 'react'

export const TabContent = ({isSelected, children}) => {
    
    const content = (isSelected) ? (
        <div className="content">
            {children}
        </div>
        
        ) : (
            null
        );

    return content;
    
}
