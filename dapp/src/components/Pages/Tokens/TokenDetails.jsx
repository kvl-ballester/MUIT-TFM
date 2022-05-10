import { printNumbers } from "../../../helpers/common";

export function TokenDetails({token, currentAccount}) {
    return (
        <>
            <h2>{token.name}:</h2>
            <div className='token-info'>
                <h4>Token features</h4>
                <ul className='token-features'>
                    <li>Symbol: {token.symbol} </li>
                    <li>Decimals: {token.decimal}</li>
                    <li>Total supply: {token.totalSupply} units</li>
                </ul>
            </div>
            <div className='my-token-info'>
                <h4>My balance</h4>
                <div>
                    Address <b>{currentAccount}</b> {token.symbol ? `has ${printNumbers(token.balance, 3)} ${token.symbol.toLowerCase() + 's'} `: ``}
                </div>
            </div>
        </>
    )
}