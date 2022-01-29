const EXCHANGE_FACTORY = artifacts.require('ExchangeFactory')

module.exports = function(_deployer, network, accounts) {
  // Use deployer to state migration tasks.
  _deployer.deploy(EXCHANGE_FACTORY, {from: accounts[5]})
};
