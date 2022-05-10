import React, { useState } from 'react';
import { AiFillCaretDown } from "react-icons/ai";
import { AiFillCaretUp } from "react-icons/ai";
import { Button } from "../../WebElements/Button/Button";
import { WrongConfiguration } from "../WrongConfiguration/WrongConfiguration";
import { Menu, Dropdown, Modal, Button as AntButton } from 'antd';
import { TokenDetails } from "./TokenDetails";
import { ModalTokenTransaction } from "./ModalTokenTransaction";
import { ModalCreateToken } from "./ModalCreateToken";
import 'antd/dist/antd.css';

import { unitToExponent } from "../../../helpers/common";


import Web3 from 'web3';
import "./tokens.scss";

const BN = require('bn.js');



export function Tokens(props) {
    
    const {
        currentAccount,
        isCorrectChain,
        tokenInterface,
        tokenList,
        setReloadTokens,
        factoryContract
    } = props
    
    const [showMethods, setShowMethods] = useState({});
    const [transferParams, setTransferParams] = useState({});
    const [approveParams, setApproveParams] = useState({});
    const [allowanceParams, setAllowanceParams] = useState({});
    const [modalVariables, setModalVariables] = useState({
        title: '',
        isTransactionLoading: false,
        result: null
    })

    const [isModalVisible, setIsModalVisible] = useState(false)

    const toggleTokenMethods = (address) => {
        setAllowanceParams(prev => {
            return {...prev, [address]: {owner: '', spender:''}}
        })
        setApproveParams(prev => {
            return {...prev, [address]: {address: '',amount: '', unit: 'unit'}}
        })
        setTransferParams(prev => {
            return {...prev, [address]: {address: '',amount: '', unit: 'unit'}}
        })
        setShowMethods(prev => {
            return {...prev, [address]: !prev[address]}            
        })
    };

    /* Modal to create tokens */
    const [isCreateTokenModalVisible, setIsCreateTokenModalVisible] = useState(false)


    const toDecimal = (amount, unidad, tokenDecimals) => {
        let magnitude = unitToExponent[unidad]

        let pointIndex = amount.indexOf('.')
        let decimalPart;
        if (pointIndex === -1) {
            decimalPart = new BN('0')
        } else {
            let positions = (amount.length - 1) - pointIndex;
            amount = amount.replace('.','')
            decimalPart = new BN(positions)
        }

        let exponent = magnitude.add(tokenDecimals).sub(decimalPart)

        let result = new BN(amount).mul(new BN('10').pow(exponent))
        return result
    }

    const handleOnCloseModal = () => {
        setIsModalVisible(false)

        if (modalVariables.result) {
            setReloadTokens(prev => !prev)
        }

    }


    /* Handle contract methods */
    const handleSubmitTransfer = async (tokenAddress) => {
        let tokenInstance = await tokenInterface.at(tokenAddress);

        let tokenDecimals = await tokenInstance.decimals.call()
        let receiver = transferParams[tokenAddress].address;
        let unit = transferParams[tokenAddress].unit;
        let amount = transferParams[tokenAddress].amount.replace(',','.');

        amount = toDecimal(amount, unit, tokenDecimals)

        tokenInstance.transfer(receiver, amount, {from: currentAccount})
        .once('transactionHash', function(hash){
            setModalVariables({
                title: 'TRANSFER TRANSACTION',
                isTransactionLoading: true,
                result: null
            })
            setIsModalVisible(true)
        })
        .once('receipt', function(receipt){
            setModalVariables(prev => {
                return {...prev, result: receipt, isTransactionLoading: false}
            })
        })
        .on('error', function(error, receipt) { 
            console.log(error)
            setModalVariables({
                title: 'ERROR DURING TRANSFER TRANSACTION',
                isTransactionLoading: false,
                result: receipt
            })
        })
        .catch(error => {
            console.log('An error occured')
        })
    }

    const handleSubmitApprove = async (tokenAddress) => {
        let tokenInstance = await tokenInterface.at(tokenAddress);

        let tokenDecimals = await tokenInstance.decimals.call()
        let receiver = approveParams[tokenAddress].address;
        let unit = approveParams[tokenAddress].unit;
        let amount = approveParams[tokenAddress].amount.replace(',','.');

        amount = toDecimal(amount, unit, tokenDecimals)

        
        tokenInstance.approve(receiver, amount, {from: currentAccount})
        .once('transactionHash', function(hash){
            setModalVariables({
                title: 'APPROVE TRANSACTION',
                isTransactionLoading: true,
                result: null
            })
            setIsModalVisible(true)
        })
        .once('receipt', function(receipt){
            setModalVariables(prev => {
                return {...prev, isTransactionLoading: false}
            })
        })
        .on('error', function(error, receipt) { 
            console.log(error)
            setModalVariables({
                title: 'ERROR DURING APPROVE TRANSACTION',
                isTransactionLoading: false,
                result: receipt
            })
        })
        .catch(error => {
            console.log('An error occured')
        })
        

    }

    const handleSubmitAllowance = async (tokenAddress) => {
        tokenInterface.setProvider(window.ethereum)
        let tokenInstance = await tokenInterface.at(tokenAddress);

        let owner = allowanceParams[tokenAddress].owner
        let spender = allowanceParams[tokenAddress].spender

        try {
            let symbol = await tokenInstance.symbol.call()
            let result = await tokenInstance.allowance.call(owner, spender)
            console.log(result)
            Modal.info({
                title: 'Allowance information',
                content: (
                    <div>
                        Address: <b>{owner} </b> 
                        <br /> has approved {result.toString()} {symbol}s  (contains decimal part)
                        <br /> to: <b>{spender}</b>
                    </div>
                ),
                centered: true,
                width: 650,
                className: 'allowance-modal'
            })
            
        } catch (err) {
            
        }
    }


    /* Create new token and exchange */
    const addToken = () => {
        setIsCreateTokenModalVisible(true)
    }

    const closeCreateTokenModal = () => {
        setIsCreateTokenModalVisible(false)
    }

    return (
        <main>
            {(!currentAccount || !isCorrectChain) && 
                <WrongConfiguration />
            }

            {currentAccount && isCorrectChain && 
            <>
                <div id="tokens">
                    {   
                        tokenList.map(token => (
                            <div className="token-card" key={token.address}>
                                {/* Basic information of the tokens like aacount balance, name, symbol, total supply etc. */}
                                <TokenDetails token={token} currentAccount={currentAccount} />
                                
                                {/* Inputs to let people interact with ERC20 smart contracts */}
                                <div className="token-interaction">
                                    <div className="header" onClick={() => toggleTokenMethods(token.address)}>
                                        <div className="title">
                                            TOKEN INTERACTION
                                        </div>
                                        <div className='icon-container'>
                                            {showMethods[token.address] ? <AiFillCaretUp /> : <AiFillCaretDown />}
                                        </div>
                                    </div>
                                    {showMethods[token.address] && 
                                        <div className="methods">
                                            <div className="transfer">
                                                <div className="name">Transfer</div>
                                                <div className="params">
                                                    <div className='address'>
                                                    <input type="text" placeholder='address' value={transferParams[token.address].address || ''} autoComplete="new-password" onChange={(e) => {
                                                        setTransferParams(prev => {
                                                            return {...prev, [token.address]: {...prev[token.address], address: e.target.value}}
                                                        })
                                                    }}/>
                                                    </div>
                                                    <div className="amount">
                                                        <input type="number" placeholder='amount' value={transferParams[token.address].amount || ''} onChange={e => {
                                                            setTransferParams(prev => {
                                                                return {...prev, [token.address]: {...prev[token.address], amount: e.target.value}}
                                                            })
                                                        }}/>
                                                        <Dropdown overlay={
                                                            <Menu>
                                                                {Object.keys(unitToExponent).map( (unit, index) => {
                                                                    return <Menu.Item onClick={() => setTransferParams(prev => {
                                                                        return {...prev, [token.address]: {...prev[token.address], unit: unit}}
                                                                    })} key={index}>{unit}</Menu.Item>
                                                                })}
                                                            </Menu>
                                                        } trigger={['click']}>
                                                            <AntButton>
                                                                {transferParams[token.address].unit} 
                                                            </AntButton>
                                                        </Dropdown>
                                                    </div>
                                                    <div className="submit">
                                                        <Button green content="Submit" 
                                                            disabled={(!Web3.utils.isAddress(transferParams[token.address].address) || !transferParams[token.address].amount)} 
                                                            onClickButton={() => handleSubmitTransfer(token.address)}    
                                                        />
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <div className="approve">
                                                <div className="name">Approve</div>
                                                <div className="params">
                                                    <div className="address">
                                                        <input type="text" placeholder='address' autoComplete="new-password" onChange={e => {
                                                            setApproveParams(prev => {
                                                                return {...prev, [token.address]: {...prev[token.address], address: e.target.value}}
                                                            })
                                                        }}/>
                                                    </div>
                                                    <div className="amount">
                                                        <input type="number" placeholder='amount' onChange={e => {
                                                            setApproveParams(prev => {
                                                                return {...prev, [token.address]: {...prev[token.address], amount: e.target.value}}
                                                            })
                                                        }}/>
                                                        <Dropdown overlay={
                                                                <Menu>
                                                                    {Object.keys(unitToExponent).map( (unit, index) => {
                                                                        return <Menu.Item onClick={() => setApproveParams(prev => {
                                                                            return {...prev, [token.address]: {...prev[token.address], unit: unit}}
                                                                        })} key={index}>{unit}</Menu.Item>
                                                                    })}
                                                                </Menu>
                                                        } trigger={['click']}>
                                                            <AntButton>
                                                                {approveParams[token.address].unit} 
                                                            </AntButton>
                                                        </Dropdown>
                                                    </div>
                                                    <div className="submit">
                                                        <Button green content="Submit" 
                                                            disabled={(!Web3.utils.isAddress(approveParams[token.address].address) || !approveParams[token.address].amount)} 
                                                            onClickButton={() => handleSubmitApprove(token.address)}    
                                                        />
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <div className="allowance">
                                                <div className="name">Allowance</div>
                                                <div className="params">
                                                    <div className="address owner">
                                                        <input type="text" className='transfer' placeholder='owner address' autoComplete="new-password"
                                                            onChange={e => {
                                                                setAllowanceParams(prev => {
                                                                    return {...prev, [token.address]: {...prev[token.address], owner: e.target.value}}
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="address spender">
                                                        <input type="text" className='transfer' placeholder='spender address' autoComplete="new-password"
                                                            onChange={e => {
                                                                setAllowanceParams(prev => {
                                                                    return {...prev, [token.address]: {...prev[token.address], spender: e.target.value}}
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="submit">
                                                        <Button green content="Submit" 
                                                            disabled={(!Web3.utils.isAddress(allowanceParams[token.address].owner) || !Web3.utils.isAddress(allowanceParams[token.address].spender))} 
                                                            onClickButton={() => handleSubmitAllowance(token.address)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    }

                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="add-token-icon">
                    <div className="circle" onClick={() => addToken()}>
                        <div className="vertical-stick"></div>
                        <div className="horizontal-stick"></div>
                    </div>
                </div>
                <ModalTokenTransaction title={modalVariables.title} isTransactionLoading={modalVariables.isTransactionLoading}
                    result={modalVariables.result} isModalVisible={isModalVisible} closeModal={() => handleOnCloseModal()}
                />
                <ModalCreateToken isModalVisible={isCreateTokenModalVisible} closeModal={closeCreateTokenModal}
                    tokenInterface={tokenInterface} currentAccount={currentAccount} factoryContract={factoryContract}
                    setReloadTokens={setReloadTokens}
                />
            </>
                
            }
        </main>
    )
}


