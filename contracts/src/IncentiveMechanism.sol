// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract IncentiveMechanism {
    uint256 public immutable depositAmount;
    uint256 public immutable cooldown;
    address public immutable treasury;

    mapping(address => uint256) public lastContact;
    mapping(bytes32 => uint256) public deposits;

    event ContactInitiated(address indexed initiator, address indexed target, uint256 amount);
    event ContactRefunded(address indexed initiator, address indexed target, uint256 amount);
    event ContactSlashed(address indexed initiator, address indexed target, uint256 amount);

    constructor(uint256 _depositAmount, uint256 _cooldown, address _treasury) {
        depositAmount = _depositAmount;
        cooldown = _cooldown;
        treasury = _treasury;
    }

    function _key(address initiator, address target) private pure returns (bytes32) {
        return keccak256(abi.encode(initiator, target));
    }

    function initiateContact(address target) external payable {
        require(msg.value == depositAmount, "wrong deposit");
        require(block.timestamp >= lastContact[msg.sender] + cooldown, "rate limited");
        bytes32 key = _key(msg.sender, target);
        require(deposits[key] == 0, "active deposit");
        deposits[key] = msg.value;
        lastContact[msg.sender] = block.timestamp;
        emit ContactInitiated(msg.sender, target, msg.value);
    }

    function refund(address initiator) external {
        bytes32 key = _key(initiator, msg.sender);
        uint256 amount = deposits[key];
        require(amount > 0, "no deposit");
        deposits[key] = 0;
        (bool ok, ) = initiator.call{value: amount}("");
        require(ok, "refund failed");
        emit ContactRefunded(initiator, msg.sender, amount);
    }

    function slash(address initiator) external {
        bytes32 key = _key(initiator, msg.sender);
        uint256 amount = deposits[key];
        require(amount > 0, "no deposit");
        deposits[key] = 0;
        (bool ok, ) = treasury.call{value: amount}("");
        require(ok, "slash failed");
        emit ContactSlashed(initiator, msg.sender, amount);
    }
}
