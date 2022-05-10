import { Modal } from 'antd';
import { Spinner } from "../../WebElements/Spinner/Spinner";
import { VscError, VscPass } from "react-icons/vsc";

export const ModalTokenTransaction = ({title, isModalVisible, isTransactionLoading, result, closeModal}) => {

    return (
        <Modal centered wrapClassName='modal-token-transaction' title={title} visible={isModalVisible} footer={null} onCancel={closeModal}>
            
            {isTransactionLoading &&
                <Spinner>
                    Waiting for transaction to be 
                    <br /> validated and verified.
                </Spinner>
            }

            {!isTransactionLoading && result && 
                <div className='transaction-result'>
                    <div className='logo ok'>
                        <VscPass />
                    </div>
                    <div className="text">
                        <h2>
                            The {title.toLowerCase()} has been executed
                        </h2>
                    </div>
                </div>
            }

            {!isTransactionLoading && !result && 
                <div className='transaction-result error'>
                    <div className="logo error">
                        <VscError/>
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
        
        </Modal>
    )

}