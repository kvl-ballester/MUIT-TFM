import { Modal, Menu, Dropdown } from 'antd';
import { Button } from "../../WebElements/Button/Button";
import { Spinner } from "../../WebElements/Spinner/Spinner";
import { VscError, VscPass } from "react-icons/vsc";
import React, { useState, useEffect } from 'react';
import { AiFillCaretDown } from "react-icons/ai";
import Web3 from 'web3';
import { printNumbers } from "../../../helpers/common";

const BN = require('bn.js');



export const ModalAddLiquidity = (props) => {
	const {
		isModalVisible,
		closeModal,
		factoryContract,
		tokenInterface,
		exchangeInterface,
		tokenList,
		currentAccount,
        setReloadTokens
	} = props

	const [tokenSelected, setTokenSelected] = useState(tokenList[0])
	const [step, setStep] = useState(0)

	const [etherAmount, setEtherAmount] = useState(0)
	const [tokenAmount, setTokenAmount] = useState(0)

	const [liquidityInfo, setLiquidityInfo] = useState({
		address: '',
		ether: 0,
		token: 0
	})

	const [isLoading, setIsLoading] = useState(false)
	const [isError, setIsError] = useState(false)

	const handleClickCancel = () => {
		if (step === 0) {
			closeModal()
		} else {
			setStep(0)
		}
	}

	const makeTokenApprove = async () => {
		let tokenInstance = await tokenInterface.at(tokenSelected.address)
        let exchanceInstance = await exchangeInterface.at(liquidityInfo.address)

		let tokenToApprove 
        
        if (tokenSelected.hasLiquidity) {
            let etherToSend = Web3.utils.toWei(etherAmount, 'ether')
            tokenToApprove = await exchanceInstance.getTokenLiquidityExchangeOutput.call(etherToSend, {from: currentAccount})
 
        } else {
            tokenToApprove = Web3.utils.toWei(tokenAmount, 'ether')
        }

		tokenInstance.approve(liquidityInfo.address, tokenToApprove, { from: currentAccount })
			.once('transactionHash', function (hash) {
				setIsLoading(true)
			})
			.once('receipt', function (receipt) {
                if (receipt.status)	{
                    setStep(3)
                }
				setIsLoading(false)

			})
			.catch(error => {
				setIsLoading(false)
				setIsError(true)
				console.log('An error occured')
			})
	}

	const makeAddLiquidity = async () => {
		let exchanceInstance = await exchangeInterface.at(liquidityInfo.address)
		let etherToSend = Web3.utils.toWei(etherAmount, 'ether')
        let tokenToSend
        
        if (tokenSelected.hasLiquidity) {
            tokenToSend = await exchanceInstance.getTokenLiquidityExchangeOutput.call(etherToSend, {from: currentAccount})

        } else {
            tokenToSend = Web3.utils.toWei(tokenAmount, 'ether')
        }

		exchanceInstance.addLiquidity(tokenToSend, {from: currentAccount, value: etherToSend})
		.once('transactionHash', function (hash) {
			setIsLoading(true)
		})
		.once('receipt', function (receipt) {
			if (receipt.status)	{
                setStep(4)
            }
			setIsLoading(false)

		})
		.catch(error => {
			setIsLoading(false)
			setIsError(true)
			console.log('An error occured')
		})


	}

	const handleClickOk = async () => {
		if (step === 0) {
			setStep(1)
		} else {
			setStep(2)
		}
	}

	const handleEtherAmountChange = (e) => {
		let value = e.target.value
		setEtherAmount(value)

		if (value && Number(value) >= 0) {

			if (tokenSelected.hasLiquidity) {
                let etherToGive = new BN(Web3.utils.toWei(value, 'ether'))
				let tokenToDeposit = etherToGive.mul(liquidityInfo.token).divRound(liquidityInfo.ether).add(new BN('1'))
				tokenToDeposit = Web3.utils.fromWei(tokenToDeposit, 'ether')
				tokenToDeposit = printNumbers(tokenToDeposit, 5)

				setTokenAmount(tokenToDeposit.toString())
			}
		} else {
			setTokenAmount(0)
		}

	}

	const isOkButtonDisabled = () => {
		if (step === 1 && (!etherAmount || !tokenAmount)) {
			return true
		}

		return false
	}

	const handleClickCreateAgain = () => {
		setIsError(false)
	}

	/* Get pool information to obtain k */
	useEffect(() => {
		async function getLiquidityInfo() {
			let exchangeAddress = await factoryContract.token_to_exchange.call(tokenSelected.address)
			let exchangeInstance = await exchangeInterface.at(exchangeAddress)
			let etherLiquidity = await exchangeInstance.getEthLiquidity.call()
			let tokenLiquidity = await exchangeInstance.getTokenLiquidity.call()

			setLiquidityInfo({
				address: exchangeAddress,
				ether: etherLiquidity,
				token: tokenLiquidity
			})

		}

		getLiquidityInfo()


		return () => {
			setLiquidityInfo({
				address: '',
				ether: 0,
				token: 0
			})
		}
	}, [tokenSelected])

	/* Resets values when initial step */
	useEffect(() => {
		if (step === 0) {
			setEtherAmount(0)
			setTokenAmount(0)
		}
	}, [step])

    const clickCloseModal = () => {
        // Added liquitidy state, reload tokens
        if (step === 4) {
            setReloadTokens()
        }
        setStep(0)
        closeModal()
    }



	return (
		<Modal centered wrapClassName='modal-add-liquidity' title='ADD LIQUIDITY' visible={isModalVisible} footer={null}
			onCancel={clickCloseModal}
		>
	
    		{(step === 0 || step === 1) &&
				<h4>You are about to add liquidity to a cryptocurrency pair</h4>
			}
			{step === 0 &&
				<>
					<p>First, select the pair:</p>
					<div className="dropdown-menu">
						<Dropdown overlay={
							<Menu >
								{tokenList.map(token => {
									return (
										<Menu.Item key={token.address} onClick={() => setTokenSelected(token)}>
											{`${token.symbol} / ETH`}
										</Menu.Item>
									)
								})}
							</Menu>
						} trigger={['click']} overlayClassName='add-liquidity-dropdown'>
							<div className='token-selected'>
								{`${tokenSelected.symbol} / ETH`}
								<AiFillCaretDown />
							</div>
						</Dropdown>
					</div>
				</>
			}

			{step === 1 &&
				<>
					<p>Second, add liquidity:</p>
					{!tokenSelected.hasLiquidity &&
						<div className='warning'>
							⚠ WARNING: This exchange pool is going to be added liquidity for the first time
						</div>
					}

					<div className="liquidity-amounts">
						<div className="form-control">
							<label htmlFor="">ETHER</label>
							<input type="number" value={etherAmount} onChange={(e) => handleEtherAmountChange(e)} />
						</div>
						<div className="form-control">
							<label htmlFor="">{tokenSelected.symbol}</label>
							{tokenSelected.hasLiquidity && etherAmount > 0 &&
								<div className="msg">
									Approximately the amount of token to send:
								</div>
							}
							<input type="number" disabled={tokenSelected.hasLiquidity ? true : false} value={tokenAmount}
								onChange={e => setTokenAmount(e.target.value)}
							/>
						</div>
					</div>


				</>
			}

			{(step === 0 || step === 1) &&
				<div className="buttons">
					<div className="cancel-button">
						<Button red content={step === 0 ? 'CANCEL' : 'PREVIOUS'} onClickButton={handleClickCancel} />
					</div>
					<div className="ok-button">
						<Button blue content={step === 0 ? 'NEXT' : 'ADD LIQUIDITY'} onClickButton={handleClickOk}
							disabled={isOkButtonDisabled()}
						/>
					</div>
				</div>
			}

			{isLoading &&
				<div className='create-token-spinner'>
					<Spinner>
						{step === 2 &&
							<>Approving {tokenAmount} {tokenSelected.symbol}s</>
						}

						{step === 3 &&
							<>Adding liquidity</>
						}
					</Spinner>
				</div>
			}

			{isError &&
				<div className="error-transaction">
					<div className="logo error">
						<VscError />
					</div>
					<div className="text error">
						<h3>
							Something went wrong, try again.
						</h3>
					</div>
					<div className="error-button">
						<Button red content='TRY AGAIN' onClickButton={handleClickCreateAgain} />
					</div>
				</div>
			}

			{step === 2 && !isLoading && !isError &&
				<>
					<h3>Third, approve the token you want to spend</h3>
					<h3>You allow us to spend</h3>
					<h2 className='approve-amount'>{tokenAmount} {tokenSelected.symbol}</h2>
					<h3>On your behalf</h3>

					<div className="approve-button">
						<Button blue content='APPROVE' onClickButton={makeTokenApprove} />
					</div>
				</>

			}

			{step === 3 && !isLoading && !isError &&
				<>
					<h3>Now, you can confirm the add liquidity operation</h3>
					<div className="operation-params">
						<div>
							Ether: {etherAmount}
						</div>
						<div>
							{tokenSelected.symbol}: {tokenAmount}
						</div>
					</div>
					<div className="liquidity-button">
						<Button blue content='ADD LIQUIDITY' onClickButton={makeAddLiquidity} />
					</div>
				</>
			}

            {step === 4 && !isLoading && !isError &&
                
                <>
                    <div className="succesfull-transaction">
                        <div className='logo ok'>
                            <VscPass />
                        </div>
                        <div className="text">
                            <h3>Liquidity added</h3> 
                        </div>
                    </div>
                    <div className="finish-button">
						<Button blue content='OK' onClickButton={setReloadTokens} />
					</div>
                </>
				
			}



		</Modal>
	)
}