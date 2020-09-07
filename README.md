#   InbloxID Smart Contracts

This repository hosts the InbloxID open source smart contracts.

### Install Dependencies

Install Ganache-cli globally using the command,

```npm install -g ganache-cli```

Install truffle globally using the command,

```npm install -g truffle```

### Run contract Migrations

Spin up a local ganache instance using the command,

```ganache-cli allowUnlimitedContractSize -l 1000000000000```

Migrate the contracts to the ganache instance using the command,

```truffle migrate```

To run the test cases,

```truffle test```

To run code coverage for the contracts,

```truffle run coverage```
