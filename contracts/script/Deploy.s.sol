// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IdentityRegistry, IEntryPoint} from "../src/IdentityRegistry.sol";
import {ProfileManager, IEAS} from "../src/ProfileManager.sol";
import {MatchEngine, IProfileManager} from "../src/MatchEngine.sol";
import {IncentiveMechanism} from "../src/IncentiveMechanism.sol";
import {SafetyReport, IEAS as IEASSafetyReport} from "../src/SafetyReport.sol";

/// @notice Deploys all core contracts for the Kindling protocol.
///         Constructor arguments are read from environment variables so the
///         script can be reused across networks. Required variables:
///
///         - ENTRY_POINT: address of the ERC-4337 EntryPoint contract
///         - EAS: address of the Ethereum Attestation Service contract
///         - PROFILE_SCHEMA: bytes32 schema used by ProfileManager
///         - REPORT_SCHEMA: bytes32 schema used by SafetyReport
///         - PROFILE_WEIGHT: uint weight for profile matching
///         - ADDRESS_WEIGHT: uint weight for address matching
///         - DEPOSIT_AMOUNT: uint deposit required for IncentiveMechanism
///         - COOLDOWN: uint cooldown in seconds for IncentiveMechanism
///         - TREASURY: address receiving slashed deposits
contract Deploy is Script {
    function run() external {
        // Read shared configuration
        IEntryPoint entryPoint = IEntryPoint(vm.envAddress("ENTRY_POINT"));
        IEAS eas = IEAS(vm.envAddress("EAS"));
        bytes32 profileSchema = vm.envBytes32("PROFILE_SCHEMA");
        bytes32 reportSchema = vm.envBytes32("REPORT_SCHEMA");
        uint256 profileWeight = vm.envUint("PROFILE_WEIGHT");
        uint256 addressWeight = vm.envUint("ADDRESS_WEIGHT");
        uint256 depositAmount = vm.envUint("DEPOSIT_AMOUNT");
        uint256 cooldown = vm.envUint("COOLDOWN");
        address treasury = vm.envAddress("TREASURY");

        vm.startBroadcast();

        IdentityRegistry registry = new IdentityRegistry(entryPoint);
        console2.log("IdentityRegistry", address(registry));

        ProfileManager profileManager = new ProfileManager(eas, profileSchema);
        console2.log("ProfileManager", address(profileManager));

        MatchEngine.Weights memory weights = MatchEngine.Weights({
            profileWeight: profileWeight,
            addressWeight: addressWeight
        });
        MatchEngine matchEngine = new MatchEngine(
            IProfileManager(address(profileManager)),
            weights
        );
        console2.log("MatchEngine", address(matchEngine));

        IncentiveMechanism incentiveMechanism = new IncentiveMechanism(
            depositAmount,
            cooldown,
            treasury
        );
        console2.log("IncentiveMechanism", address(incentiveMechanism));

        SafetyReport safetyReport = new SafetyReport(
            IEASSafetyReport(address(eas)),
            reportSchema
        );
        console2.log("SafetyReport", address(safetyReport));

        vm.stopBroadcast();
    }
}
