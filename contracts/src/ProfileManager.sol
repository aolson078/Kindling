// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEAS {
    function attest(bytes32 schema, address recipient, bytes calldata data) external returns (bytes32);
}

contract ProfileManager {
    IEAS public immutable eas;
    bytes32 public immutable schema;
    address public owner;

    mapping(address => bool) public moderators;
    mapping(address => string) public profiles;

    event ProfileUpdated(address indexed user, string cid, bytes32 attestationUID);
    event ModeratorUpdated(address indexed moderator, bool enabled);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized(address user) {
        require(msg.sender == user || moderators[msg.sender], "Not authorized");
        _;
    }

    constructor(IEAS _eas, bytes32 _schema) {
        eas = _eas;
        schema = _schema;
        owner = msg.sender;
    }

    function setModerator(address moderator, bool enabled) external onlyOwner {
        moderators[moderator] = enabled;
        emit ModeratorUpdated(moderator, enabled);
    }

    function setProfile(string calldata cid) external returns (bytes32) {
        return _setProfile(msg.sender, cid);
    }

    function setProfileFor(address user, string calldata cid) external onlyAuthorized(user) returns (bytes32) {
        return _setProfile(user, cid);
    }

    function _setProfile(address user, string calldata cid) internal returns (bytes32 uid) {
        profiles[user] = cid;
        uid = eas.attest(schema, user, bytes(cid));
        emit ProfileUpdated(user, cid, uid);
    }

    function getProfile(address user) external view returns (string memory) {
        return profiles[user];
    }
}

