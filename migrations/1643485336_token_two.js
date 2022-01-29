const EXCHANGE_FACTORY = artifacts.require('ExchangeFactory')
const TOKEN = artifacts.require('Token')

module.exports = function(_deployer, network, accounts) {
  // Use deployer to state migration tasks.
  let factory, token;

  _deployer.then(() => {
    return EXCHANGE_FACTORY.deployed();
  })
  .then( instance => {
    factory = instance;
    return TOKEN.new('Litecoin', 'LTC', 10000, {from: accounts[2]})
  })
  .then( instance => {
    token = instance
    return factory.createExchange(token.address)
  })
};
