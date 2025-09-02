SHELL := bash

.PHONY: anvil build deploy abi

anvil:
	@which anvil >/dev/null 2>&1 || { echo "anvil not found. Install Foundry: https://book.getfoundry.sh"; exit 1; }
	anvil

build:
	@which forge >/dev/null 2>&1 || { echo "forge not found. Install Foundry: https://book.getfoundry.sh"; exit 1; }
	cd contracts && forge build

deploy:
	@which forge >/dev/null 2>&1 || { echo "forge not found. Install Foundry: https://book.getfoundry.sh"; exit 1; }
	cd contracts && forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545

abi:
	@which forge >/dev/null 2>&1 || { echo "forge not found. Install Foundry: https://book.getfoundry.sh"; exit 1; }
	cd contracts && forge build && mkdir -p ../web3-app/abi && cp out/Counter.sol/Counter.json ../web3-app/abi/


