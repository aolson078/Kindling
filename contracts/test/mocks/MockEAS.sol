// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.26;

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
