// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Exchange.sol";

contract ExchangeFactory {
	address[] public tokens;
	
	mapping(address => address) public token_to_exchange;
    mapping(address => address) public exchange_to_token;
    
    event NewExchange(address indexed _token, address indexed _exchange);
	
	function num_of_tokens() public view returns (uint256){
	    return tokens.length;
	}
	
	function createExchange(address _token) public returns(bool){
	    require(_token != address(0));
	    Exchange tokenExchange = new Exchange(_token);
	    address exchangeAddress = address(tokenExchange);
	    
	    token_to_exchange[_token] = exchangeAddress;
	    exchange_to_token[exchangeAddress] = _token;
	    tokens.push(_token);
	    
	    emit NewExchange(_token, exchangeAddress);
	    
	    return true;
	    
	}
}