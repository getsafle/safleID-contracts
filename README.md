# SafleID Smart Contracts

## Introduction

User adoption and onboarding have been a big challenge for blockchain-based apps or **dApps**.
Since, most of the users cannot deal with the problem of storing or managing their public address which is the main identifier for a user, user retention for a dApp remains much less compared to a traditional application. There is an ever-increasing need for an infrastructure for dApps to have a much better user experience.

The SafleID is a distributed, open, and extensible naming system based on the Ethereum blockchain.

SafleID is a mapping between human-readable names like **arjun** to machine-readable identifiers such as Ethereum addresses or other cryptocurrency addresses.

dApps can leverage the power of a naming system to enable an overall better user experience and thereby increase user adoption for Blockchain.

## System Interaction Actors

1. **Admin**
    1. The **admin** is responsible for maintaining and deploying the contracts.
    2. Roles of the **admin** includes setting up the fees for Registrar registration and SafleID registration for the users.
    3. The **admin** is also responsible for setting up the wallet address which can be used for fee collection (Registrar registration and SafleID registration).
2. **Registrar**

    The Registrar can be any dapp or developer who wants to use the SafleID naming infrastructure for their dapp. The dApp can register themselves as a Registrar and provide the SafleID to their users by paying the gas fees themselves. This can reduce friction in the user onboarding process. Easy user onboarding flow combined with the SafleID naming infrastructure can enable high user retention for the dapp.

    1. The Registrar can register themselves using the add **addRegistrar** method in the RegistrarMain contract by paying the registration fee which is set by the Admin (contract deployer).
    2. Main functions of the Registrar include setting/updating the user's SafleID with their public address, create **other coin address** mapping and registering/updating the user's **other coin address**.
3. **User**
    1. The user can be an end-user of a dApp who is using the SafleID naming infrastructure.
    
## **Deployment**

1. *RegistrarMain* contract has to be deployed first.

2. The address of the *RegistrarMain* contract should be passed in the constructor of the *RegistrarStorage* contract.

3. The address of the *RegistrarStorage* contract has to be saved in the *RegistrarMain* contract using the function **setRegistrarStorageContract()**.

## Contract calls

### SafleID Registration Flow

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/12a8e0ae-8cf3-4cc8-a245-2c2dac6918b8/Smart_Contract_Architecture.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210201T140727Z&X-Amz-Expires=86400&X-Amz-Signature=150c11d598ae9452b518d188ef869bde81b3ab63646c6bd91cbe72963588d488&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Smart_Contract_Architecture.png%22)

### Contract Addresses

| Contract Name         | Network       | Contract Address                           |
|:---------------------:|:-------------:|:------------------------------------------:|
| Main Contract         | Testnet       | [0x67Fe7143c49059FD859f13269C02F08ABF33d9Aa](https://explorer-mumbai.maticvigil.com/address/0x67Fe7143c49059FD859f13269C02F08ABF33d9Aa/transactions) |
| Storage Contract      | Testnet       | [0x86455349E7B6580E8545ddEFdB8f20b9F475ab1f](https://explorer-mumbai.maticvigil.com/address/0x86455349E7B6580E8545ddEFdB8f20b9F475ab1f/transactions) |
| Auction Contract      | Testnet       | [0x72E8fc98d820f7feFfcB75c8408B79E4f94eaC3b](https://explorer-mumbai.maticvigil.com/address/0x72E8fc98d820f7feFfcB75c8408B79E4f94eaC3b/transactions) |
| Main Contract         | Mainnet       | [0x95A5594c63EC5B5E5A5Bb000990Ac567d90095dB](https://polygonscan.com/tx/0x1e1981ebf6b65af2fc61f60d6d57604b8e386380f6cd8398cd98fdee570ca80e) |
| Storage Contract      | Mainnet       | [0x330b4d83830aaB73FC24B66751a02a6EE693671e](https://polygonscan.com/tx/0x4c44652a8cff8ca59cd6e39ecce16e807e3b461d4520d29b623bbe43769faed2) |
| Auction Contract      | Mainnet       | [0xb45A4DDeF52CBc896B556E581dC62cef306e8A7d](https://polygonscan.com/tx/0xe3c4fb1ded555d0df34c57abfb97c6b85123fec3480e5cd10fbca1f7d44afe69) |

## To run the contracts locally

### Install Dependencies

Install Ganache-cli globally using the command,
```npm install -g ganache-cli```


Install truffle globally using the command,
```npm install -g truffle```


### Run contract Migrations

Spin up a local ganache instance using the command,
```ganache-cli allowUnlimitedContractSize -l 1000000000000```


Create a `.env` file in the root directory and add the 12 word mnemonic seeds in the variable `mnemonic`.

eg. `mnemonic='12 word seed phrase'`


Migrate the contracts to the ganache instance using the command,
```truffle migrate --network matic```


To run code coverage for the contracts,
```truffle run coverage```
