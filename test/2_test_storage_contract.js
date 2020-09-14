var Web3Utils = require('web3-utils');

const RegistrarMain = artifacts.require('RegistrarMain.sol');
const RegistrarStorage = artifacts.require('RegistrarStorage.sol');

const {
    GAS_LIMIT,
    REGISTRAR_FEES,
    HANDLENAME_FEES,
    UNREGISTERED_REGISTRAR,
    VALID_REGISTRAR_NAME_1,
    VALID_REGISTRAR_NAME_2,
    UNREGISTERED_HANDLENAME,
    VALID_HANDLENAME_1,
    VALID_HANDLENAME_2,
    INDEX_1,
    INDEX_2,
    INVALID_INDEX_1,
    COIN_NAME_1,
    COIN_NAME_2,
    COIN_ALIAS_1,
    OTHER_COIN_ADDRESS_1,
    OTHER_COIN_ADDRESS_2,
    INVALID_OTHER_COIN_ADDRESS_1,
    BLANK_ADDRESS,
} = require('./constants');

contract('Registrar Storage Contract ', async (accounts) => {

    it('Should deploy the Main Contract with the constructor.', async () => {
        this.mainContract = await RegistrarMain.new(accounts[1], { gas: GAS_LIMIT });
    });

    it('Should return an error when try to deploy the Storage Contract without the constructor.', async () => {
        try {
            this.storageContract = await RegistrarStorage.new();
        } catch (error) {
            let error_ = 'Invalid number of parameters for "undefined". Got 0 expected 1!';
            assert.equal(error.message, error_);            
        }
    });

    it('Should deploy the Storage Contract with the constructor.', async () => {
        this.storageContract = await RegistrarStorage.new(this.mainContract.address);
    });

    it('Should correctly return the Storage contract owner address.', async () => {
        let contractOwner = await this.storageContract.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should correctly return the Main contract address.', async () => {
        let mainContract = await this.storageContract.mainContract.call();
        assert.equal(mainContract, this.mainContract.address);
    });

    it('Should return an error when trying to upgrade main contract address from non-main contract.', async () => {
        try {
            await this.storageContract.upgradeMainContractAddress(accounts[9], { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to register a Registrar by non-main Contract.', async () => {
        try {
            await this.storageContract.registerRegistrar(accounts[2], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to update Registrar by non-main Contract.', async () => {
        try {
            await this.storageContract.updateRegistrar(accounts[2], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when an unregistered registrar name is queried for it\'s address.', async () => {
        try {
            await this.storageContract.resolveRegistrarFromHandleNameString(UNREGISTERED_REGISTRAR);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : Ragistrar is not yet registered for this handle name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should get the address of a Registrar from Registrar name.', async () => {

        await this.mainContract.setRegistrarStorageContract(this.storageContract.address, { from: accounts[0] });

        await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        let registrarAddress = await this.storageContract.resolveRegistrarFromHandleNameString.call(VALID_REGISTRAR_NAME_1);
        assert.equal(registrarAddress, accounts[2]);
    });

    it('Should return an error when an unregistered registrar address is queried for it\'s handlename.', async () => {
        try {
            await this.storageContract.resolveRegistrarFromaddress(accounts[3]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar not registered';
            assert.equal(error.message, error_);
        }
    });

    it('Should resolve the registrar handlename from the address.', async () => {
        let registrarHandlename = await this.storageContract.resolveRegistrarFromaddress(accounts[2]);
        assert.equal(registrarHandlename, VALID_REGISTRAR_NAME_1);
    });

    it('Should return error when trying to set Handlename by non-main contract.', async () => {
        try {
            await this.storageContract.setAddressAndHandleName(accounts[5], accounts[2], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when trying to update Handlename by non-main contract.', async () => {
        try {
            await this.storageContract.updateHandleName(accounts[5], accounts[2], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when trying to transfer handlename by non-auction contract.', async () => {
        try {
            await this.storageContract.transferhandleName(VALID_HANDLENAME_1, accounts[5], accounts[2], { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return error when trying to resolve address by handlename which is not registered.', async () => {
        try {
            await this.storageContract.resolveHandleNameString(UNREGISTERED_HANDLENAME);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : user is not yet registered for this handle name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return the address by handlename.', async () => {

        await this.mainContract.addHandleName(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

        let userAddress = await this.storageContract.resolveHandleNameString(VALID_HANDLENAME_1);
        assert.equal(userAddress, accounts[5]);
    });

    it('Should return error when trying to set Auction contract address from non-contract owner.', async () => {
        try {
            await this.storageContract.setAuctionContract(accounts[6], {from: accounts[5]});
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set the Auction contract address.', async () => {
        await this.storageContract.setAuctionContract(accounts[6]);
    });

    it('Should return an address from handlename.', async () => {
        let address = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_HANDLENAME_1);
        assert.equal(address, accounts[5]);
    });

    it('Should return a Registrar address from name.', async () => {
        let address = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_REGISTRAR_NAME_1);
        assert.equal(address, accounts[2]);
    });

    it('Should return a blank address if handlename is not registered.', async () => {
        let address = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_HANDLENAME_2);
        assert.equal(address, BLANK_ADDRESS);
    });

    it('Should get a blank Registrar address if registrar name is not registered.', async () => {
        let address = await this.storageContract.resolveHandleNameOrRegistrarName(VALID_REGISTRAR_NAME_2);
        assert.equal(address, BLANK_ADDRESS);
    });

    it('Should return true if a handlename and address pair is registered.', async () => {
        let isHandlenameRegistered = await this.storageContract.isHandleNameTakenByAddress(VALID_HANDLENAME_1, accounts[5]);
        assert.equal(isHandlenameRegistered, true);
    });

    it('Should return false if a handlename and address pair is not registered.', async () => {
        let isHandlenameRegistered = await this.storageContract.isHandleNameTakenByAddress(VALID_HANDLENAME_2, accounts[5]);
        assert.equal(isHandlenameRegistered, false);
    });

    it('Should return false if a handlename and address pair is not registered.', async () => {
        let isHandlenameRegistered = await this.storageContract.isHandleNameTakenByAddress(VALID_HANDLENAME_1, accounts[8]);
        assert.equal(isHandlenameRegistered, false);
    });

    it('Should return false if a handlename and address pair is not registered.', async () => {
        let isHandlenameRegistered = await this.storageContract.isHandleNameTakenByAddress(VALID_HANDLENAME_2, accounts[8]);
        assert.equal(isHandlenameRegistered, false);
    });

    it('Should return an error when checking auction status from non-auction contract.', async () => {
        try {
            await this.storageContract.auctionInProcess(accounts[5], VALID_HANDLENAME_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to add coin from non-main contract.', async () => {
        try {
            await this.storageContract.addCoin(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, accounts[2], {from: accounts[2], gas: GAS_LIMIT});
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should get the blockchain alias name by index.', async () => {

        await this.mainContract.addCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });

        let coinAlias = await this.storageContract.getCoinAliasNameByIndex(INDEX_1);
        assert.equal(coinAlias.toString(), COIN_ALIAS_1);
    });

    it('Should return an error when passing invalid index to get the coin alias.', async () => {
        try {
            await this.storageContract.getCoinAliasNameByIndex(INVALID_INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return true if a particular coin name is registered.', async () => {
        let isCoinRegistered = await this.storageContract.isCoinRegistered(COIN_NAME_1);
        assert.equal(isCoinRegistered, true);
    });

    it('Should return false if a particular coin name is not registered.', async () => {
        let isCoinRegistered = await this.storageContract.isCoinRegistered(COIN_NAME_2);
        assert.equal(isCoinRegistered, false);
    });

    it('Should return an error when trying to register coin address from non-main contract.', async () => {
        try {
            await this.storageContract.registerCoinAddress(accounts[5], INDEX_1, OTHER_COIN_ADDRESS_1, accounts[2], { from: accounts[2], gas: GAS_LIMIT});
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to update coin address from non-main contract.', async () => {
        try {
            await this.storageContract.updateCoinAddress(accounts[3], INDEX_1, OTHER_COIN_ADDRESS_2, accounts[2], { from: accounts[2], gas: GAS_LIMIT});
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve coin address by passing invalid index and registered handlename.', async () => {
        try {
            await this.storageContract.resolveCoinAddress(VALID_HANDLENAME_1, INVALID_INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve coin address by passing valid index and unregistered handlename.', async () => {
        try {
            await this.storageContract.resolveCoinAddress(UNREGISTERED_HANDLENAME, INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve coin address by passing invalid index and unregistered handlename.', async () => {
        try {
            await this.storageContract.resolveCoinAddress(UNREGISTERED_HANDLENAME, INVALID_INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully resolve other address using Handlename.', async () => {

        await this.mainContract.registerCoinAddress(accounts[5], INDEX_1, OTHER_COIN_ADDRESS_1, {from: accounts[2], gas: GAS_LIMIT});

        let coinAddress = await this.storageContract.resolveCoinAddress(VALID_HANDLENAME_1, INDEX_1);
        assert.equal(coinAddress.toString(), OTHER_COIN_ADDRESS_1);
    });

    it('Should return an error when trying to resolve handlename by passing registered address and invalid index.', async () => {
        try {
            await this.storageContract.resolveCoinHandleName(OTHER_COIN_ADDRESS_1, INVALID_INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve handlename by passing invalid address and valid index.', async () => {
        try {
            await this.storageContract.resolveCoinHandleName(INVALID_OTHER_COIN_ADDRESS_1, INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve handlename by passing invalid address and valid index.', async () => {
        try {
            await this.storageContract.resolveCoinHandleName(INVALID_OTHER_COIN_ADDRESS_1, INVALID_INDEX_1 );
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully resolve HandleName using coin address and index.', async () => {
        let handlename = await this.storageContract.resolveCoinHandleName(OTHER_COIN_ADDRESS_1, INDEX_1);
        assert.equal(handlename.toString(), VALID_HANDLENAME_1);
    });

    it('Should return an error when resolving Handlename from address which is not registered.', async () => {
        try {
            await this.storageContract.resolveHandleName(accounts[3]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Not a valid user address';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully return user Handlename from address.', async () => {
        let handlename = await this.storageContract.resolveHandleName(accounts[5]);
        assert.equal(handlename.toString(), VALID_HANDLENAME_1);
    });

    it('Should get the total number of registered Registrars.', async () => {
        let totalRegistrars = await this.storageContract.totalRegistrars.call();
        assert.equal(parseInt(totalRegistrars), 1);
    });

    it('Should correctly return the Auction contract address.', async () => {
        let auctionContractAddress = await this.storageContract.auctionContractAddress.call();
        assert.equal(auctionContractAddress, accounts[6]);
    });

    it('Should successfully return the Registrar updation count.', async () => {
        let updateRegistrarCount = await this.storageContract.updateRegistrarCount.call(accounts[2]);
        assert.equal(parseInt(updateRegistrarCount), 0); 
    });

    it('Should get the Registrar Info by Registrar address.', async () => {
        let registrar = await this.storageContract.Registrars.call(accounts[2]);
        assert.equal(registrar.isRegisteredRegistrar, true);
        assert.equal(registrar.registrarName, VALID_REGISTRAR_NAME_1);
        assert.equal(registrar.registarAddress, accounts[2]);
    });

    it('Should return true if the address provided is a registered registrar.', async () => {
        let isValidRegistrar = await this.storageContract.validRegistrar.call(accounts[2]);
        assert.equal(isValidRegistrar, true); 
    });

    it('Should return false if the address provided is not a registered registrar.', async () => {
        let isValidRegistrar = await this.storageContract.validRegistrar.call(accounts[8]);
        assert.equal(isValidRegistrar, false); 
    });

    it('Should return true if the index number for a particular coin address is taken.', async () => {
        let isIndexTaken = await this.storageContract.indexTaken(INDEX_1);
        assert.equal(isIndexTaken, true);
    });

    it('Should return false if the index number for a particular coin address is not taken.', async () => {
        let isIndexTaken = await this.storageContract.indexTaken(INDEX_2);
        assert.equal(isIndexTaken, false);
    });

    it('Should get the total Handlenames registered at Storage contract.', async () => {
        let totalHandlenamesRegistered = await this.storageContract.totalHandleNameRegistered();
        assert.equal(parseInt(totalHandlenamesRegistered), 1);
    });

    it('Should return the update count of a particular Handlename.', async () => {
        let updateCount = await this.storageContract.updateCount(accounts[5]);
        assert.equal(parseInt(updateCount), 0);
    });

    it('Should return false when an address is passed which is already registered.', async () => {
        let isAddressRegistered = await this.storageContract.validHandleNameAddress(accounts[7]);
        assert.equal(isAddressRegistered, false);
    });

    it('Should check if Handlename user address already registered or not.', async () => {
        let isAddressRegistered = await this.storageContract.validHandleNameAddress(accounts[5]);
        assert.equal(isAddressRegistered, true);
    });

    it('Should get a coin name By index.', async () => {
        let coinName = await this.storageContract.indexOfCoin(INDEX_1);
        assert.equal(coinName.toString(), COIN_NAME_1);
    });

    it('Should return false if the auction has not started for handlename of the address passed.', async () => {
        let isAuctionActive = await this.storageContract.auctionProcess(accounts[5]);
        assert.equal(isAuctionActive, false);
    });

    it('Should get the address by Handlename after update.', async () => {

        await this.mainContract.updateHandleNameOfUser(accounts[5], VALID_HANDLENAME_2, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

        let oldHandlename = await this.storageContract.OldHandles.call(accounts[5], 0);
        assert.equal(Web3Utils.hexToUtf8(oldHandlename), VALID_HANDLENAME_1);
    });

    it('Should get the Registrar address by name after update.', async () => {

        await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_2, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        let registrarName = await this.storageContract.OldRegistrarAddressToNames.call(accounts[2], 0);
        assert.equal(Web3Utils.hexToUtf8(registrarName), VALID_REGISTRAR_NAME_1);
    });

})