const EXCHANGE_FACTORY = artifacts.require('ExchangeFactory')
const TOKEN = artifacts.require('Token')


module.exports = async callback => {
    // perform actions
    try {

        // Usar las cuentas de usuario
        const accounts = await web3.eth.getAccounts();
        if (accounts.length < 8) {
            throw new Error("No hay cuentas.");
        }

        let factory = await EXCHANGE_FACTORY.deployed();

        let tokens = await factory.num_of_tokens.call()

        console.log(`There ${tokens < 2 ? 'is' : 'are'} ${tokens} ${tokens < 2 ? 'token' : 'tokens'} in the factory`);

        for (let index = 0; index < tokens; index++) {
            let tokenAddress = await factory.tokens.call(index);
            let tokenInstance = await TOKEN.at(tokenAddress);
            let tokenName = await tokenInstance.name.call();
            let exchange = await factory.token_to_exchange(tokenAddress);

            console.log(`${tokenName} token at ${tokenAddress} has exchange in contract address ${exchange}`);
            
        }

        
    } catch (error) {
        console.log(`Error: ${error}`);
    } 
    callback()
  }