var Web3Utils = require('web3-utils');

const RegistrarMain = artifacts.require('RegistrarMain.sol');
const RegistrarStorage = artifacts.require('RegistrarStorage.sol');

const {
    GAS_LIMIT,
    REGISTRAR_FEES,
    HANDLENAME_FEES,
    INVALID_HANDLENAME_2,
    VALID_REGISTRAR_NAME_1,
    VALID_REGISTRAR_NAME_2,
    VALID_HANDLENAME_1,
    VALID_REGISTRAR_NAME_3,
    VALID_HANDLENAME_2,
    INDEX_1,
    COIN_NAME_1,
    COIN_ALIAS_1,
    OTHER_COIN_ADDRESS_1,
    INVALID_OTHER_COIN_ADDRESS_1,
} = require('./constants');

contract('Registrar Storage Contract ', async (accounts) => {

    it('Should deploy the Main Contract with the constructor.', async () => {
        this.mainContract = await RegistrarMain.new(accounts[1], { gas: GAS_LIMIT });
    });

    it('Should deploy the Storage Contract with the constructor.', async () => {
        this.storageContract = await RegistrarStorage.new(this.mainContract.address);
    });

    it('Should correctly return the Storage contract owner address.', async () => {
        let contractOwner = await this.storageContract.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should return an error when registerRegistrar method is called by non Main Contract.', async () => {
        try {
            await this.storageContract.registerRegistrar(accounts[2], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should get the address of a Registrar from Registrar name.', async () => {

        await this.mainContract.setRegistrarStorageContract(this.storageContract.address, { from: accounts[0] });

        await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        let registrarName = await this.storageContract.resolveRegistrarFromHandleNameString.call(VALID_REGISTRAR_NAME_1);
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get the total number of registered Registrars.', async () => {
        let totalRegistrars = await this.storageContract.totalRegistrars.call();
        assert.equal(totalRegistrars.toNumber(), 1);
    });

    it('Should get the Registrar Info by Registrar address.', async () => {
        let Registrars = await this.storageContract.Registrars.call(accounts[2]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, VALID_REGISTRAR_NAME_1);
        assert.equal(Registrars.registarAddress, accounts[2]);
    });

    it('Should get a Registrar name by address.', async () => {
        let resolveRegistrarFromaddress = await this.storageContract.resolveRegistrarFromaddress(accounts[2]);
        assert.equal(resolveRegistrarFromaddress, VALID_REGISTRAR_NAME_1);
    });

    it('Should return an error when querying the info for non-registered Registrar.', async () => {
        try {
            await this.storageContract.resolveRegistrarFromaddress(accounts[5]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar not registered';
            assert.equal(error.message, error_);
        }
    });

    it('Should get the address of a Registrar from Registrar name.', async () => {
        let registrarName = await this.storageContract.resolveRegistrarFromHandleNameString.call(VALID_REGISTRAR_NAME_1);
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get the address of a Registrar from address post updating.', async () => {

        await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_2, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        let registrarName = await this.storageContract.resolveRegistrarFromHandleNameString.call(VALID_REGISTRAR_NAME_2);
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get the Registrar updation count.', async () => {
        let updateRegistrarCount = await this.storageContract.updateRegistrarCount.call(accounts[2]);
        assert.equal(updateRegistrarCount.toNumber(), 1);
    });

    it('Should return error when trying to set Handlename by non-main contract.', async () => {
        try {
            await this.storageContract.setAddressAndHandleName(accounts[5], accounts[2], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return false when an address is passed which is already registered.', async () => {
        let validHandleName = await this.storageContract.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleName, false);
    });

    it('Should check if Handlename user address already registered or not.', async () => {

        await this.mainContract.addHandleName(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

        let validHandleName = await this.storageContract.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleName, true);
    });

    it('Should get a Handlename by address.', async () => {
        let resolveHandleNameString = await this.storageContract.resolveHandleNameString(VALID_HANDLENAME_1);
        assert.equal(resolveHandleNameString, accounts[5]);
    });

    it('Should get a Handlename by address.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_HANDLENAME_1);
        assert.equal(resolveHandleNameOrRegistrarName, accounts[5]);
    });

    it('Should get a Registrar address by name.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_REGISTRAR_NAME_2);
        assert.equal(resolveHandleNameOrRegistrarName, accounts[2]);
    });

    it('Should return an error when trying to update Registrar at Storage contract directly.', async () => {
        try {
            await this.storageContract.updateRegistrar(accounts[2], VALID_REGISTRAR_NAME_3, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should get the address by Handlename after update.', async () => {

        await this.mainContract.addHandleName(accounts[8], VALID_HANDLENAME_2, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

        let resolveHandleNameString = await this.storageContract.resolveHandleNameString(VALID_HANDLENAME_2);
        assert.equal(resolveHandleNameString, accounts[8]);
    });

    it('Should get a address by Handlename after update using different method.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_HANDLENAME_2);
        assert.equal(resolveHandleNameOrRegistrarName, accounts[8]);
    });

    it('Should get the total Handlenames registered at Storage contract.', async () => {
        let totalHandleNameRegistered = await this.storageContract.totalHandleNameRegistered();
        assert.equal(totalHandleNameRegistered.toNumber(), 2);
    });

    it('Should return false for blockchain index before adding.', async () => {
        let indexTaken = await this.storageContract.indexTaken(1);
        assert.equal(indexTaken, false);
    });

    it('Should return true for blockchain index after adding.', async () => {

        await this.mainContract.addCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });

        let indexTaken = await this.storageContract.indexTaken(1);
        assert.equal(indexTaken, true);
    });

    it('Should get a coin name By index.', async () => {
        let indexOfCoin = await this.storageContract.indexOfCoin(1);
        assert.equal(indexOfCoin.toString(), COIN_NAME_1);
    });

    it('Should get the blockchain alias name by index.', async () => {
        let getBlockchainAliasNameByIndex = await this.storageContract.getCoinAliasNameByIndex(1);
        assert.equal(getBlockchainAliasNameByIndex.toString(), COIN_ALIAS_1);
    });

    it('Should check if a particular coin name is registered or not by blockchain name.', async () => {
        let isBlockchainRegistered = await this.storageContract.isCoinRegistered(COIN_NAME_1);
        assert.equal(isBlockchainRegistered, true);
    });

    it('Should return an error at invalid index.', async () => {
        try {
            await this.storageContract.resolveCoinAddress(VALID_HANDLENAME_1, 0);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error at invalid Handlename.', async () => {
        try {
            await this.storageContract.resolveCoinAddress(INVALID_HANDLENAME_2, 1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully resolve other address using Handlename.', async () => {

        await this.mainContract.registerCoinAddress(accounts[5], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });

        let resolveCoinAddress = await this.storageContract.resolveCoinAddress(VALID_HANDLENAME_1, 1);
        assert.equal(resolveCoinAddress.toString(), OTHER_COIN_ADDRESS_1);
    });

    it('Should return an error at invalid index.', async () => {
        try {
            await this.storageContract.resolveCoinHandleName(OTHER_COIN_ADDRESS_1, 0);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error at invalid address', async () => {
        try {
            await this.storageContract.resolveCoinHandleName(INVALID_OTHER_COIN_ADDRESS_1, 1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should resolve HandleName using coin address.', async () => {
        let resolveCoinHandleName = await this.storageContract.resolveCoinHandleName(OTHER_COIN_ADDRESS_1, 1);
        assert.equal(resolveCoinHandleName.toString(), VALID_HANDLENAME_1);
    });

    it('Should return user Handlename from address.', async () => {
        let resolveHandleName = await this.storageContract.resolveHandleName(accounts[5]);
        assert.equal(resolveHandleName.toString(), VALID_HANDLENAME_1);
    });

    it('Should return an error when resolving Handlename from address which is not registered.', async () => {
        try {
            await this.storageContract.resolveHandleName(accounts[3]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Not a valid user address';
            assert.equal(error.message, error_);
        }
    });

})