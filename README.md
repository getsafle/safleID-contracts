# InbloxID Smart Contracts

## Introduction

User adoption and onboarding have been a big challenge for blockchain-based apps or **dApps**.
Since, most of the users cannot deal with the problem of storing or managing their public address which is the main identifier for a user, user retention for a dApp remains much less compared to a traditional application. There is an ever-increasing need for an infrastructure for dApps to have a much better user experience.

The InbloxID is a distributed, open, and extensible naming system based on the Ethereum blockchain.

InbloxID is a mapping between human-readable names like **arjun** to machine-readable identifiers such as Ethereum addresses or other cryptocurrency addresses.

dApps can leverage the power of a naming system to enable an overall better user experience and thereby increase user adoption for Blockchain.

## System Interaction Actors

1. **Admin**
    1. The **admin** is responsible for maintaining and deploying the contracts.
    2. Roles of the **admin** includes setting up the fees for Registrar registration and InbloxId registration for the users.
    3. The **admin** is also responsible for setting up the wallet address which can be used for fee collection (Registrar registration and InbloxId registration).
2. **Registrar**

    The Registrar can be any dapp or developer who wants to use the InbloxId naming infrastructure for their dapp. The dApp can register themselves as a Registrar and provide the InbloxId to their users by paying the gas fees themselves. This can reduce friction in the user onboarding process. Easy user onboarding flow combined with the InbloxId naming infrastructure can enable high user retention for the dapp.

    1. The Registrar can register themselves using the add **addRegistrar** method in the RegistrarMain contract by paying the registration fee which is set by the Admin (contract deployer).
    2. Main functions of the Registrar include setting/updating the user's InbloxId with their public address, create **other coin address** mapping and registering/updating the user's **other coin address**.
3. **User**
    1. The user can be an end-user of a dApp who is using the InbloxId naming infrastructure.
    
## **Deployment**

1. *RegistrarMain* contract has to be deployed first.

2. The address of the *RegistrarMain* contract should be passed in the constructor of the *RegistrarStorage* contract.

3. The address of the *RegistrarStorage* contract has to be saved in the *RegistrarMain* contract using the function **setRegistrarStorageContract()**.

## Contract calls

### InbloxID Registration Flow

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/12a8e0ae-8cf3-4cc8-a245-2c2dac6918b8/Smart_Contract_Architecture.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210201T140727Z&X-Amz-Expires=86400&X-Amz-Signature=150c11d598ae9452b518d188ef869bde81b3ab63646c6bd91cbe72963588d488&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Smart_Contract_Architecture.png%22)

### Contract Addresses

| Contract Name         | Network       | Contract Address                           |
|:---------------------:|:-------------:|:------------------------------------------:|
| Main Contract         | Mainnet       | [0xb35090e26aa1fa295e6532544a8c152e00a60110](https://etherscan.io/address/0xb35090e26aa1fa295e6532544a8c152e00a60110) |
|                       | Ropsten       | [0x4c93af25cda90ec0b2ab16ecd3acd4385c180faf](https://ropsten.etherscan.io/address/0x4c93af25cda90ec0b2ab16ecd3acd4385c180faf) |
|                       | Rinkeby       | [0xb8f1fc389e640cd16d28892c39f33f1afdc01583](https://rinkeby.etherscan.io/address/0xb8f1fc389e640cd16d28892c39f33f1afdc01583) |
|                       | Kovan         | [0xa28f80f2f0709ce796e1d17cc7381c19de41419d](https://kovan.etherscan.io/address/0xa28f80f2f0709ce796e1d17cc7381c19de41419d) |
|                       | Goerli        | [0x856d747ce75dcbee3132a74945fbe4a8a61c067c](https://goerli.etherscan.io/address/0x856d747ce75dcbee3132a74945fbe4a8a61c067c) |
| Storage Contract      | Mainnet       | [0x7700bd2c5e57a6765397dfc1de751eba81b6ea55](https://etherscan.io/address/0x7700bd2c5e57a6765397dfc1de751eba81b6ea55) |
|                       | Ropsten       | [0x11ca500af3929f8cc1bab9c2d8de2c0fb4fcfe50](https://ropsten.etherscan.io/address/0x11ca500af3929f8cc1bab9c2d8de2c0fb4fcfe50) |
|                       | Rinkeby       | [0x46e185e188b40e380806d8a55492a065e5bfd20f](https://rinkeby.etherscan.io/address/0x46e185e188b40e380806d8a55492a065e5bfd20f) |
|                       | Kovan         | [0xb87eb51b55db3eb941e5d940a579003f700d0db1](https://kovan.etherscan.io/address/0xb87eb51b55db3eb941e5d940a579003f700d0db1) |
|                       | Goerli        | [0x741df5fd45a86a4f8bc5d3a89ae40ead64611e09](https://goerli.etherscan.io/address/0x741df5fd45a86a4f8bc5d3a89ae40ead64611e09) |
| Auction Contract      | Mainnet       |                                                                                                                               |
|                       | Ropsten       | [0x4ff628eb3f0610ba12be88e600120538a7561a7f](https://ropsten.etherscan.io/address/0x4ff628eb3f0610ba12be88e600120538a7561a7f) |
|                       | Rinkeby       | [0x16485346e2374797c7201138063aef1454890eb7](https://rinkeby.etherscan.io/address/0x16485346e2374797c7201138063aef1454890eb7) |
|                       | Kovan         | [0x9391bc9d33cfa2cef5c53285e80ae46ecb297302](https://kovan.etherscan.io/address/0x9391bc9d33cfa2cef5c53285e80ae46ecb297302) |
|                       | Goerli        | [0xa1598bf4d13e1417f1c66b523721e5b35c3a8b01](https://goerli.etherscan.io/address/0xa1598bf4d13e1417f1c66b523721e5b35c3a8b01) |

## To run the contracts locally

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
