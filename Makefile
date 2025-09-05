SHELL := bash

.PHONY: anvil build deploy abi

anvil:
	@which anvil >/dev/null 2>&1 || { echo "anvil not found. Install Foundry: https://book.getfoundry.sh"; exit 1; }
	anvil

build:
	cd contracts && npm run compile

deploy:
	cd contracts && npm run deploy

abi:
	cd contracts && npm run compile && mkdir -p ../web3-app/src/abi && \
	  cp artifacts/src/Counter.sol/Counter.json \
	     artifacts/src/IdentityRegistry.sol/IdentityRegistry.json \
	     artifacts/src/ProfileManager.sol/ProfileManager.json \
	     artifacts/src/MatchEngine.sol/MatchEngine.json \
	     artifacts/src/IncentiveMechanism.sol/IncentiveMechanism.json \
	     artifacts/src/SafetyReport.sol/SafetyReport.json \
	     ../web3-app/src/abi/