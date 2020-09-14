var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var Web3Utils = require('web3-utils');

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
        try {
            this.mainContract = await RegistrarMain.new({ gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'invalid address (arg="_walletAddress", coderType="address", value={"gas":600000000})';
            assert.equal(error.message, error_)
        }
    });
    
    it('Should deploy the Main Contract with the constructor.', async () => {
        this.mainContract = await RegistrarMain.new(accounts[1], { gas: GAS_LIMIT });
    });

    it('Should return an error when Registrar registration fees is set by non contract owner.', async () => {
        try {
            await this.mainContract.setRegistrarFees(Web3Utils.toHex(REGISTRAR_FEES), { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar registration fees is set as 0 ETH.', async () => {
        try {
            await this.mainContract.setRegistrarFees(Web3Utils.toHex(0), { from: accounts[0] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set a fees for registrar.', async () => {
        await this.mainContract.setRegistrarFees(Web3Utils.toHex(REGISTRAR_FEES), { from: accounts[0] });
    });

    it('Should correctly return the registrar fees.', async () => {
        let registrarFees = await this.mainContract.registrarFees.call();
        assert.equal(registrarFees.toString(), REGISTRAR_FEES);
    });

    it('Should return an error when Registrar Handlename fees is set by non contract owner.', async () => {
        try {
            await this.mainContract.setHandleNameFees(Web3Utils.toHex(HANDLENAME_FEES), { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar Handlename fees is set as 0 ETH.', async () => {
        try {
            await this.mainContract.setHandleNameFees(Web3Utils.toHex(0), { from: accounts[0] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set the fees for Handlename.', async () => {
        await this.mainContract.setHandleNameFees(Web3Utils.toHex(HANDLENAME_FEES), { from: accounts[0] });
    });

    it('Should check the Handlename fees.', async () => {
        let registrarFees = await this.mainContract.userHandleNameRegFees.call();
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

    it('Should return an error when Handlename registration is paused by non-contract owner.', async () => {
        try {
            await this.mainContract.stopOrRestartRegistration({ from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return false if handlename registration is not paused.', async () => {
        let isHandlenameRegistrationPaused = await this.mainContract.isHandlenameRegistrationPaused.call();
        assert.equal(isHandlenameRegistrationPaused, false);
    });

    it('Should successfully stop the handlename registration process.', async () => {
        await this.mainContract.stopOrRestartRegistration({ from: accounts[0] });
    });

    it('Should return true if handlename registration is not paused.', async () => {
        let isHandlenameRegistrationPaused = await this.mainContract.isHandlenameRegistrationPaused.call();
        assert.equal(isHandlenameRegistrationPaused, true);
    });

    it('Should successfully restart the handlename registration process.', async () => {
        await this.mainContract.stopOrRestartRegistration({ from: accounts[0] });
    });

    it('Should return an error when the Storage Contract is deployed without the constructor.', async () => {
        try {
            this.storageContract = await RegistrarStorage.new({ gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'invalid address (arg="_mainContractAddress", coderType="address", value={"gas":600000000})';
            assert.equal(error.message, error_)
        }
    });

    it('Should deploy the Storage Contract with the constructor.', async () => {
        this.storageContract = await RegistrarStorage.new(this.mainContract.address, { gas: GAS_LIMIT });
    });

    it('Should return an error when Storage contract address is set by non-contract owner.', async () => {
        try {
            await this.mainContract.setRegistrarStorageContract(this.storageContract.address, { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return false if storage contract address is set.', async () => {
        let registrarStorageContractAddress = await this.mainContract.storageContractAddress.call();
        assert.equal(registrarStorageContractAddress, false);
    });

    it('Should correctly set the Storage contract address.', async () => {
        await this.mainContract.setRegistrarStorageContract(this.storageContract.address, { from: accounts[0] });
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
        try {
            await this.mainContract.addRegistrar(INVALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar name length is greater than 16.', async () => {
        try {
            await this.mainContract.addRegistrar(INVALID_REGISTRAR_NAME_2, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar fee is not sent.', async () => {
        try {
            await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert  registration fees not matched -- Reason given:  registration fees not matched.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar fee is less than what was set.', async () => {
        try {
            await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: INVALID_REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert  registration fees not matched -- Reason given:  registration fees not matched.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully register Registrar at Main Contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when new registrar is set with the same name in upper case characters.', async () => {
        try {
            await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_UPPER_2, { from: accounts[4], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar with the same name -- Reason given: Ragistrar with the same name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when registrar is set with the same name.', async () => {
        try {
            await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[5], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar with the same name -- Reason given: Ragistrar with the same name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when an already registered Registrar is registering again.', async () => {
        try {
            await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_3, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully register new Registrar at Main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_3, { from: accounts[3], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updatedBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updatedBalance);
    });

    it('Should return an error when trying to update non-registered Registrar.', async () => {
        try {
            await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[0], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar should register first -- Reason given: Ragistrar should register first.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to update Registrar without fees.', async () => {
        try {
            await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[0], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registration fees not matched -- Reason given: registration fees not matched.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to update Registrar with fees less than what was set.', async () => {
        try {
            await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_4, { from: accounts[0], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registration fees not matched -- Reason given: registration fees not matched.';
            assert.equal(error.message, error_);
        }
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
        await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[4], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return error when registering Handlename which contains special characters.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], INVALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed -- Reason given: only alphanumeric allowed.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when registering Handlename with less than 4 characters.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], INVALID_HANDLENAME_3, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when registering Handlename with greater than 16 characters.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], INVALID_HANDLENAME_4, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when registering Handlename without fees.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], VALID_HANDLENAME_3, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Fees doesn\'t Match -- Reason given: Fees doesn\'t Match.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when registering Handlename with fees less than what is set.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], VALID_HANDLENAME_3, { from: accounts[2], value: INVALID_HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Fees doesn\'t Match -- Reason given: Fees doesn\'t Match.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully set Handlename at Main contract by Registrar.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.addHandleName(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + HANDLENAME_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when Handlename is set at Main contract by Registrar again with same Handlename.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to register Handlename same as that of Registrar name.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[5], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registrar with same name -- Reason given: registrar with same name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when updating Handlename at main contract without fees.', async () => {
        try {
            await this.mainContract.updateHandleNameOfUser(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registration fees not matched -- Reason given: registration fees not matched.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when updating Handlename which contains special characters.', async () => {
        try {
            await this.mainContract.updateHandleNameOfUser(accounts[5], INVALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed -- Reason given: only alphanumeric allowed.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when updating Handlename with less than 4 characters.', async () => {
        try {
            await this.mainContract.updateHandleNameOfUser(accounts[5], INVALID_HANDLENAME_3, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when updating Handlename with greater than 16 characters.', async () => {
        try {
            await this.mainContract.updateHandleNameOfUser(accounts[5], INVALID_HANDLENAME_4, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when updating Handlename with fees less than what is set.', async () => {
        try {
            await this.mainContract.updateHandleNameOfUser(accounts[5], VALID_HANDLENAME_3, { from: accounts[2], value: INVALID_HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registration fees not matched -- Reason given: registration fees not matched.'
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully update Handlename at main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.updateHandleNameOfUser(accounts[5], VALID_HANDLENAME_2, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + HANDLENAME_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return error when trying to set Handlename which was set previously.', async () => {
        try {
            await this.mainContract.addHandleName(accounts[8], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handl name is already used once, not available now -- Reason given: Handl name is already used once, not available now.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when try to update the wallet address by non-contract owner.', async () => {
        try {
            await this.mainContract.updateWalletAddress(accounts[9], { from: accounts[8], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully update the wallet address.', async () => {
        await this.mainContract.updateWalletAddress(accounts[9], { from: accounts[0], gas: GAS_LIMIT });
    });

    it('Should successfully restore the wallet address to previous one.', async () => {
        await this.mainContract.updateWalletAddress(accounts[1], { from: accounts[0], gas: GAS_LIMIT });
    });

    it('Should return error when try to add other coin mapping by non-registrar owner.', async () => {
        try {
            await this.mainContract.addCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[8], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Invalid Ragistrar -- Reason given: Invalid Ragistrar.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when try to add other coin mapping using non-alphanumeric coin name.', async () => {
        try {
            await this.mainContract.addCoins(INDEX_1, INVALID_COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed in blockchain name and alias name -- Reason given: only alphanumeric allowed in blockchain name and alias name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when try to add other coin mapping using invalid coin index.', async () => {
        try {
            await this.mainContract.addCoins(INVALID_INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when try to add other coin mapping using invalid coin alias.', async () => {
        try {
            await this.mainContract.addCoins(INDEX_1, COIN_NAME_1, INVALID_COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed in blockchain name and alias name -- Reason given: only alphanumeric allowed in blockchain name and alias name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should add other coin address mapping.', async () => {
        await this.mainContract.addCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('Should return error when try to register another coin at same index.', async () => {
        try {
            await this.mainContract.addCoins(INDEX_1, COIN_NAME_2, COIN_ALIAS_2, { from: accounts[0], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when try to register new another coin of the same name.', async () => {
        try {
            await this.mainContract.addCoins(INDEX_2, COIN_NAME_1, COIN_ALIAS_2, { from: accounts[0], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when try to register new coin by same alias name.', async () => {
        try {
            await this.mainContract.addCoins(INDEX_2, COIN_NAME_2, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when try to add other coin address for an account without Handlename.', async () => {
        try {
            await this.mainContract.registerCoinAddress(accounts[9], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[4], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Storage contract fail -- Reason given: Storage contract fail.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when try to add other coin address at an invalid index.', async () => {
        try {
            await this.mainContract.registerCoinAddress(accounts[8], INVALID_INDEX, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully add other coin address.', async () => {
        await this.mainContract.registerCoinAddress(accounts[9], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('Should return an error when try to update other coin address for an account without Handlename.', async () => {
        try {
            await this.mainContract.updateCoinAddress(accounts[9], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[4], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Storage contract fail -- Reason given: Storage contract fail.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when try to update other coin address at an invalid index.', async () => {
        try {
            await this.mainContract.updateCoinAddress(accounts[8], INVALID_INDEX, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when try to update other coin address without setting one.', async () => {
        try {
            await this.mainContract.updateCoinAddress(accounts[6], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('should successfully update other coin address.', async () => {
        await this.mainContract.updateCoinAddress(accounts[9], INDEX_1, OTHER_COIN_ADDRESS_2, { from: accounts[2], gas: GAS_LIMIT });
    });

    it('Should update Registrar at Main contract second time.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_5, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + REGISTRAR_FEES;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when trying to update Registrar at Main contract third time.', async () => {
        try {
            await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_6, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert You have no more update count left -- Reason given: You have no more update count left.';
            assert.equal(error.message, error_);
        }
    });

});
