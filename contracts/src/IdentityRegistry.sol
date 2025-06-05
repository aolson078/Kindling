// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

interface IEntryPoint {
    // Intentionally left blank. Minimal interface for EntryPoint contract.
}

contract IdentityRegistry {
    struct Identity {
        bytes32 passkeyHash;
        bytes32 emailHash;
        string metadata;
        bool revoked;
        bool exists;
    }

    IEntryPoint public immutable entryPoint;

    mapping(address => Identity) private identities;

    event Registered(
        address indexed user,
        bytes32 passkeyHash,
        bytes32 emailHash,
        string metadata
    );
    event MetadataUpdated(
        address indexed user,
        bytes32 passkeyHash,
        bytes32 emailHash,
        string metadata
    );
    event Revoked(address indexed user);

    modifier onlyEntryPoint() {
        require(msg.sender == address(entryPoint), "Not EntryPoint");
        _;
    }

    modifier onlyExisting(address user) {
        require(identities[user].exists, "Not registered");
        _;
    }

    modifier notRevoked(address user) {
        require(!identities[user].revoked, "Account revoked");
        _;
    }

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
    }

    function register(
        address user,
        bytes32 passkeyHash,
        bytes32 emailHash,
        string calldata metadata
    ) external onlyEntryPoint {
        require(!identities[user].exists, "Already registered");
        identities[user] = Identity(
            passkeyHash,
            emailHash,
            metadata,
            false,
            true
        );
        emit Registered(user, passkeyHash, emailHash, metadata);
    }

    function updateMetadata(
        address user,
        bytes32 passkeyHash,
        bytes32 emailHash,
        string calldata metadata
    ) external onlyEntryPoint onlyExisting(user) notRevoked(user) {
        Identity storage id = identities[user];
        id.passkeyHash = passkeyHash;
        id.emailHash = emailHash;
        id.metadata = metadata;
        emit MetadataUpdated(user, passkeyHash, emailHash, metadata);
    }

    function revoke(
        address user
    ) external onlyEntryPoint onlyExisting(user) notRevoked(user) {
        identities[user].revoked = true;
        emit Revoked(user);
    }

    function getIdentity(address user) external view returns (Identity memory) {
        return identities[user];
    }
}
