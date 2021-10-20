// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC20/ERC20.sol";
import "./ExchangeFactory.sol";

contract Exchange {
    Token private token;
    ExchangeFactory private factory;
    bool private initialized;
    mapping(address => uint) private ether_balance;
    
    event PoolInitialized(address indexed _tokenAddress, uint _ether, uint _token);
    event AddLiquidity(address indexed _provider, uint _ether, uint _token);
    event RemoveLiquidity(address indexed _provider, uint _ether, uint _token);

	constructor(address _token) {
	    require(_token != address(0), "zero address");
	    token = Token(_token);
	    factory = ExchangeFactory(msg.sender);
	    initialized = false;
        
	}
	
	modifier poolEmpty {
	    require (!initialized, "EXCHANGE: liquidity pool is already initialized");
	    _;
	}
	
	modifier poolInitialized {
	    require (initialized, "EXCHANGE: liquidity pool has not been initialized yet");
	    _;
	}
	
	function setupPool(uint _tokenAmount) public poolEmpty payable {
	    require(msg.value >= 1e9 wei, "EXCHANGE: the minimun amount of ether to be deposited is 1Gwei");
	    token.transferFrom(msg.sender, address(this), _tokenAmount);
	    ether_balance[msg.sender] += msg.value;
	    initialized = true;
	    emit PoolInitialized(address(token), msg.value, _tokenAmount);
	}
	
	function addLiquidity() public poolInitialized payable returns(bool) {
	    require(msg.value >= 1e4 wei, "EXCHANGE: the minimun amount of ether to be deposited is 10000 wei");
	    uint ethReserve = address(this).balance - msg.value;
	    uint tokenReserve = getTokenLiquidity();
	    uint tokenToDeposit = msg.value * tokenReserve / ethReserve + 1;
	    
	    // Updates balance
	    ether_balance[msg.sender] += msg.value;
	    
	    //Makes token transfer
	    token.transferFrom(msg.sender, address(this), tokenToDeposit);
	    
	    //TO DO: mint native token
	    
	    emit AddLiquidity(msg.sender, msg.value, tokenToDeposit);
	    
	    return true;
	    
	}

	function removeLiquidity(uint _etherAmount) public poolInitialized returns(bool) {
	    require(_etherAmount != 0, "EXCHANGE: ether amount should be greater than 0");
	    require(_etherAmount >= ether_balance[msg.sender], "EXCHANGE: ether amount exceeds balance account");
	    require(_etherAmount >= address(this).balance, "EXCHANGE: ether amount exceeds pool balance");
	    
	    uint tokenToWithdraw = _etherAmount * getTokenLiquidity() / address(this).balance + 1;
	    
	    //tranfers tokens and ethers
	    payable(msg.sender).transfer(_etherAmount);
	    token.transfer(msg.sender, tokenToWithdraw);
	    
	    //Updates ether balance
	    ether_balance[msg.sender] -= _etherAmount;
	    emit RemoveLiquidity(msg.sender, _etherAmount, tokenToWithdraw);
	    
	    return true;
	}
	
	function getTokenLiquidityExchangeOutput(uint _etherAmount) public view returns(uint) {
	    require(_etherAmount >= 1e4 wei, "EXCHANGE: the minimun amount of ether to be deposited is 10000 wei");
	    return _etherAmount * getTokenLiquidity() / address(this).balance + 1;
	}
	
	//###############  SWAPPING FUNCTIONS ############
	//// ETH TO TOKEN
	function ethToTokenSwap() public poolInitialized payable returns(bool, uint) {
	    uint ethReserve = address(this).balance - msg.value;
	    uint tokenReserve = getTokenLiquidity();
	    uint k = ethReserve * tokenReserve;
	    
	    uint newTokenReserve = k / address(this).balance;
	    
	    uint tokenToGive = tokenReserve - newTokenReserve;
	    
	    //update token balances
	    token.transfer(msg.sender, tokenToGive);
	    
	    return (true, tokenToGive);
	    
	}
	
	
	
	function ethToTokenOutput(uint _etherAmount) public view returns(uint) {
	    require(_etherAmount != 0, "EXCHANGE: ether amount should be greater than 0");
	    uint ethReserve = address(this).balance;
	    uint tokenReserve = getTokenLiquidity();
	    uint k = ethReserve * tokenReserve;
	    
	    uint newEthReserve = ethReserve + _etherAmount;
	    uint newTokenReserve = k / newEthReserve;
	    
	    uint tokenToGive = tokenReserve - newTokenReserve;
	    
	    return tokenToGive;
	    
	}
	
	//// TOKEN TO ETH
	function tokenToEthInput(uint _tokenAmount) private view returns(uint) {
	    uint ethReserve = getEthLiquidity();
	    uint tokenReserve = getTokenLiquidity();
	    uint k = tokenReserve * ethReserve;
	    
	    uint newTokenReserve = tokenReserve + _tokenAmount;
	    uint newEthReserve = k / newTokenReserve;
	    uint ethToGive = ethReserve - newEthReserve;
	    
	    return ethToGive;
	}
	
	
	function tokenToEthSwap(uint _tokenAmount) public poolInitialized returns(bool, uint) {
	    require(_tokenAmount != 0, "EXCHANGE: token amount should be greater than 0");
	    uint ethToGive = tokenToEthInput(_tokenAmount);
	    
	    //transfer token 
	    token.transferFrom(msg.sender, address(this), _tokenAmount);
	    //send eth 
	    payable(msg.sender).transfer(ethToGive);
	    
	    return (true, ethToGive);
	}
	
	function tokenToEthOutput(uint _tokenAmount) public view returns(uint){
	    require(_tokenAmount != 0, "EXCHANGE: token amount should be greater than 0");
	    uint ethToGive = tokenToEthInput(_tokenAmount);
	    return ethToGive;
	    
	}
	    
	//// TOKEN TO TOKEN
	function tokenToTokenSwap( uint _tokenAmount, address _tokenAddress) public poolInitialized returns(bool) {
	    require(_tokenAmount != 0, "EXCHANGE: token amount should be greater than 0");
	    Exchange tokenExchange = Exchange(payable(factory.token_to_exchange(_tokenAddress)));
	    Token tokenTarget = Token(factory.exchange_to_token(address(tokenExchange)));
	    
	    //First swap: contract receives tokens
	    uint ethReceived = tokenToEthInput(_tokenAmount);
	    token.transferFrom(msg.sender, address(this), _tokenAmount);
	    //Second Swap: contract spends equivalent ether to buy other token
        (, uint tokenToGive) = tokenExchange.ethToTokenSwap{value:ethReceived}();
        //contract tranfers new tokens
        tokenTarget.transfer(msg.sender, tokenToGive);
        
        return true;

	}
	
	function tokenToTokenOutput(address _tokenAddress, uint _tokenAmount) public view returns(uint) {
	    require(_tokenAmount != 0, "EXCHANGE: token amount should be greater than 0");
	    Exchange tokenExchange = Exchange(payable(factory.token_to_exchange(_tokenAddress)));

	    uint ethReceived = tokenToEthOutput(_tokenAmount);
	    
	    uint tokenReceived = tokenExchange.ethToTokenOutput(ethReceived);
	    
	    return tokenReceived;
	}
	
	//########## TRANSFER TO FUNCTIONS ############
	//// ETH TO TOKEN
	function ethToTokenTransferTo(address _receiver) public poolInitialized payable returns(bool, uint) {
	    uint ethReserve = address(this).balance - msg.value;
	    uint tokenReserve = getTokenLiquidity();
	    uint k = ethReserve * tokenReserve;
	    
	    uint newTokenReserve = k / address(this).balance;
	    
	    uint tokenToGive = tokenReserve - newTokenReserve;
	    
	    //update token balances
	    token.transfer(_receiver, tokenToGive);
	    
	    return (true, tokenToGive);
	    
	}
	
	//// TOKEN TO ETH
	function tokenToEthTransferTo(uint _tokenAmount, address payable _receiver) public poolInitialized returns(bool, uint) {
	    uint ethToGive = tokenToEthInput(_tokenAmount);
	    
	    //transfer token 
	    token.transferFrom(msg.sender, address(this), _tokenAmount);
	    //send eth 
	    _receiver.transfer(ethToGive);
	    
	    return (true, ethToGive);
	}
	
	//// TOKEN TO TOKEN
	function tokenToTokenTransferTo( uint _tokenAmount, address _tokenAddress, address _receiver) public poolInitialized returns(bool) {
	    require(_tokenAmount != 0, "EXCHANGE: token amount should be greater than 0");
	    Exchange tokenExchange = Exchange(payable(factory.token_to_exchange(_tokenAddress)));
	    Token tokenTarget = Token(factory.exchange_to_token(address(tokenExchange)));
	    
	    //First swap: contract receives tokens
	    uint ethReceived = tokenToEthInput(_tokenAmount);
	    token.transferFrom(msg.sender, address(this), _tokenAmount);
	    //Second Swap: contract spends equivalent ether to buy other token
        (, uint tokenToGive) = tokenExchange.ethToTokenSwap{value:ethReceived}();
        //contract tranfers new tokens
        tokenTarget.transfer(_receiver, tokenToGive);
        
        return true;

	} 
	
	//Getter functions: information about pool and token
	function getEthLiquidity() public view returns(uint){
	    return address(this).balance;
	}
	
	function getTokenLiquidity() public view returns(uint) {
	    return token.balanceOf(address(this));
	}
	
	function getTokenAddress() public view returns(address){
	    return address(token);
	}
	
	function getTokenName() public view returns(string memory) {
	    return token.name();
	}
	
	function getTokenSymbol() public view returns(string memory) {
	    return token.symbol();
	}
	
    
    function myTokenBalance() public view returns(uint){
        return token.balanceOf(msg.sender);
    }
    
    function exchanceAllowance() public view returns(uint) {
        uint amountOfTokensToSpend = token.allowance(msg.sender, address(this));
        return amountOfTokensToSpend;
    }
    
    receive() external payable {
        revert("EXCHANGE: ether only accepted by defined methods");
    }
	
	
}