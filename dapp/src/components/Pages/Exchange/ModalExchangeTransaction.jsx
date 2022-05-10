import { Modal } from 'antd';
import { Spinner } from "../../WebElements/Spinner/Spinner";


export const ModalExchangeTransaction = ({title, isModalVisible, isTransactionLoading, result, closeModal}) => {

    return (
        <Modal wrapClassName='modal-exchange-transaction' centered title={title} visible={isModalVisible} footer={null} onCancel={closeModal}>
            {isTransactionLoading &&
                <Spinner>
                    Waiting for transaction to be completed
                </Spinner>
            }

            {!isTransactionLoading &&
                <div>
                    {result}
                </div>
            }
        
        </Modal>
    )
}