// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

import "../src/SafetyReport.sol";
import "../src/RendezvousReceipt.sol";
import "./mocks/MockEAS.sol";
import "./mocks/MockVerifier.sol";

contract SafetyReportTest {
    MockEAS private eas;
    MockSemaphoreVerifier private verifier;
    RendezvousReceipt private receipts;
    SafetyReport private reports;
    bytes32 private schema = keccak256("report");
    bytes32 private receiptSchema = keccak256("rendezvous");

    function setup() internal {
        eas = new MockEAS();
        verifier = new MockSemaphoreVerifier();
        receipts = new RendezvousReceipt(
            IEAS(address(eas)),
            ISemaphoreVerifier(address(verifier)),
            receiptSchema
        );
        reports = new SafetyReport(
            IEAS(address(eas)),
            schema,
            receipts
        );
    }

    function prepareReceipt(
        address subject,
        bytes32 sessionId,
        bytes32 locationCommitment,
        uint256 timeSlot,
        uint256 merkleRoot,
        uint256 nullifierHash,
        string memory memo
    ) internal returns (bytes32) {
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
        uint256[8] memory proof;
        return
            receipts.submitReceipt(
                subject,
                sessionId,
                locationCommitment,
                timeSlot,
                memo,
                merkleRoot,
                nullifierHash,
                proof
            );
    }

    function testPositiveReportRequiresReceiptAndRewards() public {
        setup();
        address subject = address(0xBEEF);
        bytes32 sessionId = keccak256("session");
        bytes32 locationCommitment = keccak256("cafe");
        uint256 timeSlot = 42;
        bytes32 receiptUid = prepareReceipt(
            subject,
            sessionId,
            locationCommitment,
            timeSlot,
            123,
            456,
            "Coffee"
        );

        bytes32 uid = reports.submitReport(subject, "evidence", 5, receiptUid);
        require(uid == eas.STATIC_UID(), "uid");

        int256 rep = reports.getReputation(subject);
        require(rep == 5, "reputation");

        SafetyReport.Report memory stored = reports.getReport(0);
        require(stored.reporter == address(this), "reporter");
        require(stored.subject == subject, "subject");
        require(stored.scoreChange == 5, "score");
        require(stored.receiptUid == receiptUid, "receipt");
        require(stored.receiptVerified, "verified");

        bool canSubmit = reports.canSubmitPositive(
            address(this),
            subject,
            receiptUid
        );
        require(canSubmit, "helper");
    }

    function testPositiveReportWithoutReceiptReverts() public {
        setup();
        address subject = address(0xBEEF);
        bool reverted;
        try reports.submitReport(subject, "cid", 1, bytes32(0)) returns (bytes32) {
            revert("should revert");
        } catch {
            reverted = true;
        }
        require(reverted, "expected revert");
    }

    function testNegativeReportDoesNotRequireReceipt() public {
        setup();
        address subject = address(0xBEEF);
        bytes32 uid = reports.submitReport(subject, "cid", -2, bytes32(0));
        require(uid == eas.STATIC_UID(), "uid");

        int256 rep = reports.getReputation(subject);
        require(rep == -2, "negative rep");

        SafetyReport.Report memory stored = reports.getReport(0);
        require(!stored.receiptVerified, "receipt flag");
        require(stored.receiptUid == bytes32(0), "receipt uid");

        SafetyReport.Report[] memory subjectReports = reports.getReportsFor(subject);
        require(subjectReports.length == 1, "subject filter");
        require(subjectReports[0].scoreChange == -2, "subject entry");

        SafetyReport.Report[] memory reporterReports = reports.getReportsByReporter(
            address(this)
        );
        require(reporterReports.length == 1, "reporter filter");
        require(reporterReports[0].scoreChange == -2, "reporter entry");
    }

    function testHelperRejectsMismatchedReceipt() public {
        setup();
        address subject = address(0xBEEF);
        bytes32 sessionId = keccak256("session");
        bytes32 locationCommitment = keccak256("cafe");
        uint256 timeSlot = 42;
        bytes32 receiptUid = prepareReceipt(
            subject,
            sessionId,
            locationCommitment,
            timeSlot,
            999,
            1000,
            "Tea"
        );

        bool otherCanSubmit = reports.canSubmitPositive(
            address(0x1234),
            subject,
            receiptUid
        );
        require(!otherCanSubmit, "unexpected helper");

        SafetyReport.Report[] memory none = reports.getReportsByReporter(
            address(0x1234)
        );
        require(none.length == 0, "no reports yet");
    }
}
