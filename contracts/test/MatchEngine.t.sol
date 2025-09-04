// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/MatchEngine.sol";

contract MockProfileManager is IProfileManager {
    mapping(address => Profile) public profiles;

    function set(address user, string memory handle, string memory cid) external {
        profiles[user] = Profile({handle: handle, cid: cid});
    }

    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }
}

contract User {
    function blockAddr(MatchEngine engine, address target, bool isBlocked) external {
        engine.setBlock(target, isBlocked);
    }
}

contract MatchEngineTest {
    MockProfileManager private pm;
    MatchEngine private engine;
    User private ua;
    User private ub;

    function setup() internal {
        pm = new MockProfileManager();
        ua = new User();
        ub = new User();
        pm.set(address(ua), "alice", "A");
        pm.set(address(ub), "bob", "B");
        MatchEngine.Weights memory w = MatchEngine.Weights({profileWeight: 1, addressWeight: 1});
        engine = new MatchEngine(IProfileManager(address(pm)), w);
    }

    function expectedScore(address a, address b) internal view returns (uint256) {
        string memory pa = pm.getProfile(a).cid;
        string memory pb = pm.getProfile(b).cid;
        (address a1, address a2) = a < b ? (a, b) : (b, a);
        (string memory p1, string memory p2) = a < b ? (pa, pb) : (pb, pa);
        uint256 profileHash = uint256(keccak256(abi.encodePacked(p1, p2)));
        uint256 addressHash = uint256(keccak256(abi.encodePacked(a1, a2)));
        return profileHash + addressHash;
    }

    function testScoreDeterministic() public {
        setup();
        uint256 expected = expectedScore(address(ua), address(ub));
        uint256 result = engine.score(address(ua), address(ub));
        require(result == expected, "score");
    }

    function testSelfMatch() public {
        setup();
        uint256 result = engine.score(address(ua), address(ua));
        require(result == 0, "self");
    }

    function testBlockedMatch() public {
        setup();
        ua.blockAddr(engine, address(ub), true);
        uint256 result = engine.score(address(ua), address(ub));
        require(result == 0, "blocked");
    }
}

