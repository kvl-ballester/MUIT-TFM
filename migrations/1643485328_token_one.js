const EXCHANGE_FACTORY = artifacts.require('ExchangeFactory')
const TOKEN = artifacts.require('Token')

module.exports = async function(_deployer, network, accounts) {
  // Use deployer to state migration tasks.
  const factory = await EXCHANGE_FACTORY.deployed();

  await _deployer.deploy(TOKEN, 'Cardano', 'ADA', 10000, {from: accounts[1]})
  const ada = await TOKEN.deployed();

  await factory.createExchange(ada.address)
};
