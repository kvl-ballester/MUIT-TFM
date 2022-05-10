import { Modal } from 'antd';
import { useState } from "react";
import { Button } from "../../WebElements/Button/Button";
import { Spinner } from "../../WebElements/Spinner/Spinner";
import { VscError, VscPass } from "react-icons/vsc";
import Web3 from 'web3';



export const ModalCreatePool = (props) => {
    const {
        isModalVisible,
        factoryContract,
        currentAccount,
        setIsCreatePoolModalVisible,
        setReloadTokens
    } = props

    const [tokenAddress, setTokenAddress] = useState('')
    const [step, setStep] = useState(0)

    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    const handleCloseCreateModal = () => {
        if (step === 1) {
            setReloadTokens(prev => !prev)
        }
        setIsCreatePoolModalVisible(false)
    }

    const handleClickCreateExchange = async () => {
        factoryContract.createExchange(tokenAddress, {from: currentAccount})
        .once('transactionHash', function(hash){
            setIsLoading(true)         
        })
        .once('receipt', function(receipt){
            if (receipt.status) {
                setStep(1)
            }
            setIsLoading(false)

        })
        .catch(error => {
            setIsLoading(false)
            setIsError(true)
            console.log('An error occured')
        })
    }

    const handleClickCreateAgainExchange = () => {
        setIsError(false)
    }
    
    return (
        <Modal centered footer={null} wrapClassName='modal-create-pool' title='CREATE POOL' visible={isModalVisible} onCancel={handleCloseCreateModal}>
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
                        <Button red content='TRY AGAIN' onClickButton={handleClickCreateAgainExchange} />
                    </div>
                </div>
            }

            {isLoading &&
                <div className='create-token-spinner'>
                    <Spinner>
                        Creating Exchange Pool
                    </Spinner>
                </div>
            }
            
            {step === 0 && !isLoading && !isError &&
                <div className='content-container'>
                    <p>Paste your token address in order to create an exchange pool</p>
                    <input type="text" placeholder='token address' value={tokenAddress} onChange={e=>setTokenAddress(e.target.value)}/>
                    <div className="create-exchange-button">
                        <Button blue content='CREATE' onClickButton={handleClickCreateExchange}
                            disabled={!Web3.utils.isAddress(tokenAddress)}
                        />
                    </div>
                </div>
            }

            {step === 1 && !isLoading && !isError &&
                <div className="succesfull-transaction">
                    <div className='logo ok'>
                        <VscPass />
                    </div>
                    <div className="text">
                        <h3>The exchange pool has been created</h3> 
                    </div>
                </div> 
            }
            

        </Modal>
    )
}