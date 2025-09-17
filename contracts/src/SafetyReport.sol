// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

import "./RendezvousReceipt.sol";

contract SafetyReport {
    IEAS public immutable eas;
    bytes32 public immutable schema;
    RendezvousReceipt public immutable rendezvous;

    struct Report {
        address reporter;
        address subject;
        string evidence;
        int256 scoreChange;
        bytes32 uid;
        bytes32 receiptUid;
        bool receiptVerified;
    }

    mapping(address => int256) public reputation;
    Report[] private reports;

    event ReportSubmitted(
        address indexed reporter,
        address indexed subject,
        string evidence,
        int256 scoreChange,
        bytes32 attestationUID,
        bytes32 receiptUid,
        bool receiptVerified
    );

    constructor(
        IEAS _eas,
        bytes32 _schema,
        RendezvousReceipt _rendezvous
    ) {
        eas = _eas;
        schema = _schema;
        rendezvous = _rendezvous;
    }

    function submitReport(
        address subject,
        string calldata encryptedEvidence,
        int256 scoreChange,
        bytes32 receiptUid
    ) external returns (bytes32 uid) {
        require(subject != address(0), "subject");

        bool isPositive = scoreChange > 0;
        bool receiptVerified = false;

        if (isPositive) {
            require(receiptUid != bytes32(0), "receipt required");
            receiptVerified = rendezvous.validateReceipt(
                receiptUid,
                msg.sender,
                subject
            );
            require(receiptVerified, "invalid receipt");
        } else if (receiptUid != bytes32(0)) {
            receiptVerified = rendezvous.validateReceipt(
                receiptUid,
                msg.sender,
                subject
            );
        }

        uid = eas.attest(
            schema,
            subject,
            abi.encode(encryptedEvidence, scoreChange, receiptUid)
        );

        if (scoreChange != 0) {
            reputation[subject] += scoreChange;
        }

        reports.push(
            Report({
                reporter: msg.sender,
                subject: subject,
                evidence: encryptedEvidence,
                scoreChange: scoreChange,
                uid: uid,
                receiptUid: receiptUid,
                receiptVerified: receiptVerified
            })
        );

        emit ReportSubmitted(
            msg.sender,
            subject,
            encryptedEvidence,
            scoreChange,
            uid,
            receiptUid,
            receiptVerified
        );
    }

    function getReputation(address account) external view returns (int256) {
        return reputation[account];
    }

    function getReport(uint256 index) external view returns (Report memory) {
        return reports[index];
    }

    function totalReports() external view returns (uint256) {
        return reports.length;
    }

    function getReportsFor(
        address subject
    ) external view returns (Report[] memory filtered) {
        uint256 total = reports.length;
        uint256 count;
        for (uint256 i = 0; i < total; i++) {
            if (reports[i].subject == subject) {
                count++;
            }
        }

        filtered = new Report[](count);
        uint256 ptr;
        for (uint256 i = 0; i < total; i++) {
            if (reports[i].subject == subject) {
                filtered[ptr++] = reports[i];
            }
        }
    }

    function getReportsByReporter(
        address reporter
    ) external view returns (Report[] memory filtered) {
        uint256 total = reports.length;
        uint256 count;
        for (uint256 i = 0; i < total; i++) {
            if (reports[i].reporter == reporter) {
                count++;
            }
        }

        filtered = new Report[](count);
        uint256 ptr;
        for (uint256 i = 0; i < total; i++) {
            if (reports[i].reporter == reporter) {
                filtered[ptr++] = reports[i];
            }
        }
    }

    function canSubmitPositive(
        address reporter,
        address subject,
        bytes32 receiptUid
    ) external view returns (bool) {
        if (receiptUid == bytes32(0)) {
            return false;
        }
        return rendezvous.validateReceipt(receiptUid, reporter, subject);
    }
}
