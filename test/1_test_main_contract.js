var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var Web3Utils = require('web3-utils');
const truffleAssert = require('truffle-assertions');

const RegistrarMain = artifacts.require('RegistrarMain.sol');
const RegistrarStorage = artifacts.require('RegistrarStorage.sol');

const {
    GAS_LIMIT,
    REGISTRAR_FEES,
    INVALID_REGISTRAR_FEES,
    HANDLENAME_FEES,
    INVALID_HANDLENAME_FEES,
    INVALID_REGISTRAR_NAME_1,
    INVALID_REGISTRAR_NAME_2,
    VALID_REGISTRAR_NAME_1,
    VALID_REGISTRAR_NAME_UPPER_2,
    VALID_REGISTRAR_NAME_3,
    VALID_REGISTRAR_NAME_4,
    VALID_REGISTRAR_NAME_5,
    INVALID_HANDLENAME_1,
    INVALID_HANDLENAME_3,
    INVALID_HANDLENAME_4,
    VALID_HANDLENAME_1,
    VALID_HANDLENAME_2,
    VALID_HANDLENAME_3,
    VALID_HANDLENAME_4,
    INDEX_1,
    COIN_NAME_1,
    COIN_ALIAS_1,
    INVALID_INDEX_1,
    INVALID_COIN_NAME_1,
    INVALID_COIN_ALIAS_1,
    INDEX_2,
    COIN_NAME_2,
    COIN_ALIAS_2,
    OTHER_COIN_ADDRESS_1,
    INVALID_INDEX,
    OTHER_COIN_ADDRESS_2,
    VALID_REGISTRAR_NAME_6,
} = require('./constants');

