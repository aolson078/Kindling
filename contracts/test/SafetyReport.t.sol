// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/SafetyReport.sol";

contract MockEAS {
    bytes32 public lastSchema;
    address public lastRecipient;
    bytes public lastData;
    bytes32 public lastUID;

    function attest(bytes32 schema, address recipient, bytes calldata data) external returns (bytes32) {
        lastSchema = schema;
        lastRecipient = recipient;
        lastData = data;
        lastUID = bytes32(uint256(lastUID) + 1);
        return lastUID;
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

    function testSubmitReport() public {
        setup();
        address user = address(0xBEEF);
        bytes32 uid = reports.submitReport(user, "encryptedCID", 1);
        int256 rep = reports.getReputation(user);
        require(rep == 1, "reputation");
        require(eas.lastRecipient() == user, "recipient");
        (string memory cid, int256 change) = abi.decode(eas.lastData(), (string, int256));
        require(keccak256(bytes(cid)) == keccak256(bytes("encryptedCID")), "cid");
        require(change == 1, "change");
        require(uid == eas.lastUID(), "uid");
    }

    function testMultipleReportsAdjustReputation() public {
        setup();
        address user = address(0xBEEF);
        reports.submitReport(user, "cid1", 2);
        reports.submitReport(user, "cid2", -1);
        int256 rep = reports.getReputation(user);
        require(rep == 1, "sum");
    }
}

