// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEAS {
    function attest(bytes32 schema, address recipient, bytes calldata data) external returns (bytes32);
}

contract SafetyReport {
    IEAS public immutable eas;
    bytes32 public immutable schema;

    struct Report {
        address reporter;
        address subject;
        string evidence;
        int256 scoreChange;
        bytes32 uid;
    }

    mapping(address => int256) public reputation;
    Report[] private reports;

    event ReportSubmitted(address indexed reporter, address indexed subject, string evidence, int256 scoreChange, bytes32 attestationUID);

    constructor(IEAS _eas, bytes32 _schema) {
        eas = _eas;
        schema = _schema;
    }

    function submitReport(address subject, string calldata encryptedEvidence, int256 scoreChange) external returns (bytes32 uid) {
        uid = eas.attest(schema, subject, abi.encode(encryptedEvidence, scoreChange));
        reputation[subject] += scoreChange;
        reports.push(Report(msg.sender, subject, encryptedEvidence, scoreChange, uid));
        emit ReportSubmitted(msg.sender, subject, encryptedEvidence, scoreChange, uid);
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
}

