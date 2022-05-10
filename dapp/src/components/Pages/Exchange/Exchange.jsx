import React, { useState, useEffect } from 'react'
import { TabNav } from "../../WebElements/TabNav/TabNav";
import { TabContent } from "../../WebElements/TabNav/TabContent";
import { WrongConfiguration } from "../WrongConfiguration/WrongConfiguration";
import "./exchange.scss"

//inner components
import { Trade } from "./Trade";
import { Pool } from "./Pool";

export const Exchange = (props) => {
    const {
        currentAccount,
        isCorrectChain,
        factoryContract,
        tokenInterface,
        exchangeInterface,
        tokenList,
        setReloadTokens
    } = props

    const tabsArray = ['Trade', 'Pool']

    const [tabSelected, setTabSelected] = useState(tabsArray[0]);
    const [tokenToSend, setTokenToSend] = useState({
        symbol: 'ETH',
        address: '0x0'
    })

    const [tokenToReceive, setTokenToReceive] = useState({
        symbol: '',
        address: ''
    })

    //Pools balances
    const [firstPool, setFirstPool] = useState({
        exchangeAddress: '',
        ethLiquidity: 0,
        tokenLiquidity: 0
    })
    
    const [secondPool, setSecondPool] = useState({
        exchangeAddress: '',
        ethLiquidity: 0,
        tokenLiquidity: 0
    })


    useEffect(() => {
        if (tokenList.length !== 0) {
            setTokenToReceive({
                symbol: tokenList[0].symbol,
                address: tokenList[0].address
            })
        }
			
    }, [])
    

    // Loads pools liquidity info
    useEffect(() => {
      async function setTokenPool(address) {

        let exchangeAddress = await factoryContract.token_to_exchange.call(address)
        let exchanceInstance = await exchangeInterface.at(exchangeAddress)

        let ethLiquidity = await exchanceInstance.getEthLiquidity.call()
        let tokenLiquidity = await exchanceInstance.getTokenLiquidity.call()

        setFirstPool({
            exchangeAddress,
            ethLiquidity,
            tokenLiquidity
        })


      }

      if (tokenToSend.symbol  && tokenToSend.symbol !== 'ETH') {
          setTokenPool(tokenToSend.address)
      }

      return () => {
        setFirstPool({
            exchangeAddress: '',
            ethLiquidity: 0,
            tokenLiquidity: 0
        })
      }
    }, [tokenToSend])


    useEffect(() => {
        async function setTokenPool(address) {
  
          let exchangeAddress = await factoryContract.token_to_exchange.call(address)
          let exchanceInstance = await exchangeInterface.at(exchangeAddress)
  
          let ethLiquidity = await exchanceInstance.getEthLiquidity.call()
          let tokenLiquidity = await exchanceInstance.getTokenLiquidity.call()
  
          setSecondPool({
              exchangeAddress,
              ethLiquidity,
              tokenLiquidity
          })
  
  
        }
  
        if (tokenToReceive.symbol && tokenToReceive.symbol !== 'ETH') {
            setTokenPool(tokenToReceive.address)
        }
  
        return () => {
          setSecondPool({
            exchangeAddress: '',
            ethLiquidity: 0,
            tokenLiquidity: 0
          })
        }
      }, [tokenToReceive])
    
    
    
    return (
        <main>
            {(!currentAccount || !isCorrectChain) && 
                <WrongConfiguration />
            }

            {currentAccount && isCorrectChain && !tokenList.length !== 0 &&
            <TabNav classname='exchange' tabs={tabsArray} tabSelected={tabSelected} setTabSelected={setTabSelected}>
                <TabContent isSelected={tabsArray[0] === tabSelected} >
                    <Trade currentAccount={currentAccount}
                        tokenToSend={tokenToSend} setTokenToSend={(token) => setTokenToSend(token)} 
                        tokenToReceive={tokenToReceive} setTokenToReceive={(token) => setTokenToReceive(token)} setReloadTokens={setReloadTokens}
                        tokens={tokenList.filter(token => token.hasLiquidity)} firstPool={firstPool} secondPool={secondPool}
						tokenInterface={tokenInterface} exchangeInterface={exchangeInterface}
                    />
                </TabContent>
                <TabContent isSelected={tabsArray[1] === tabSelected} >
                    <Pool currentAccount={currentAccount} setReloadTokens={setReloadTokens}
                        factoryContract={factoryContract} tokenList={tokenList}
                        tokenInterface={tokenInterface} exchangeInterface={exchangeInterface}
                    />
                </TabContent>
            </TabNav>
            }
            
        </main>
    )
}
