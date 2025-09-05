// SPDX-License-Identifier: GPL-3.0-only
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
///         - PROFILE_SCHEMA: bytes32 schema for profile data
///         - PREF_SCHEMA: bytes32 schema for user preferences
///         - VERIFY_SCHEMA: bytes32 schema for verification signals
///         - SAFETY_SCHEMA: bytes32 schema for safety signals
///         - REPORT_SCHEMA: bytes32 schema used by SafetyReport
///         - PROFILE_WEIGHT: uint weight for profile matching
///         - ADDRESS_WEIGHT: uint weight for address matching
///         - DEPOSIT_AMOUNT: uint deposit required for IncentiveMechanism
///         - COOLDOWN: uint cooldown in seconds for IncentiveMechanism
///         - TREASURY: address receiving slashed deposits
contract Deploy is Script {
    struct DeploymentConfig {
        IEntryPoint entryPoint;
        IEAS eas;
        bytes32 profileSchema;
        bytes32 prefSchema;
        bytes32 verifySchema;
        bytes32 safetySchema;
        bytes32 reportSchema;
        uint256 profileWeight;
        uint256 addressWeight;
        uint256 depositAmount;
        uint256 cooldown;
        address treasury;
    }

    function loadConfig() internal view returns (DeploymentConfig memory cfg) {
        cfg.entryPoint = IEntryPoint(vm.envAddress("ENTRY_POINT"));
        cfg.eas = IEAS(vm.envAddress("EAS"));
        cfg.profileSchema = vm.envBytes32("PROFILE_SCHEMA");
        cfg.prefSchema = vm.envBytes32("PREF_SCHEMA");
        cfg.verifySchema = vm.envBytes32("VERIFY_SCHEMA");
        cfg.safetySchema = vm.envBytes32("SAFETY_SCHEMA");
        cfg.reportSchema = vm.envBytes32("REPORT_SCHEMA");
        cfg.profileWeight = vm.envUint("PROFILE_WEIGHT");
        cfg.addressWeight = vm.envUint("ADDRESS_WEIGHT");
        cfg.depositAmount = vm.envUint("DEPOSIT_AMOUNT");
        cfg.cooldown = vm.envUint("COOLDOWN");
        cfg.treasury = vm.envAddress("TREASURY");
    }

    function run() external {
        DeploymentConfig memory cfg = loadConfig();

        vm.startBroadcast();

        IdentityRegistry registry = new IdentityRegistry(cfg.entryPoint);
        console2.log("IdentityRegistry", address(registry));

        ProfileManager profileManager = new ProfileManager(
            cfg.eas,
            cfg.profileSchema,
            cfg.prefSchema,
            cfg.verifySchema,
            cfg.safetySchema
        );
        console2.log("ProfileManager", address(profileManager));

        MatchEngine.Weights memory weights = MatchEngine.Weights({
            profileWeight: cfg.profileWeight,
            addressWeight: cfg.addressWeight
        });
        MatchEngine matchEngine = new MatchEngine(
            IProfileManager(address(profileManager)),
            weights
        );
        console2.log("MatchEngine", address(matchEngine));

        IncentiveMechanism incentiveMechanism = new IncentiveMechanism(
            cfg.depositAmount,
            cfg.cooldown,
            cfg.treasury
        );
        console2.log("IncentiveMechanism", address(incentiveMechanism));

        SafetyReport safetyReport = new SafetyReport(
            IEASSafetyReport(address(cfg.eas)),
            cfg.reportSchema
        );
        console2.log("SafetyReport", address(safetyReport));

        vm.stopBroadcast();
    }
}
