import { Modal } from 'antd';
import { useState } from "react";
import { Button } from "../../WebElements/Button/Button";
import { Spinner } from "../../WebElements/Spinner/Spinner";
import { VscError } from "react-icons/vsc";



export const ModalCreateToken = (props) => {
    const {
        isModalVisible,
        closeModal,
        tokenInterface,
        factoryContract,
        currentAccount,
        setReloadTokens
    } = props

    /* Form params */
    const [tokenName, setTokenName] = useState('')
    const [tokenSymbol, setTokenSymbol] = useState('')
    const [tokenTotalSupply, setTokenTotalSupply] = useState('')

    /* Exchange params */
    const [newTokenAddress, setNewTokenAddress] = useState('')

    /* Modal steps */
    const [step, setStep] = useState(0)


    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    const isCreateTokenButtonDisabled = () => {
        return (
            !(tokenName && tokenSymbol && tokenTotalSupply > 0)
        )
    }

    const handleOnChangeTotalSupply = (e) => {
        const value = e.target.value
        if (Number(value) >= 0) {
            setTokenTotalSupply(value)
        }
    }

    const handleClickCreateToken = async () => {
        tokenInterface.new(tokenName, tokenSymbol, tokenTotalSupply, {from: currentAccount})
        .once('transactionHash', function(hash){
            setIsLoading(true)         
        })
        .once('receipt', function(receipt){
            if (receipt.status) {
                setStep(1)
                setNewTokenAddress(receipt.contractAddress)
            }
            setIsLoading(false)

        })
        .catch(error => {
            setIsLoading(false)
            setIsError(true)
            console.log('An error occured')
        })
        
    }

    const handleClickCreateExchange = async () => {
        factoryContract.createExchange(newTokenAddress, {from: currentAccount})
        .once('transactionHash', function(hash){
            setIsLoading(true)         
        })
        .once('receipt', function(receipt){
            if (receipt.status) {
                setStep(2)
            }
            setIsLoading(false)

        })
        .catch(error => {
            setIsLoading(false)
            setIsError(true)
            console.log('An error occured')
        })
    }

    const handlePoolCreated = () => {
        setReloadTokens(prev => !prev)
    }

    const handleClickCreateAgain = () => {
        setIsError(false)
    }



    return (
        <Modal centered wrapClassName='modal-create-token' title={step === 0 ? 'CREATE ERC20 TOKEN': 'CREATE EXCHANGE'} visible={isModalVisible} footer={null} onCancel={closeModal}>
            {isLoading && 
                <div className='create-token-spinner'>
                    <Spinner>
                        {step === 0 ?
                            <>Creating token: {tokenName}</>
                            : <>Creating Exchange Pool</>
                        } 
                    </Spinner>
                </div>
            }

            {isError && 
                <div className="error-transaction">
                    <div className="logo error">
                        <VscError/>
                    </div>
                    <div className="text error">
                        <h3>
                            Something went wrong, try again.
                        </h3>
                    </div>
                    <div className="create-exchange-button">
                        <Button red content='TRY AGAIN' onClickButton={handleClickCreateAgain} />
                    </div>
                </div>
            }
            
            {step === 0 && !isLoading && !isError &&
             <>
                <div className="token-form">
                    <div className="form-field">
                        <label htmlFor="">Name</label>
                        <input type="text" value={tokenName} onChange={e => setTokenName(e.target.value)}/>
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Symbol</label>
                        <input type="text" value={tokenSymbol} onChange={e=> setTokenSymbol(e.target.value)}/>
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Decimals</label>
                        <input type="text" value={18} disabled/>
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Total Supply</label>
                        <input type="number" value={tokenTotalSupply} onChange={(e) => handleOnChangeTotalSupply(e)}/>
                    </div>
                </div>
                <div className="buttons">
                    <div className="cancel-button">
                        <Button red content='CANCEL' onClickButton={closeModal}/>
                    </div>
                    <div className="create-button">
                        <Button blue content='CREATE' disabled={isCreateTokenButtonDisabled()} onClickButton={handleClickCreateToken}/>
                    </div>
                </div>
             </>
            }

            {step === 1 && !isLoading && !isError &&
                <>
                    <div className="token-result">
                        <h2>You have succesfully created the token {tokenName}</h2>
                        <p>This is the token address, you can create an exchange related to this token NOW
                        </p>
                        <div className="new-token-address">
                            {newTokenAddress}
                        </div>
                        <p>
                        If it is not the case, you should keep your token address and create the exchange later.
                        </p>
                    </div>
                    <div className="create-exchange-button">
                        <Button blue content='CREATE' onClickButton={handleClickCreateExchange}/>
                    </div>
                </>
            }

            {step === 2 && !isLoading &&
                <>
                    <div className="exchange-result">
                        <h2>You have succesfully created the exchange pool.</h2>
                        <p>For your token:</p>
                        <h4>{tokenName}</h4>
                        <p>with address:</p>
                        <h4>{newTokenAddress}</h4>
                        <p>In order to add Liquidity go to <b>Exchange</b>  {'>'} <b>Pool</b>  {'>'} <b>Add liquidity</b> </p>
                    </div>
                    <div className="create-exchange-button">
                        <Button blue content='OK' onClickButton={handlePoolCreated}/>
                    </div>
                </>
            }
                       
        </Modal>
    )
}