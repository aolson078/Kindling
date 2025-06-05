// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;4

import "../src/IdentityRegistry.sol";

contract MockEntryPoint {
    function register(
        IdentityRegistry registry,
        address user,
        bytes32 passkeyHash,
        bytes32 emailHash,
        string calldata metadata
    ) external {
        registry.register(user, passkeyHash, emailHash, metadata);
    }

    function updateMetadata(
        IdentityRegistry registry,
        address user,
        bytes32 passkeyHash,
        bytes32 emailHash,
        string calldata metadata
    ) external {
        registry.updateMetadata(user, passkeyHash, emailHash, metadata);
    }

    function revoke(IdentityRegistry registry, address user) external {
        registry.revoke(user);
    }
}

contract IdentityRegistryTest {
    IdentityRegistry private registry;
    MockEntryPoint private entryPoint;
    address private user = address(0x1);
    bytes32 private passkey = keccak256(abi.encodePacked("pass"));
    bytes32 private email = keccak256(abi.encodePacked("email"));
    string private metadata = "meta";

    function setupRegistry() internal {
        entryPoint = new MockEntryPoint();
        registry = new IdentityRegistry(IEntryPoint(address(entryPoint)));
    }

    function testRegister() public {
        setupRegistry();
        entryPoint.register(registry, user, passkey, email, metadata);
        IdentityRegistry.Identity memory id = registry.getIdentity(user);
        require(id.exists, "not registered");
        require(id.passkeyHash == passkey, "passkey mismatch");
        require(id.emailHash == email, "email mismatch");
        require(
            keccak256(bytes(id.metadata)) == keccak256(bytes(metadata)),
            "metadata mismatch"
        );
        require(!id.revoked, "revoked");
    }

    function testUpdateMetadata() public {
        setupRegistry();
        entryPoint.register(registry, user, passkey, email, metadata);
        bytes32 newPass = keccak256(abi.encodePacked("newpass"));
        bytes32 newEmail = keccak256(abi.encodePacked("newemail"));
        string memory newMetadata = "new";
        entryPoint.updateMetadata(
            registry,
            user,
            newPass,
            newEmail,
            newMetadata
        );
        IdentityRegistry.Identity memory id = registry.getIdentity(user);
        require(id.passkeyHash == newPass, "passkey mismatch");
        require(id.emailHash == newEmail, "email mismatch");
        require(
            keccak256(bytes(id.metadata)) == keccak256(bytes(newMetadata)),
            "metadata mismatch"
        );
    }

    function testRevoke() public {
        setupRegistry();
        entryPoint.register(registry, user, passkey, email, metadata);
        entryPoint.revoke(registry, user);
        IdentityRegistry.Identity memory id = registry.getIdentity(user);
        require(id.revoked, "not revoked");
    }
}
