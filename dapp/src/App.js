import { Routes, Route} from "react-router-dom";
import { Metamask } from "./components/Pages/Metamask/Metamask";
import { Home } from "./components/Pages/Home/Home";
import { Navbar } from "./components/WebElements/Navbar/Navbar";
import { Exchange } from "./components/Pages/Exchange/Exchange";
import { Tokens } from "./components/Pages/Tokens/Tokens";
import './App.scss';
import { useState, useEffect } from "react";

// smart contract abis
import factoryCompiled from "./contracts/ExchangeFactory.json";
import exchangeCompiled from "./contracts/Exchange.json"
import tokenCompiled from "./contracts/Token.json";
import Web3 from "web3";
import { Spinner } from "./components/WebElements/Spinner/Spinner";


var TruffleContract = require("@truffle/contract");
const BN = require('bn.js');

const factoryInterface = TruffleContract(factoryCompiled)
const exchangeInterface = TruffleContract(exchangeCompiled)
const tokenInterface = TruffleContract(tokenCompiled)

//CONSTANTS
const CHAIN_ID = '0x4'
const FACTORY_CONTRACT_ADDRESS = '0x307b138Ee21F6af6DC7184AEdD09be9551b9E249'

function App() {
  //GENERAL STATES
  const [isMetamask, setIsMetamask] = useState(true)
  const [isCorrectChain, setIsCorrectChain] = useState(false)
  const [account, setAccount] = useState(() => {
    let addressStored = sessionStorage.getItem('userAddress')
    if (addressStored) return addressStored
    return ''
    
  });
  
  const [factoryContract, setFactoryContract] = useState()
  const [tokens, setTokens] = useState([]);
  const [isTokensLoading, setIsTokensLoading] = useState(false)
  const [reloadTokens, setReloadTokens] = useState(false)




  // ETHEREUM EVENTS CALLBACKS 
  function ethereumAccountChange(accounts) {
    let account = accounts[0]
    if (account) {
      setAccount(accounts[0])
    } else {
      setAccount('')
    }
    
  }

  function ethereumChainChanged(chainId) {
    window.location.reload()
  }

  useEffect(() => {
    if (account) {
      sessionStorage.setItem('userAddress', account)
    } else {
      sessionStorage.setItem('userAddress', '')
    }
  }, [account])
  


  useEffect(() => {
    // Checks if it is the appropiate blockchain net
    const setChainID = async () => {
      const res = await window.ethereum.request({ method: 'eth_chainId' })
      if (res === CHAIN_ID) {
        setIsCorrectChain(true)
      }
    }
    // Metamask event listener
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', ethereumAccountChange);
      window.ethereum.on('chainChanged', ethereumChainChanged);
      setChainID()


    } else {
      setIsMetamask(false)
    }
    
    return () => { 
      window.ethereum.removeListener('accountsChanged', ethereumAccountChange)
      window.ethereum.removeListener('chainChanged', ethereumChainChanged)
    }
  }, [])


  useEffect(() => {
    if (window.ethereum && isCorrectChain) {
      tokenInterface.setProvider(window.ethereum)
      factoryInterface.setProvider(window.ethereum)
      exchangeInterface.setProvider(window.ethereum)

      async function getFactoryContract() {
        let factoryInstance = await factoryInterface.at(FACTORY_CONTRACT_ADDRESS)
        setFactoryContract(factoryInstance)
      }

      getFactoryContract()
    } else {
      setFactoryContract()
    }

  }, [isCorrectChain])

  useEffect(() => {
    if (factoryContract && account && isCorrectChain) {
      async function getTokens() {
        let n_tokens = await factoryContract.num_of_tokens.call()
        let tokensTmp = []

        for (let index = 0; index < n_tokens.toNumber(); index++) {
          let tokenAddress = await factoryContract.tokens.call(index);
          let exchangeAddress = await factoryContract.token_to_exchange.call(tokenAddress)
          let tokenContract

          // contracts related to token
          try {
            tokenContract = await tokenInterface.at(tokenAddress);
          } catch (error) {
            console.log('address is not a ERC20 implementation')
            continue
          }

          let exchangeContract = await exchangeInterface.at(exchangeAddress)
          
          let tokenInfoPromises = [
            tokenContract.name.call(),
            tokenContract.symbol.call(),
            tokenContract.decimals.call(),
            tokenContract.totalSupply.call(),
            tokenContract.balanceOf.call(account),
            exchangeContract.getEthLiquidity.call()
          ]

          let results = await Promise.all(tokenInfoPromises)
          let [tokenName, tokenSymbol, tokenDecimals, tokenTotal, tokenBalance, ethLiquidity] = results

          let token = {
            address: tokenAddress,
            name: tokenName,
            symbol: tokenSymbol,
            decimal: tokenDecimals.toNumber(),
            totalSupply: Web3.utils.fromWei(tokenTotal, "ether"),
            balance: Web3.utils.fromWei(tokenBalance, "ether"),
            hasLiquidity: ethLiquidity.gt(new BN('0'))
          }

          tokensTmp.push(token)

        }

        setTokens(tokensTmp)
        setIsTokensLoading(false)        
        
      }

      setIsTokensLoading(true)
      getTokens()
      
    }
    
  }, [factoryContract, account, isCorrectChain, reloadTokens])
  
  




  return (

    <div className="App">
      <Navbar/>
      {!isMetamask &&
        <Metamask />
      }

      {isMetamask &&
        <Routes>
        <Route path="/" element={ 
          <Home currentAccount={account} setAccount={(account) => setAccount(account)}/>} 
        />
        <Route path="/exchange" element={
          isMetamask && isTokensLoading ?
            <Spinner>
              Loading tokens
            </Spinner>
            : <Exchange  currentAccount={account} isCorrectChain={isCorrectChain} 
              factoryContract={factoryContract} tokenInterface={tokenInterface} exchangeInterface={exchangeInterface}
              tokenList={tokens} setReloadTokens={setReloadTokens}
            />
        }
        />
        <Route path="/tokens" element={
          isMetamask && isTokensLoading ?
            <Spinner>
              Loading tokens
            </Spinner>
            : <Tokens currentAccount={account} isCorrectChain={isCorrectChain}
              tokenInterface={tokenInterface} tokenList={tokens} setReloadTokens={setReloadTokens}
              factoryContract={factoryContract}
            />
        }
        />
      </Routes>
      
      }

      
      
      
    </div>
  );
}

export default App;
