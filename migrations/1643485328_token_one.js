const EXCHANGE_FACTORY = artifacts.require('ExchangeFactory')
const TOKEN = artifacts.require('Token')
const EXCHANGE = artifacts.require('Exchange')

module.exports = async function(_deployer, network, accounts) {
  // Use deployer to state migration tasks.
  const factory = await EXCHANGE_FACTORY.deployed();

  await _deployer.deploy(TOKEN, 'Cardano', 'ADA', 10000, {from: accounts[1]})
  const ada = await TOKEN.deployed();
  
  await factory.createExchange(ada.address)

  // Exchange contract created
  let exchangeAddres = await factory.token_to_exchange.call(ada.address)
  const exchange = await EXCHANGE.at(exchangeAddres)

  try {
     // Approve 5000 tokens to exchange contract
    await ada.approve(exchangeAddres, web3.utils.toBN('5000000000000000000000'), {from: accounts[1]})
  } catch (err) {
    console.log('Error in approve: ', err)
  }
 
  try {
    // Add liquidity
    await exchange.addLiquidity(web3.utils.toBN('5000000000000000000000'), {from: accounts[1], value: web3.utils.toWei(web3.utils.toBN('2'),"ether")})
  } catch (err) {
    console.log('Error en addLiquidity: ', err)
  }
  
};
