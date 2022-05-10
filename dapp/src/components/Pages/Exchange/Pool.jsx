import { Button } from "../../WebElements/Button/Button";
import { ModalCreatePool } from "./ModalCreatePool";
import { ModalAddLiquidity } from "./ModalAddLiquidity";
import { useState } from "react";
import "./pool.scss"

export const Pool = (props) => {

    const {
        currentAccount,
        factoryContract,
        tokenInterface,
        exchangeInterface,
        setReloadTokens,
        tokenList
    } = props

    const [isCreatePoolModalVisible, setIsCreatePoolModalVisible] = useState(false)
    const [isAddLiquidityModalVisible, setIsAddLiquidityModalVisible] = useState(false)
    
    const handleCreatePool = () => {
        setIsCreatePoolModalVisible(true)
    }

    

    const handleAddLiquidity = () => {
        setIsAddLiquidityModalVisible(true)
    }

    const closeLiquidityModal = () => {
        setIsAddLiquidityModalVisible(false)
    }

    return (
        <>
            <div className="pool">
                <div className="create">
                    <p>Create an exchange pool for a given token: </p>
                    <Button blue content='Create pool' onClickButton={handleCreatePool}/>
               </div>
               <div className="add-liquidity">
                   <p>Add liquidity to an exchange pool: </p>
                    <Button blue content='Add liquidity' onClickButton={handleAddLiquidity}/>
               </div>
            </div>
            <ModalCreatePool isModalVisible={isCreatePoolModalVisible} setIsCreatePoolModalVisible={setIsCreatePoolModalVisible}
                currentAccount={currentAccount} factoryContract={factoryContract} setReloadTokens={setReloadTokens}
            />
            <ModalAddLiquidity isModalVisible={isAddLiquidityModalVisible}  closeModal={closeLiquidityModal}
                currentAccount={currentAccount} tokenList={tokenList} factoryContract={factoryContract}
                tokenInterface={tokenInterface} exchangeInterface={exchangeInterface} setReloadTokens={setReloadTokens}
            />
        </>
    )
}