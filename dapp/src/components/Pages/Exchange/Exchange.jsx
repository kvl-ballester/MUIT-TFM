import React, { useState, useEffect } from 'react'
import { TabNav } from "../../WebElements/TabNav/TabNav";
import { TabContent } from "../../WebElements/TabNav/TabContent";

export const Exchange = ({}) => {
    const tabsArray = ['Intercambiar', 'Enviar a', 'Liquidez']
    const [tabSelected, setTabSelected] = useState(tabsArray[0]);


    
    return (
        <main>
            <TabNav tabs={tabsArray} tabSelected={tabSelected} setTabSelected={setTabSelected}>
                <TabContent isSelected={tabsArray[0] === tabSelected} >
                    <div>Paaaa intercambiar tokens</div>
                </TabContent>
                <TabContent isSelected={tabsArray[1] === tabSelected} >
                    <div>Paaaa intercambiar tokens y enviar a ..</div>
                </TabContent>
                <TabContent isSelected={tabsArray[2] === tabSelected} >
                    <div>Paaaa meter o quitar liquidez</div>
                </TabContent>
            </TabNav>
        </main>
    )
}
