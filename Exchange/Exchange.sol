// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC20/Token.sol";
import "./ExchangeFactory.sol";

contract Exchange {
    Token private token;
    address private factory;
    bool private initialized;
    
    event PoolInitialized(address indexed _provider, uint _ether, uint _token);
    event AddLiquidity(address indexed _provider, uint _ether, uint _token);

	constructor(address _token) {
	    require(_token != address(0), "zero address");
	    token = Token(_token);
	    factory = msg.sender;
	    initialized = false;
        
	}
	
	modifier poolEmpty {
	    require (!initialized, "liquidity pool is already initialized");
	    _;
	}
	
	modifier poolInitialized {
	    require (initialized, "liquidity pool has not been initialized yet");
	    _;
	}
	
	function setupPool(uint _tokenAmount) public poolEmpty payable {
	    require(msg.value >= 1e9 wei, "the minimun amount of ether to be deposited is 1Gwei");
	    token.transferFrom(msg.sender, address(this), _tokenAmount);
	    initialized = true;
	    emit PoolInitialized(msg.sender, msg.value, _tokenAmount);
	}
	
	function addLiquidity() public poolInitialized returns(bool) {
	    
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
	
    
    function myBalance() public view returns(uint){
        return token.balanceOf(msg.sender);
    }
    
    receive() external payable {
        revert("ether only accepted by defined methods");
    }
	
	
}