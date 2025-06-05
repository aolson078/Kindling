// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

import "../src/ProfileManager.sol";

contract MockEAS {
    bytes32 public lastSchema;
    address public lastRecipient;
    bytes public lastData;
    bytes32 public lastUID;

    function attest(
        bytes32 schema,
        address recipient,
        bytes calldata data
    ) external returns (bytes32) {
        lastSchema = schema;
        lastRecipient = recipient;
        lastData = data;
        lastUID = bytes32(uint256(lastUID) + 1);
        return lastUID;
    }
}

contract User {
    function set(
        ProfileManager manager,
        string calldata handle,
        string calldata cid
    ) external returns (bytes32) {
        return manager.setProfile(handle, cid);
    }

    function setFor(
        ProfileManager manager,
        address user,
        string calldata handle,
        string calldata cid
    ) external returns (bytes32) {
        return manager.setProfileFor(user, handle, cid);
    }

    function attestPrefs(
        ProfileManager manager,
        bytes calldata data
    ) external returns (bytes32) {
        return manager.attestPreferences(data);
    }

    function attestVerify(
        ProfileManager manager,
        bytes calldata data
    ) external returns (bytes32) {
        return manager.attestVerification(data);
    }

    function attestSafety(
        ProfileManager manager,
        address user,
        bytes calldata data
    ) external returns (bytes32) {
        return manager.attestSafetySignal(user, data);
    }
}

contract ProfileManagerTest {
    MockEAS private eas;
    ProfileManager private manager;
    User private user;
    User private mod;
    bytes32 private profileSchema = keccak256("profile");
    bytes32 private prefSchema = keccak256("prefs");
    bytes32 private verifySchema = keccak256("verify");
    bytes32 private safetySchema = keccak256("safety");

    function setup() internal {
        eas = new MockEAS();
        manager = new ProfileManager(
            IEAS(address(eas)),
            profileSchema,
            prefSchema,
            verifySchema,
            safetySchema
        );
        user = new User();
        mod = new User();
        manager.setModerator(address(mod), true);
    }

    function testProfileCreation() public {
        setup();
        bytes32 uid = user.set(manager, "alice", "cid1");
        ProfileManager.Profile memory stored = manager.getProfile(
            address(user)
        );
        require(
            keccak256(bytes(stored.handle)) == keccak256(bytes("alice")),
            "handle"
        );
        require(
            keccak256(bytes(stored.cid)) == keccak256(bytes("cid1")),
            "cid"
        );
        require(eas.lastSchema() == profileSchema, "schema");
        require(eas.lastRecipient() == address(user), "recipient");
        require(
            keccak256(eas.lastData()) == keccak256(abi.encode("alice", "cid1")),
            "data"
        );
        require(uid == eas.lastUID(), "uid");
    }

    function testProfileUpdateByModerator() public {
        setup();
        user.set(manager, "alice", "cid1");
        bytes32 uid = mod.setFor(manager, address(user), "bob", "cid2");
        ProfileManager.Profile memory stored = manager.getProfile(
            address(user)
        );
        require(
            keccak256(bytes(stored.handle)) == keccak256(bytes("bob")),
            "handle"
        );
        require(
            keccak256(bytes(stored.cid)) == keccak256(bytes("cid2")),
            "cid"
        );
        require(eas.lastSchema() == profileSchema, "schema");
        require(eas.lastRecipient() == address(user), "recipient");
        require(
            keccak256(eas.lastData()) == keccak256(abi.encode("bob", "cid2")),
            "data"
        );
        require(uid == eas.lastUID(), "uid");
    }

    function testAttestations() public {
        setup();
        bytes32 prefUid = user.attestPrefs(manager, bytes("dark"));
        require(eas.lastSchema() == prefSchema, "pref schema");
        require(eas.lastRecipient() == address(user), "pref recipient");
        require(
            keccak256(eas.lastData()) == keccak256(bytes("dark")),
            "pref data"
        );
        require(prefUid == eas.lastUID(), "pref uid");

        bytes32 verUid = user.attestVerify(manager, bytes("kyc"));
        require(eas.lastSchema() == verifySchema, "verify schema");
        require(eas.lastRecipient() == address(user), "verify recipient");
        require(
            keccak256(eas.lastData()) == keccak256(bytes("kyc")),
            "verify data"
        );
        require(verUid == eas.lastUID(), "verify uid");

        bytes32 safeUid = mod.attestSafety(
            manager,
            address(user),
            bytes("safe")
        );
        require(eas.lastSchema() == safetySchema, "safety schema");
        require(eas.lastRecipient() == address(user), "safety recipient");
        require(
            keccak256(eas.lastData()) == keccak256(bytes("safe")),
            "safety data"
        );
        require(safeUid == eas.lastUID(), "safety uid");
    }
}
