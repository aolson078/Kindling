// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/IncentiveMechanism.sol";

contract Target {
    function refund(IncentiveMechanism m, address initiator) external {
        m.refund(initiator);
    }

    function slash(IncentiveMechanism m, address initiator) external {
        m.slash(initiator);
    }
}

contract Treasury {
    receive() external payable {}
}

contract IncentiveMechanismTest {
    IncentiveMechanism private mech;
    Target private target;
    Treasury private treasury;

    function setup() internal {
        treasury = new Treasury();
        mech = new IncentiveMechanism(1 ether, 1 hours, address(treasury));
        target = new Target();
    }

    function testStakeAndRateLimit() public {
        setup();
        mech.initiateContact{value: 1 ether}(address(target));
        require(address(mech).balance == 1 ether, "stake");
        (bool ok, ) = address(mech).call{value: 1 ether}(abi.encodeWithSignature("initiateContact(address)", address(target)));
        require(!ok, "rate limit");
    }

    function testRefund() public {
        setup();
        uint256 balBefore = address(this).balance;
        mech.initiateContact{value: 1 ether}(address(target));
        target.refund(mech, address(this));
        require(address(this).balance == balBefore, "refund");
    }

    function testSlash() public {
        setup();
        mech.initiateContact{value: 1 ether}(address(target));
        target.slash(mech, address(this));
        require(address(treasury).balance == 1 ether, "slash");
    }
}
