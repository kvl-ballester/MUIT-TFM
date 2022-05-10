import { useEffect, useState } from "react";
import Web3 from 'web3';
import { IoIosArrowDown } from "react-icons/io";
import { RiArrowDownFill, RiArrowUpDownFill } from "react-icons/ri";
import { Checkbox } from 'antd';
import { Button } from "../../WebElements/Button/Button";
import { ModalSelectToken } from "./ModalSelectToken";
import { ModalExchangeTransaction } from "./ModalExchangeTransaction";
import { VscError, VscPass } from "react-icons/vsc";


import "./trade.scss"
import { printNumbers } from "../../../helpers/common";

const BN = require('bn.js');

const web3 = new Web3(window.ethereum)


export const Trade = (props) => {

    const {
        currentAccount,
        tokens,
        setReloadTokens,
        tokenToSend,
        setTokenToSend,
        tokenToReceive,
        setTokenToReceive,
        firstPool,
        secondPool,
        tokenInterface,
        exchangeInterface
    } = props;

    // account balance of tokens to swap
    const [tokenToGiveBalance, setTokenToGiveBalance] = useState('0.0')
    const [tokenToReceiveBalance, setTokenToReceiveBalance] = useState('0.0')

    const [isHovering, setIsHovering] = useState(false);
    const [isCheckBoxChecked, setIsCheckBoxChecked] = useState(false)
    const [inputAmount, setInputAmount] = useState(0)
    const [recipientAddress, setRecipientAddress] = useState('')
    const [expectedAmountToReceive, setExpectedAmountToReceive] = useState(0)

    //select token modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tokenGivenModal, setTokenGivenModal] = useState({})

    // exchange transaction modal
    const [isPendingTransationModalVisible, setIsPendingTransationModalVisible] = useState(false)
    const [transactionModalVariables, setTransactionModalVariables] = useState({
        title: '',
        isTransactionLoading: false,
        result: null,
        completed: false
    })

    // Funcion que ejecuta un metodo de un contrato
    const sendContractTransaction = (contract, method, options, ...functionArgs) => {
        const promiEvent = contract[method](...functionArgs, options)
            .once('transactionHash', function (hash) {
                setTransactionModalVariables(prev => {
                    return { ...prev, isTransactionLoading: true }
                })
                setIsPendingTransationModalVisible(true)
            })
            .once('receipt', function (receipt) {
                setTransactionModalVariables(prev => {
                    return { ...prev, isTransactionLoading: false }
                })
            })
            .catch(error => {
                console.log('An error occured')
                throw error
            })

        return promiEvent
    }



    const handleMouseOver = () => {
        setIsHovering(true);
    };

    const handleMouseOut = () => {
        setIsHovering(false);
    };

    const handleCheckboxChanged = (e) => {
        setIsCheckBoxChecked(e.target.checked)
    }

    const resetAmountBoxes = () => {
        setInputAmount(0)
        setExpectedAmountToReceive(0)
    }

    const resetTransactionModalVariables = () => {
        setTransactionModalVariables({
            title: '',
            isTransactionLoading: false,
            result: null
        })
    }

    const approveMessage = () => {
        setTransactionModalVariables(prev => {
            return {
                ...prev,
                result: <div className="approve-token-stage">
                    <h2>Please, confirm you want to spend <br /> the next token amount</h2>
                    <div className="token-amount">
                        {inputAmount.toString() + ' ' + tokenToSend.symbol}
                    </div>
                </div>

            }
        })
    }

    const tokenApprovedMessage = () => {
        setTransactionModalVariables(prev => {
            return {
                ...prev,
                result: <div className="confirm-transaction-stage">
                    <div className='logo ok'>
                        <VscPass />
                    </div>
                    <div className="text">
                        <h2>
                            {inputAmount.toString() + ' ' + tokenToSend.symbol} have been approved
                        </h2>
                        <div className="confirm-transaction">
                            <h3>Now, confirm the transaction </h3>
                        </div>
                    </div>
                </div>

            }
        })
    }

    const transactionErrorMessage = () => {
        setTransactionModalVariables(prev => {
            return {
                ...prev,
                result: <div className="error">
                    <div className='logo'>
                        <VscError />
                    </div>
                    <div className="text error">
                        <h2>
                            The transaction could NOT be done.
                            <br />
                            Please try again.
                        </h2>
                    </div>
                </div>

            }
        })
    }

    const handleClickTrade = async () => {
        //Decide which smart contract to invoke
        let tokenInstance
        let exchangeInstance

        //It will be a swap function
        if (!recipientAddress) {
            // Token to Eth or token to token
            if (tokenToSend.symbol !== 'ETH') {
                let tokenToGive = web3.utils.toWei(inputAmount, 'ether')
                let exchangeAdress = firstPool.exchangeAddress
                tokenInstance = await tokenInterface.at(tokenToSend.address)
                exchangeInstance = await exchangeInterface.at(exchangeAdress)

                // Approve user amount to smart contract
                try {
                    setIsPendingTransationModalVisible(true)
                    approveMessage()
                    await sendContractTransaction(tokenInstance, 'approve', { from: currentAccount }, exchangeAdress, tokenToGive)

                } catch (error) {
                    // User rejects transaction
                    if (error.code === 4001) {
                        setIsPendingTransationModalVisible(false)
                        resetTransactionModalVariables()
                    } else {
                        transactionErrorMessage()
                    }
                    console.log('Error while approving token amount:', error)
                    return
                }

                try {
                    // Tokens have been approved, confirm transaction pop-up
                    tokenApprovedMessage()
                    // OPERATION: Token to token swap
                    if (tokenToReceive.symbol !== 'ETH') {
                        await sendContractTransaction(exchangeInstance, 'tokenToTokenSwap', { from: currentAccount }, tokenToGive, secondPool.address)

                        // OPERATION: token to eth swap
                    } else {
                        await sendContractTransaction(exchangeInstance, 'tokenToEthSwap', { from: currentAccount }, tokenToGive)
                    }
                } catch (error) {
                    transactionErrorMessage()
                    console.log('Error while making transaction:', error)
                    return
                }

                // It will be a eth to token swap
            } else {

                try {
                    exchangeInstance = await exchangeInterface.at(secondPool.exchangeAddress)
                    let etherToGive = web3.utils.toWei(inputAmount, 'ether')
                    await sendContractTransaction(exchangeInstance, 'ethToTokenSwap', { from: currentAccount, value: etherToGive })

                } catch (error) {
                    setIsPendingTransationModalVisible(true)
                    transactionErrorMessage()
                    console.log('Error while making transaction:', error)
                    return
                }


            }
            // It wil be a transfer to function
        } else {
            // Token to Eth or token to token
            if (tokenToSend.symbol !== 'ETH') {
                let tokenToGive = web3.utils.toWei(inputAmount, 'ether')
                let exchangeAdress = firstPool.exchangeAddress
                tokenInstance = await tokenInterface.at(tokenToSend.address)
                exchangeInstance = await exchangeInterface.at(exchangeAdress)

                // Approve user amount to smart contract
                try {
                    setIsPendingTransationModalVisible(true)
                    approveMessage()
                    await sendContractTransaction(tokenInstance, 'approve', { from: currentAccount }, exchangeAdress, tokenToGive)
                } catch (error) {
                    // User rejects transaction
                    if (error.code === 4001) {
                        setIsPendingTransationModalVisible(false)
                        resetTransactionModalVariables()
                    } else {
                        transactionErrorMessage()
                    }
                    console.log('Error while approving token amount:', error)
                    return
                }
                try {
                    // Tokens have been approved, confirm transaction pop-up
                    tokenApprovedMessage()
                    // Token to token swap
                    if (tokenToReceive.symbol !== 'ETH') {
                        await sendContractTransaction(exchangeInstance, 'tokenToTokenTransferTo', { from: currentAccount }, tokenToGive, secondPool.address, recipientAddress)

                        // token to eth swap
                    } else {
                        await sendContractTransaction(exchangeInstance, 'tokenToEthTransferTo', { from: currentAccount }, tokenToGive, recipientAddress)

                    }
                } catch (error) {
                    transactionErrorMessage()
                    console.log('Error while making transaction:', error)
                    return
                }

                // It will be a eth to token swap
            } else {
                try {
                    exchangeInstance = await exchangeInterface.at(secondPool.exchangeAddress)
                    let etherToGive = web3.utils.toWei(inputAmount, 'ether')
                    await sendContractTransaction(exchangeInstance, 'ethToTokenTransferTo', { from: currentAccount, value: etherToGive }, recipientAddress)
                } catch (error) {
                    setIsPendingTransationModalVisible(true)
                    transactionErrorMessage()
                    console.log('Error while making transaction:', error)
                    return
                }

            }
        }

        //Succesfull transaction
        setTransactionModalVariables(prev => {
            return {
                ...prev,
                title: '',
                completed: true,
                result: <div className="confirm-transaction-stage">
                    <div className='logo ok'>
                        <VscPass />
                    </div>
                    <div className="text">
                        <h3>The transaction has been executed</h3>
                    </div>
                </div>

            }
        })
    }

    const showModal = (tokenSelected) => {
        setTokenGivenModal(tokenSelected)
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false)
    }

    const closePendingTransactionModal = () => {
        setIsPendingTransationModalVisible(false)
        if (transactionModalVariables.completed) {
            setReloadTokens(prev => !prev)
        }
        resetTransactionModalVariables()

    }

    const switchTokens = () => {
        const tmp = { ...tokenToSend }
        setTokenToSend({ ...tokenToReceive })
        setTokenToReceive(tmp)
        resetAmountBoxes()
    }

    const handleSelectToken = (token) => {
        // If selected token is already in the pair to be traded, it swaps them.
        if (token.address === tokenToSend.address || token.address === tokenToReceive.address) {
            switchTokens()
        } else if (tokenToSend.address === tokenGivenModal.address) {
            setTokenToSend(token)
        } else if (tokenToReceive.address === tokenGivenModal.address) {
            setTokenToReceive(token)
        }
        resetAmountBoxes()
        setIsModalVisible(false)
    }

    // Print expected input
    const ethToTokenExpectedInput = (amount, ethLiquidity, tokenLiquidity) => {
        /* console.log(`ethToTokenExpectedInput: amount ${amount.toString()} 
            ethLiquidity ${ethLiquidity.toString()} tokenLiquidity ${tokenLiquidity.toString()}`
        ) */
        const k = ethLiquidity.mul(tokenLiquidity)
        const newTokenLiquidity = tokenLiquidity.sub(amount)
        const newEthLiquidity = k.div(newTokenLiquidity)

        return newEthLiquidity.sub(ethLiquidity)

    }

    const tokenToEthExpectedInput = (amount, ethLiquidity, tokenLiquidity) => {
        /* console.log(`tokenToEthExpectedInput: amount ${amount.toString()} 
            ethLiquidity ${ethLiquidity.toString()} tokenLiquidity ${tokenLiquidity.toString()}`
        ) */
        const k = ethLiquidity.mul(tokenLiquidity)
        const newEthLiquidity = ethLiquidity.sub(amount)
        const newTokenLiquidity = k.div(newEthLiquidity)

        return newTokenLiquidity.sub(tokenLiquidity)

    }

    // Print expected output
    const tokenToEthExpectedOutput = (amount, ethLiquidity, tokenLiquidity) => {
        /* console.log(`tokenToEthExpectedOutput: amount ${amount.toString()} 
            ethLiquidity ${ethLiquidity.toString()} tokenLiquidity ${tokenLiquidity.toString()}`
        ) */
        const k = ethLiquidity.mul(tokenLiquidity)
        const newTokenLiquidity = tokenLiquidity.add(amount)
        const newEthLiquidity = k.div(newTokenLiquidity)

        return ethLiquidity.sub(newEthLiquidity)

    }

    const ethToTokenExpectedOutput = (amount, ethLiquidity, tokenLiquidity) => {
        /* console.log(`ethToTokenExpectedOutput: amount ${amount.toString()} 
            ethLiquidity ${ethLiquidity.toString()} tokenLiquidity ${tokenLiquidity.toString()}`
        ) */
        const k = ethLiquidity.mul(tokenLiquidity)
        const newEthLiquidity = ethLiquidity.add(amount)
        const newTokenLiquidity = k.div(newEthLiquidity)

        return tokenLiquidity.sub(newTokenLiquidity)

    }

    const handleOnChangeAmountInputToken = (e) => {
        const value = e.target.value
        console.log(value)
        if (value && Number(value) >= 0) {
            setInputAmount(value)

            let expectedOutput
            if (Number(value) === 0) {
                expectedOutput = new BN('0')
            } else {
                expectedOutput = new BN(web3.utils.toWei(value, 'ether'));
                //Ether received from first pool
                if (tokenToSend.symbol !== 'ETH') {
                    expectedOutput = tokenToEthExpectedOutput(
                        expectedOutput, firstPool.ethLiquidity, firstPool.tokenLiquidity
                    )
                }

                if (tokenToReceive.symbol !== 'ETH') {
                    expectedOutput = ethToTokenExpectedOutput(
                        expectedOutput, secondPool.ethLiquidity, secondPool.tokenLiquidity
                    )
                }

                expectedOutput = web3.utils.fromWei(expectedOutput, 'ether')

                expectedOutput = printNumbers(expectedOutput, 5)

            }

            setExpectedAmountToReceive(expectedOutput.toString())

        } else {
            setInputAmount(value)
        }

    }

    const handleOnChangeAmountOutputToken = e => {
        const value = e.target.value
        if (value >= 0) {
            setExpectedAmountToReceive(value)

            let expectedInput
            if (Number(value) === 0) {
                expectedInput = new BN('0')
            } else {
                expectedInput = new BN(web3.utils.toWei(value, 'ether'));

                if (tokenToReceive.symbol !== 'ETH') {
                    expectedInput = ethToTokenExpectedInput(
                        expectedInput, secondPool.ethLiquidity, secondPool.tokenLiquidity
                    )
                }

                if (tokenToSend.symbol !== 'ETH') {
                    expectedInput = tokenToEthExpectedInput(
                        expectedInput, firstPool.ethLiquidity, firstPool.tokenLiquidity
                    )
                }

                expectedInput = web3.utils.fromWei(expectedInput, 'ether')

                expectedInput = printNumbers(expectedInput, 5)

            }

            setInputAmount(expectedInput.toString())
        }
    }

    const isTradeButtonDisabled = () => {
        return (
            !inputAmount ||
            inputAmount <= 0 ||
            Number(inputAmount) > tokenToGiveBalance ||
            (isCheckBoxChecked && !Web3.utils.isAddress(recipientAddress))
        )
    }

    /* USE EFFECTS */
    useEffect(() => {

        async function getBalance(tokenAddress) {
            let balance
            if (tokenToReceive.symbol === 'ETH') {
                balance = await web3.eth.getBalance(currentAccount);
                balance = web3.utils.fromWei(balance, 'ether');
            } else {
                balance = tokens.filter(token => {
                    return token.address === tokenAddress
                })[0].balance
            }

            setTokenToReceiveBalance(balance)
        }

        if (tokenToReceive.symbol) {
            getBalance(tokenToReceive.address)
        }



    }, [tokenToReceive, currentAccount, tokens])

    useEffect(() => {
        async function getBalance(tokenAddress) {
            let balance

            if (tokenToSend.symbol === 'ETH') {
                balance = await web3.eth.getBalance(currentAccount);
                balance = web3.utils.fromWei(balance, 'ether');

            } else {
                balance = tokens.filter(token => {
                    return token.address === tokenAddress
                })[0].balance
            }

            setTokenToGiveBalance(balance)
        }

        if (tokenToSend.symbol) {
            getBalance(tokenToSend.address)
        }

    }, [tokenToSend, currentAccount, tokens])



    return (
        <>
            <div className="trade">
                <div className="sender">
                    <div className="row">
                        <div className="token" onClick={() => showModal(tokenToSend)}>
                            {tokenToSend.symbol}
                            <div className="flecha-abajo"> <IoIosArrowDown /></div>
                        </div>
                        <div className="balance">
                            balance: {printNumbers(tokenToGiveBalance, 5)}
                        </div>
                    </div>
                    <div className="row">
                        <input type="number" min={0.0} placeholder="0.0" value={inputAmount}
                            onChange={(e) => { handleOnChangeAmountInputToken(e) }}
                        />
                    </div>
                    <div className="row">
                        {Number(inputAmount) > tokenToGiveBalance &&
                            <div className="text-error">
                                ERROR: Trading amount exceeds user balance
                            </div>
                        }
                    </div>

                </div>
                <div className="arrow">
                    <div className="circle" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}
                        onClick={switchTokens}
                    >
                        {!isHovering &&
                            <RiArrowDownFill />
                        }

                        {isHovering &&
                            <RiArrowUpDownFill />
                        }
                    </div>
                </div>
                <div className="recipient">
                    <div className="row">
                        <div className="token" onClick={() => showModal(tokenToReceive)}>
                            {tokenToReceive.symbol}
                            <div className="flecha-abajo"> <IoIosArrowDown /></div>
                        </div>
                        <div className="balance">
                            balance: {printNumbers(tokenToReceiveBalance, 5)}
                        </div>
                    </div>
                    {(inputAmount > 0) && !(Number(inputAmount) > tokenToGiveBalance) &&
                        <div className="msg">
                            Expected amount of tokens to receive:
                        </div>
                    }
                    <div className="row">
                        <input type="number" placeholder="0.0" min={0.0} value={expectedAmountToReceive}
                            onChange={e => { handleOnChangeAmountOutputToken(e) }}
                        />
                    </div>
                </div>
                <div className="recipient-address">
                    <div className="checkbox-container">
                        <Checkbox onChange={handleCheckboxChanged}>Send To Another Address</Checkbox>
                    </div>
                    {isCheckBoxChecked &&
                        <div className="address">
                            <input type="text" placeholder="recipient address" value={recipientAddress}
                                onChange={e => setRecipientAddress(e.target.value)}
                            />
                        </div>
                    }
                </div>

                <div className="trade-button">
                    <Button blue content={"Trade"} onClickButton={handleClickTrade}
                        disabled={isTradeButtonDisabled()}
                    />
                </div>
            </div>
            <ModalSelectToken isModalVisible={isModalVisible} tokenGiven={tokenGivenModal}
                closeModal={closeModal} tokens={[{ name: 'Ethereum', symbol: 'ETH', address: '0x0' }, ...tokens]}
                setSelectedToken={(token) => { handleSelectToken(token) }}
            />
            <ModalExchangeTransaction isModalVisible={isPendingTransationModalVisible} isTransactionLoading={transactionModalVariables.isTransactionLoading}
                title={transactionModalVariables.title} result={transactionModalVariables.result} closeModal={closePendingTransactionModal}
            />
        </>

    )

}