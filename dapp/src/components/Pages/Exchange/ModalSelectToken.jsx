import { Modal } from 'antd';
import { useEffect, useState } from 'react';


export const ModalSelectToken = (props) => {
    const {
        isModalVisible,
        closeModal, 
        tokens,
        tokenGiven,
        setSelectedToken
    } = props

    const [tokenListFiltered, setTokenListFiltered] = useState([])

    useEffect(() => {
      if (tokens.length !== 0) {
        const listFiltered = tokens.filter(token => {
            return token.symbol !== tokenGiven.symbol
        })

        setTokenListFiltered(listFiltered)
      }
    }, [tokens, tokenGiven])
    

    return (
        <Modal wrapClassName='modal-select-token' title="SELECT TOKEN" visible={isModalVisible} footer={null} onCancel={closeModal}>
            <div className="token-list">
                {tokenListFiltered.map(token => {
                    return <div className="token-item" key={token.address} onClick={() => setSelectedToken(token)}>
                        <div className="symbol">
                            {token.symbol}
                        </div>
                        <div className="name">
                            {token.name} Token
                        </div>
                    </div>
                })}
            </div>
        
        </Modal>
    )
}