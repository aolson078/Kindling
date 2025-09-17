// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

import "../src/RendezvousReceipt.sol";
import "../src/SafetyReport.sol";
import "./mocks/MockEAS.sol";
import "./mocks/MockVerifier.sol";

contract RendezvousIntegrationTest {
    MockEAS private eas;
    MockSemaphoreVerifier private verifier;
    RendezvousReceipt private receipts;
    SafetyReport private reports;
    bytes32 private rendezvousSchema = keccak256("rendezvous");
    bytes32 private reportSchema = keccak256("report");

    function setup() internal {
        eas = new MockEAS();
        verifier = new MockSemaphoreVerifier();
        receipts = new RendezvousReceipt(
            IEAS(address(eas)),
            ISemaphoreVerifier(address(verifier)),
            rendezvousSchema
        );
        reports = new SafetyReport(
            IEAS(address(eas)),
            reportSchema,
            receipts
        );
    }

    function testReceiptThenReportAdjustsReputation() public {
        setup();
        address subject = address(0xBEEF);
        bytes32 sessionId = keccak256("session");
        bytes32 locationCommitment = keccak256("cafe");
        uint256 timeSlot = 21;
        uint256 merkleRoot = 11;
        uint256 nullifierHash = 22;
        uint256[8] memory proof;

        uint256 signal = receipts.computeSignal(
            address(this),
            subject,
            sessionId,
            locationCommitment,
            timeSlot
        );
        uint256 externalNullifier = receipts.computeExternalNullifier(
            sessionId,
            timeSlot
        );
        verifier.setExpectation(signal, externalNullifier);

        bytes32 receiptUid = receipts.submitReceipt(
            subject,
            sessionId,
            locationCommitment,
            timeSlot,
            "Dinner",
            merkleRoot,
            nullifierHash,
            proof
        );

        int256 before = reports.getReputation(subject);
        bytes32 reportUid = reports.submitReport(
            subject,
            "encrypted",
            3,
            receiptUid
        );
        int256 after = reports.getReputation(subject);

        require(reportUid == eas.STATIC_UID(), "attestation");
        require(after - before == 3, "delta");

        SafetyReport.Report memory stored = reports.getReport(0);
        require(stored.receiptUid == receiptUid, "stored receipt");
        require(stored.receiptVerified, "verified");
    }
}
