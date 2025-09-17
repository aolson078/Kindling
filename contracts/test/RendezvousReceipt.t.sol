// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

import "../src/RendezvousReceipt.sol";
import "./mocks/MockEAS.sol";
import "./mocks/MockVerifier.sol";

contract RendezvousReceiptTest {
    MockEAS private eas;
    MockSemaphoreVerifier private verifier;
    RendezvousReceipt private receipts;
    bytes32 private schema = keccak256("rendezvous");

    function setup() internal {
        eas = new MockEAS();
        verifier = new MockSemaphoreVerifier();
        receipts = new RendezvousReceipt(
            IEAS(address(eas)),
            ISemaphoreVerifier(address(verifier)),
            schema
        );
    }

    function configureExpectation(
        address counterpart,
        bytes32 sessionId,
        bytes32 locationCommitment,
        uint256 timeSlot
    ) internal {
        uint256 signal = receipts.computeSignal(
            address(this),
            counterpart,
            sessionId,
            locationCommitment,
            timeSlot
        );
        uint256 externalNullifier = receipts.computeExternalNullifier(
            sessionId,
            timeSlot
        );
        verifier.setExpectation(signal, externalNullifier);
    }

    function testSubmitReceiptStoresData() public {
        setup();
        address counterpart = address(0xBEEF);
        bytes32 sessionId = keccak256("session");
        bytes32 locationCommitment = keccak256("cafe");
        uint256 timeSlot = 7;
        uint256 merkleRoot = 1234;
        uint256 nullifierHash = 5678;
        uint256[8] memory proof;

        configureExpectation(counterpart, sessionId, locationCommitment, timeSlot);

        bytes32 uid = receipts.submitReceipt(
            counterpart,
            sessionId,
            locationCommitment,
            timeSlot,
            "Coffee",
            merkleRoot,
            nullifierHash,
            proof
        );

        require(uid == eas.STATIC_UID(), "uid");
        require(receipts.nullifierHashes(nullifierHash), "nullifier set");

        RendezvousReceipt.Receipt memory stored = receipts.getReceipt(uid);
        require(stored.submitter == address(this), "submitter");
        require(stored.counterpart == counterpart, "counterpart");
        require(stored.sessionId == sessionId, "session");
        require(stored.locationCommitment == locationCommitment, "location");
        require(stored.timeSlot == timeSlot, "time");
        require(stored.merkleRoot == merkleRoot, "root");
        require(stored.nullifierHash == nullifierHash, "nullifier");
        require(
            keccak256(bytes(stored.memo)) == keccak256(bytes("Coffee")),
            "memo"
        );

        bool valid = receipts.validateReceipt(uid, address(this), counterpart);
        require(valid, "validate");
    }

    function testNullifierCannotBeReused() public {
        setup();
        address counterpart = address(0xBEEF);
        bytes32 sessionId = keccak256("session");
        bytes32 locationCommitment = keccak256("cafe");
        uint256 timeSlot = 7;
        uint256[8] memory proof;

        configureExpectation(counterpart, sessionId, locationCommitment, timeSlot);
        receipts.submitReceipt(
            counterpart,
            sessionId,
            locationCommitment,
            timeSlot,
            "First",
            1,
            2,
            proof
        );

        bool reverted;
        try
            receipts.submitReceipt(
                counterpart,
                sessionId,
                locationCommitment,
                timeSlot,
                "Second",
                1,
                2,
                proof
            )
        returns (bytes32) {
            revert("should revert");
        } catch {
            reverted = true;
        }
        require(reverted, "nullifier reuse");
    }

    function testInvalidProofReverts() public {
        setup();
        address counterpart = address(0xBEEF);
        bytes32 sessionId = keccak256("session");
        bytes32 locationCommitment = keccak256("cafe");
        uint256 timeSlot = 7;
        uint256[8] memory proof;

        configureExpectation(counterpart, sessionId, locationCommitment, timeSlot);
        verifier.setShouldVerify(false);

        bool reverted;
        try
            receipts.submitReceipt(
                counterpart,
                sessionId,
                locationCommitment,
                timeSlot,
                "Proof",
                1,
                3,
                proof
            )
        returns (bytes32) {
            revert("should revert");
        } catch {
            reverted = true;
        }
        require(reverted, "invalid proof");
    }
}
