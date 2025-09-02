// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/ProfileManager.sol";

contract MockEAS {
    bytes32 public lastSchema;
    address public lastRecipient;
    bytes public lastData;
    bytes32 public lastUID;

    function attest(bytes32 schema, address recipient, bytes calldata data) external returns (bytes32) {
        lastSchema = schema;
        lastRecipient = recipient;
        lastData = data;
        lastUID = bytes32(uint256(lastUID) + 1);
        return lastUID;
    }
}

contract User {
    function set(ProfileManager manager, string calldata cid) external returns (bytes32) {
        return manager.setProfile(cid);
    }

    function setFor(ProfileManager manager, address user, string calldata cid) external returns (bytes32) {
        return manager.setProfileFor(user, cid);
    }
}

contract ProfileManagerTest {
    MockEAS private eas;
    ProfileManager private manager;
    User private user;
    User private mod;
    bytes32 private schema = keccak256("profile");

    function setup() internal {
        eas = new MockEAS();
        manager = new ProfileManager(IEAS(address(eas)), schema);
        user = new User();
        mod = new User();
        manager.setModerator(address(mod), true);
    }

    function testProfileCreation() public {
        setup();
        bytes32 uid = user.set(manager, "cid1");
        string memory stored = manager.getProfile(address(user));
        require(keccak256(bytes(stored)) == keccak256(bytes("cid1")), "cid");
        require(eas.lastRecipient() == address(user), "recipient");
        require(keccak256(eas.lastData()) == keccak256(bytes("cid1")), "data");
        require(uid == eas.lastUID(), "uid");
    }

    function testProfileUpdateByModerator() public {
        setup();
        user.set(manager, "cid1");
        bytes32 uid = mod.setFor(manager, address(user), "cid2");
        string memory stored = manager.getProfile(address(user));
        require(keccak256(bytes(stored)) == keccak256(bytes("cid2")), "cid");
        require(eas.lastRecipient() == address(user), "recipient");
        require(keccak256(eas.lastData()) == keccak256(bytes("cid2")), "data");
        require(uid == eas.lastUID(), "uid");
    }
}

