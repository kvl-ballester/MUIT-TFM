import React from 'react'
import { TabNavItem } from "./TabNavItem";
import "./TabNav.scss"

export const TabNav = ({classname, tabs, tabSelected,setTabSelected,children}) => {
    
    return (
        <div className={`nav-tab-container ${classname ? classname: ''}`}>
            <ul className="nav nav-tabs">
                {tabs.map( tab => {

                    const active = (tab === tabSelected) ? "active" : "";
                    return (
                        <TabNavItem key={tab} classActive={active} tab={tab} setTabSelected={setTabSelected} />
                    )
                })}
            </ul>
            {/* Tab content */}
            {children}
        </div>
    )
}
