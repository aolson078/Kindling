// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

interface IEAS {
    function attest(
        bytes32 schema,
        address recipient,
        bytes calldata data
    ) external returns (bytes32);
}

interface ISemaphoreVerifier {
    function verifyProof(
        uint256 merkleRoot,
        uint256 nullifierHash,
        uint256 signalHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external view;
}

contract RendezvousReceipt {
    IEAS public immutable eas;
    ISemaphoreVerifier public immutable verifier;
    bytes32 public immutable schema;

    uint256 internal constant SNARK_SCALAR_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    struct Receipt {
        address submitter;
        address counterpart;
        bytes32 sessionId;
        bytes32 locationCommitment;
        uint256 timeSlot;
        uint256 merkleRoot;
        uint256 nullifierHash;
        bytes32 attestationUid;
        string memo;
    }

    mapping(bytes32 => Receipt) private receipts;
    mapping(uint256 => bool) public nullifierHashes;

    event ReceiptSubmitted(
        address indexed submitter,
        address indexed counterpart,
        bytes32 indexed receiptUid,
        bytes32 sessionId,
        uint256 timeSlot
    );

    constructor(
        IEAS _eas,
        ISemaphoreVerifier _verifier,
        bytes32 _schema
    ) {
        eas = _eas;
        verifier = _verifier;
        schema = _schema;
    }

    function submitReceipt(
        address counterpart,
        bytes32 sessionId,
        bytes32 locationCommitment,
        uint256 timeSlot,
        string calldata memo,
        uint256 merkleRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external returns (bytes32 uid) {
        require(counterpart != address(0), "counterpart");
        require(counterpart != msg.sender, "self");
        require(sessionId != bytes32(0), "session");
        require(!nullifierHashes[nullifierHash], "nullifier");

        uint256 signalHash = computeSignal(
            msg.sender,
            counterpart,
            sessionId,
            locationCommitment,
            timeSlot
        );
        uint256 externalNullifier = computeExternalNullifier(
            sessionId,
            timeSlot
        );

        verifier.verifyProof(
            merkleRoot,
            nullifierHash,
            signalHash,
            externalNullifier,
            proof
        );

        nullifierHashes[nullifierHash] = true;

        uid = eas.attest(
            schema,
            counterpart,
            abi.encode(
                msg.sender,
                counterpart,
                sessionId,
                locationCommitment,
                timeSlot,
                memo,
                nullifierHash,
                merkleRoot
            )
        );

        receipts[uid] = Receipt({
            submitter: msg.sender,
            counterpart: counterpart,
            sessionId: sessionId,
            locationCommitment: locationCommitment,
            timeSlot: timeSlot,
            merkleRoot: merkleRoot,
            nullifierHash: nullifierHash,
            attestationUid: uid,
            memo: memo
        });

        emit ReceiptSubmitted(msg.sender, counterpart, uid, sessionId, timeSlot);
    }

    function getReceipt(bytes32 uid) external view returns (Receipt memory) {
        return receipts[uid];
    }

    function receiptExists(bytes32 uid) external view returns (bool) {
        return receipts[uid].attestationUid != bytes32(0);
    }

    function validateReceipt(
        bytes32 uid,
        address participantA,
        address participantB
    ) public view returns (bool) {
        Receipt storage receipt = receipts[uid];
        if (receipt.attestationUid == bytes32(0)) {
            return false;
        }
        bool aMatch =
            receipt.submitter == participantA || receipt.counterpart == participantA;
        bool bMatch =
            receipt.submitter == participantB || receipt.counterpart == participantB;
        return aMatch && bMatch;
    }

    function computeSignal(
        address attendee,
        address counterpart,
        bytes32 sessionId,
        bytes32 locationCommitment,
        uint256 timeSlot
    ) public pure returns (uint256) {
        return
            _hashToField(
                abi.encodePacked(
                    "kindling:rendezvous:signal",
                    attendee,
                    counterpart,
                    sessionId,
                    locationCommitment,
                    timeSlot
                )
            );
    }

    function computeExternalNullifier(
        bytes32 sessionId,
        uint256 timeSlot
    ) public pure returns (uint256) {
        return
            _hashToField(
                abi.encodePacked(
                    "kindling:rendezvous:external",
                    sessionId,
                    timeSlot
                )
            );
    }

    function _hashToField(bytes memory data) internal pure returns (uint256) {
        return uint256(keccak256(data)) % SNARK_SCALAR_FIELD;
    }
}
