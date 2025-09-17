// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

import {ISemaphoreVerifier} from "../../src/RendezvousReceipt.sol";

contract MockSemaphoreVerifier is ISemaphoreVerifier {
    bool public shouldVerify = true;
    uint256 public expectedSignal;
    uint256 public expectedExternalNullifier;

    function setShouldVerify(bool value) external {
        shouldVerify = value;
    }

    function setExpectation(uint256 signal, uint256 externalNullifier) external {
        expectedSignal = signal;
        expectedExternalNullifier = externalNullifier;
    }

    function verifyProof(
        uint256, /* merkleRoot */
        uint256, /* nullifierHash */
        uint256 signalHash,
        uint256 externalNullifier,
        uint256[8] calldata /* proof */
    ) external view override {
        require(shouldVerify, "invalid proof");
        require(signalHash == expectedSignal, "signal");
        require(externalNullifier == expectedExternalNullifier, "external");
    }
}
