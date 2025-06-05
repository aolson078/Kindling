// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

interface IEAS {
    function attest(
        bytes32 schema,
        address recipient,
        bytes calldata data
    ) external returns (bytes32);
}

contract ProfileManager {
    IEAS public immutable eas;
    bytes32 public immutable profileSchema;
    bytes32 public immutable preferencesSchema;
    bytes32 public immutable verificationSchema;
    bytes32 public immutable safetySchema;
    address public owner;

    mapping(address => bool) public moderators;

    struct Profile {
        string handle; // minimal PII on-chain
        string cid; // encrypted blob off-chain
    }

    mapping(address => Profile) private profiles;

    event ProfileUpdated(
        address indexed user,
        string handle,
        string cid,
        bytes32 attestationUID
    );
    event PreferencesAttested(address indexed user, bytes32 attestationUID);
    event VerificationAttested(address indexed user, bytes32 attestationUID);
    event SafetySignalAttested(address indexed user, bytes32 attestationUID);
    event ModeratorUpdated(address indexed moderator, bool enabled);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized(address user) {
        require(msg.sender == user || moderators[msg.sender], "Not authorized");
        _;
    }

    constructor(
        IEAS _eas,
        bytes32 _profileSchema,
        bytes32 _preferencesSchema,
        bytes32 _verificationSchema,
        bytes32 _safetySchema
    ) {
        eas = _eas;
        profileSchema = _profileSchema;
        preferencesSchema = _preferencesSchema;
        verificationSchema = _verificationSchema;
        safetySchema = _safetySchema;
        owner = msg.sender;
    }

    function setModerator(address moderator, bool enabled) external onlyOwner {
        moderators[moderator] = enabled;
        emit ModeratorUpdated(moderator, enabled);
    }

    function setProfile(
        string calldata handle,
        string calldata cid
    ) external returns (bytes32) {
        return _setProfile(msg.sender, handle, cid);
    }

    function setProfileFor(
        address user,
        string calldata handle,
        string calldata cid
    ) external onlyAuthorized(user) returns (bytes32) {
        return _setProfile(user, handle, cid);
    }

    function _setProfile(
        address user,
        string calldata handle,
        string calldata cid
    ) internal returns (bytes32 uid) {
        profiles[user] = Profile({handle: handle, cid: cid});
        uid = eas.attest(profileSchema, user, abi.encode(handle, cid));
        emit ProfileUpdated(user, handle, cid, uid);
    }

    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }

    function attestPreferences(
        bytes calldata data
    ) external returns (bytes32 uid) {
        uid = eas.attest(preferencesSchema, msg.sender, data);
        emit PreferencesAttested(msg.sender, uid);
    }

    function attestVerification(
        bytes calldata data
    ) external returns (bytes32 uid) {
        uid = eas.attest(verificationSchema, msg.sender, data);
        emit VerificationAttested(msg.sender, uid);
    }

    function attestSafetySignal(
        address user,
        bytes calldata data
    ) external onlyAuthorized(user) returns (bytes32 uid) {
        uid = eas.attest(safetySchema, user, data);
        emit SafetySignalAttested(user, uid);
    }
}
