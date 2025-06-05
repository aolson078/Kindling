// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

interface IProfileManager {
    struct Profile {
        string handle;
        string cid;
    }

    function getProfile(address user) external view returns (Profile memory);
}

contract MatchEngine {
    struct Weights {
        uint256 profileWeight;
        uint256 addressWeight;
    }

    IProfileManager public immutable profiles;
    address public admin;
    Weights public weights;

    mapping(address => mapping(address => bool)) public blocked;

    event WeightsUpdated(uint256 profileWeight, uint256 addressWeight);
    event AdminUpdated(address indexed newAdmin);
    event BlockStatus(
        address indexed user,
        address indexed target,
        bool blocked
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(IProfileManager _profiles, Weights memory initialWeights) {
        profiles = _profiles;
        admin = msg.sender;
        weights = initialWeights;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
        emit AdminUpdated(newAdmin);
    }

    function updateWeights(Weights calldata newWeights) external onlyAdmin {
        weights = newWeights;
        emit WeightsUpdated(newWeights.profileWeight, newWeights.addressWeight);
    }

    function setBlock(address target, bool isBlocked) external {
        blocked[msg.sender][target] = isBlocked;
        emit BlockStatus(msg.sender, target, isBlocked);
    }

    function score(
        address userA,
        address userB
    ) external view returns (uint256) {
        if (userA == userB) return 0;
        if (blocked[userA][userB] || blocked[userB][userA]) return 0;

        IProfileManager.Profile memory profileA = profiles.getProfile(userA);
        IProfileManager.Profile memory profileB = profiles.getProfile(userB);

        (address a1, address a2) = userA < userB
            ? (userA, userB)
            : (userB, userA);
        (string memory p1, string memory p2) = userA < userB
            ? (profileA.cid, profileB.cid)
            : (profileB.cid, profileA.cid);

        uint256 profileHash = uint256(keccak256(abi.encodePacked(p1, p2)));
        uint256 addressHash = uint256(keccak256(abi.encodePacked(a1, a2)));

        return
            profileHash *
            weights.profileWeight +
            addressHash *
            weights.addressWeight;
    }
}