contract('Registrar Main Contract ', async (accounts) => {

    it('Should return an error when the Main Contract is deployed without the constructor.', async () => {
        var error_ = 'invalid address (argument="address", value={"gas":6721975}, code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_walletAddress", value={"gas":6721975}, code=INVALID_ARGUMENT, version=abi/5.0.7)';
        await truffleAssert.fails(RegistrarMain.new({ gas: GAS_LIMIT }), error_)
    });

    it('Should deploy the Main Contract with the constructor.', async () => {
        this.mainContract = await RegistrarMain.new(accounts[1], { gas: GAS_LIMIT });
    });

    it('Should return an error when Registrar registration fees is set by non contract owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
        await truffleAssert.reverts(this.mainContract.setRegistrarFees(Web3Utils.toHex(REGISTRAR_FEES), { from: accounts[1] }), error_)
    });

    it('Should set Registrar registration fees as 0 ETH.', async () => {
        await this.mainContract.setRegistrarFees(Web3Utils.toHex(0), { from: accounts[0] });
    });

    it('Should set a fees for registrar.', async () => {
        await this.mainContract.setRegistrarFees(Web3Utils.toHex(REGISTRAR_FEES), { from: accounts[0] });
    });

    it('Should correctly return the registrar fees.', async () => {
        let registrarFees = await this.mainContract.registrarFees.call();
        assert.equal(registrarFees.toString(), REGISTRAR_FEES);
    });

    it('Should return an error when SafleID fees is set by non contract owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
        await truffleAssert.reverts(this.mainContract.setSafleIdFees(Web3Utils.toHex(HANDLENAME_FEES), { from: accounts[1] }), error_)
    });

    it('Should set SafleID fees is as 0 ETH.', async () => {
        await this.mainContract.setSafleIdFees(Web3Utils.toHex(0), { from: accounts[0] });
    });

    it('Should set the fees for SafleID.', async () => {
        await this.mainContract.setSafleIdFees(Web3Utils.toHex(HANDLENAME_FEES), { from: accounts[0] });
    });

    it('Should check the SafleID fees.', async () => {
        let registrarFees = await this.mainContract.safleIdFees.call();
        assert.equal(registrarFees.toString(), HANDLENAME_FEES);
    });

    it('Should correctly return the contract owner.', async () => {
        let contractOwner = await this.mainContract.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should correctly return the wallet address.', async () => {
        let walletAddress = await this.mainContract.walletAddress.call();
        assert.equal(walletAddress, accounts[1]);
    });

    it('Should return an error when registration is paused by non-contract owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
        await truffleAssert.reverts(this.mainContract.toggleRegistrationStatus({ from: accounts[1] }), error_)
    });

    it('Should return false if registration is not paused.', async () => {
        let isHandlenameRegistrationPaused = await this.mainContract.safleIdRegStatus.call();
        assert.equal(isHandlenameRegistrationPaused, false);
    });

    it('Should successfully stop/pause the registration process.', async () => {
        await this.mainContract.toggleRegistrationStatus({ from: accounts[0] });
    });

    it('Should return true if registration is not paused.', async () => {
        let isHandlenameRegistrationPaused = await this.mainContract.safleIdRegStatus.call();
        assert.equal(isHandlenameRegistrationPaused, true);
    });

    it('Should successfully restart the registration process.', async () => {
        await this.mainContract.toggleRegistrationStatus({ from: accounts[0] });
    });

    it('Should return an error when the Storage Contract is deployed without the constructor.', async () => {
        var error_ = 'invalid address (argument="address", value={"gas":6721975}, code=INVALID_ARGUMENT, version=address/5.0.5)';
        await truffleAssert.fails(RegistrarStorage.new({ gas: GAS_LIMIT }), error_)
    });

    it('Should deploy the Storage Contract with the constructor.', async () => {
        this.storageContract = await RegistrarStorage.new(this.mainContract.address, { gas: GAS_LIMIT });
    });

    it('Should return an error when Storage contract address is set by non-contract owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
        await truffleAssert.reverts(this.mainContract.setStorageContract(this.storageContract.address, { from: accounts[1] }), error_)
    });

    it('Should return false if storage contract address is not set.', async () => {
        let registrarStorageContractAddress = await this.mainContract.storageContractAddress.call();
        assert.equal(registrarStorageContractAddress, false);
    });

    it('Should correctly set the Storage contract address.', async () => {
        await this.mainContract.setStorageContract(this.storageContract.address, { from: accounts[0] });
    });

    it('Should correctly return the storage contract address.', async () => {
        let registrarStorageContractAddress = await this.mainContract.registrarStorageContractAddress.call();
        assert.equal(registrarStorageContractAddress, this.storageContract.address);
    });

    it('Should return true if storage contract address is set.', async () => {
        let registrarStorageContractAddress = await this.mainContract.storageContractAddress.call();
        assert.equal(registrarStorageContractAddress, true);
    });

    it('Should return an error when Registrar name length is less than 4.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId length should be between 4-16 characters -- Reason given: SafleId length should be between 4-16 characters.';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(INVALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when Registrar name length is greater than 16.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId length should be between 4-16 characters -- Reason given: SafleId length should be between 4-16 characters.';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(INVALID_REGISTRAR_NAME_2, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when Registrar fee is not sent.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when Registrar fee is less than what was set.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: INVALID_REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should successfully register Registrar at Main Contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when new registrar is set with the same name in upper case characters.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registrar name is already taken. -- Reason given: Registrar name is already taken..';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_UPPER_2, { from: accounts[4], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when registrar is set with the same name.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registrar name is already taken. -- Reason given: Registrar name is already taken..';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[5], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when an already registered Registrar is registering again.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert This address is already registered. -- Reason given: This address is already registered..';
        await truffleAssert.reverts(this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_3, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should successfully register new Registrar at Main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_3, { from: accounts[3], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updatedBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updatedBalance);
    });

    it('Should return an error when trying to update non-registered Registrar.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registrar should register first. -- Reason given: Registrar should register first..';
        await truffleAssert.reverts(this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[0], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when trying to update Registrar without fees.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[0], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when trying to update Registrar with fees less than what was set.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[0], gas: GAS_LIMIT }), error_);
    });

    it('Should successfully update Registrar at Main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should set Registrar at Main contract with name that was taken previously.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[4], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return error when registering SafleId which contains special characters.', async () => {

        var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed -- Reason given: only alphanumeric allowed.';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], INVALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when registering SafleId with less than 4 characters.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId length should be between 4-16 characters -- Reason given: SafleId length should be between 4-16 characters.';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], INVALID_HANDLENAME_3, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when registering SafleId with greater than 16 characters.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId length should be between 4-16 characters -- Reason given: SafleId length should be between 4-16 characters.';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], INVALID_HANDLENAME_4, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when registering SafleId without fees.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], VALID_HANDLENAME_3, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when registering SafleId with fees less than what is set.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], VALID_HANDLENAME_3, { from: accounts[2], value: INVALID_HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should successfully set SafleId at Main contract by Registrar.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.registerSafleId(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + HANDLENAME_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when SafleId is set at Main contract by Registrar again with same SafleId.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when trying to register SafleId same as that of Registrar name.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert This SafleId is taken by a Registrar. -- Reason given: This SafleId is taken by a Registrar..';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[5], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when updating SafleId at main contract without fees.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..';
        await truffleAssert.reverts(this.mainContract.updateSafleId(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when updating SafleId which contains special characters.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed -- Reason given: only alphanumeric allowed.';
        await truffleAssert.reverts(this.mainContract.updateSafleId(accounts[5], INVALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when updating SafleId with less than 4 characters.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId length should be between 4-16 characters -- Reason given: SafleId length should be between 4-16 characters.';
        await truffleAssert.reverts(this.mainContract.updateSafleId(accounts[5], INVALID_HANDLENAME_3, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when updating SafleId with greater than 16 characters.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId length should be between 4-16 characters -- Reason given: SafleId length should be between 4-16 characters.';
        await truffleAssert.reverts(this.mainContract.updateSafleId(accounts[5], INVALID_HANDLENAME_4, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when updating SafleId with fees less than what is set.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Registration fees not matched. -- Reason given: Registration fees not matched..'
        await truffleAssert.reverts(this.mainContract.updateSafleId(accounts[5], VALID_HANDLENAME_3, { from: accounts[2], value: INVALID_HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should successfully update SafleId at main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.updateSafleId(accounts[5], VALID_HANDLENAME_2, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + HANDLENAME_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return error when trying to set SafleId which was set previously.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert SafleId is already used once, not available now -- Reason given: SafleId is already used once, not available now.';
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[8], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when try to update the wallet address by non-contract owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
        await truffleAssert.reverts(this.mainContract.updateWalletAddress(accounts[9], { from: accounts[8], gas: GAS_LIMIT }), error_);
    });

    it('Should successfully update the wallet address.', async () => {
        await this.mainContract.updateWalletAddress(accounts[9], { from: accounts[0], gas: GAS_LIMIT });
    });

    it('Should successfully restore the wallet address to previous one.', async () => {
        await this.mainContract.updateWalletAddress(accounts[1], { from: accounts[0], gas: GAS_LIMIT });
    });

    it('Should return error when try to add other coin mapping by non-registrar owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Invalid Registrar. -- Reason given: Invalid Registrar..';
        await truffleAssert.reverts(this.mainContract.mapCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[8], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when try to add other coin mapping using non-alphanumeric coin name.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Only alphanumeric allowed in blockchain name and alias name -- Reason given: Only alphanumeric allowed in blockchain name and alias name.';
        await truffleAssert.reverts(this.mainContract.mapCoins(INDEX_1, INVALID_COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when try to add other coin mapping using invalid coin index.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.mapCoins(INVALID_INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when try to add other coin mapping using invalid coin alias.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Only alphanumeric allowed in blockchain name and alias name -- Reason given: Only alphanumeric allowed in blockchain name and alias name.';
        await truffleAssert.reverts(this.mainContract.mapCoins(INDEX_1, COIN_NAME_1, INVALID_COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should add other coin address mapping.', async () => {
        await this.mainContract.mapCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('Should return error when try to register another coin at same index.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.mapCoins(INDEX_1, COIN_NAME_2, COIN_ALIAS_2, { from: accounts[0], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when try to register new another coin of the same name.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.mapCoins(INDEX_2, COIN_NAME_1, COIN_ALIAS_2, { from: accounts[0], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when try to register new coin by same alias name.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.mapCoins(INDEX_2, COIN_NAME_2, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when try to add other coin address for an account without SafleId.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert No SafleId for this account -- Reason given: No SafleId for this account.'
        await truffleAssert.reverts(this.mainContract.registerCoinAddress(accounts[9], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[4], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when try to add other coin address at an invalid index.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.registerCoinAddress(accounts[8], INVALID_INDEX, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should successfully add other coin address.', async () => {
        await this.mainContract.registerCoinAddress(accounts[5], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('Should return an error when try to update other coin address for an account without SafleId.', async () => {

        var error_ = 'Returned error: VM Exception while processing transaction: revert Library : String passed is of zero length -- Reason given: Library : String passed is of zero length.';
        await truffleAssert.reverts(this.mainContract.updateCoinAddress(accounts[9], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[4], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when try to update other coin address at an invalid index.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.updateCoinAddress(accounts[8], INVALID_INDEX, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when try to update other coin address without setting one.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.mainContract.updateCoinAddress(accounts[6], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it("Should return error when SafleID is registered and trying to register new account with same SafleId.", async () => {
        var error_ = "Returned error: VM Exception while processing transaction: revert SafleId is already used once, not available now -- Reason given: SafleId is already used once, not available now."
        await truffleAssert.reverts(this.mainContract.registerSafleId(accounts[6], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_)
    })

    it('Should successfully set new SafleId to new account at Main contract by Registrar.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.registerSafleId(accounts[6], VALID_HANDLENAME_4, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + HANDLENAME_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should successfully add other coin address.', async () => {
        await this.mainContract.registerCoinAddress(accounts[6], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('should successfully update other coin address.', async () => {
        await this.mainContract.updateCoinAddress(accounts[6], INDEX_1, OTHER_COIN_ADDRESS_2, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('Should update Registrar at Main contract second time.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_5, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when trying to update Registrar at Main contract third time.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Maximum update count reached. -- Reason given: Maximum update count reached..';
        await truffleAssert.reverts(this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_6, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

});
