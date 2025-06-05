// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

import "../src/SafetyReport.sol";

contract MockEAS {
    bytes32 public lastSchema;
    address public lastRecipient;
    bytes public lastData;
    bytes32 public constant STATIC_UID = keccak256("static-uid");

    function attest(
        bytes32 schema,
        address recipient,
        bytes calldata data
    ) external returns (bytes32) {
        lastSchema = schema;
        lastRecipient = recipient;
        lastData = data;
        return STATIC_UID;
    }
}

contract SafetyReportTest {
    MockEAS private eas;
    SafetyReport private reports;
    bytes32 private schema = keccak256("report");

    function setup() internal {
        eas = new MockEAS();
        reports = new SafetyReport(IEAS(address(eas)), schema);
    }

    function testSubmitAndRetrieveReport() public {
        setup();
        address subject = address(0xBEEF);
        string memory cid = "encryptedCID";
        int256 change = 1;

        bytes32 uid = reports.submitReport(subject, cid, change);
        require(uid == eas.STATIC_UID(), "uid");

        int256 rep = reports.getReputation(subject);
        require(rep == change, "reputation");

        SafetyReport.Report memory r = reports.getReport(0);
        require(r.reporter == address(this), "reporter");
        require(r.subject == subject, "subject");
        require(
            keccak256(bytes(r.evidence)) == keccak256(bytes(cid)),
            "evidence"
        );
        require(r.scoreChange == change, "score");
        require(r.uid == uid, "stored uid");

        require(reports.totalReports() == 1, "total");
        require(eas.lastRecipient() == subject, "recipient");
        (string memory lastCid, int256 lastChange) = abi.decode(
            eas.lastData(),
            (string, int256)
        );
        require(
            keccak256(bytes(lastCid)) == keccak256(bytes(cid)),
            "attested cid"
        );
        require(lastChange == change, "attested score");
    }

    function testMultipleReportsAdjustReputationAndStorage() public {
        setup();
        address subject = address(0xBEEF);
        reports.submitReport(subject, "cid1", 2);
        reports.submitReport(subject, "cid2", -1);

        int256 rep = reports.getReputation(subject);
        require(rep == 1, "sum");
        require(reports.totalReports() == 2, "total reports");

        SafetyReport.Report memory second = reports.getReport(1);
        require(
            keccak256(bytes(second.evidence)) == keccak256(bytes("cid2")),
            "second evidence"
        );
        require(second.scoreChange == -1, "second score");
        require(second.uid == eas.STATIC_UID(), "second uid");
    }
}
