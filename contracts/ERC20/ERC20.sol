// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;


import "./IERC20.sol";

contract Token is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping (address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;

    
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * 10 ** decimals;
        balances[msg.sender] = totalSupply;
    }
    
    function balanceOf(address _owner) public view override returns (uint256 balance) {
        balance = balances[_owner];
    }
    
    function transfer(address _to, uint256 _value) public override returns (bool success) {
        require(balances[msg.sender] >= _value, "ERC20: transfer amount exceeds account balance");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        
        return true;
    }
    
    function approve(address _spender, uint256 _value) public override returns (bool success) {
        allowances[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        
        return true;
        
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
        require(allowances[_from][msg.sender] >= _value,"ERC20: transfer amount exceeds allowance");
        require(balances[_from] >= _value, "ERC20: transfer amount exceeds balance account");
        
        allowances[_from][msg.sender] -= _value;
        
        balances[_from] -= _value;
        balances[_to] += _value;
        
        emit Transfer(_from, _to, _value);
        
        return true;
    }
    
    function allowance(address _owner, address _spender) public override view returns (uint256 remaining) {
        remaining = allowances[_owner][_spender];
    }

    
    
}