var Web3Utils = require('web3-utils');
const truffleAssert = require('truffle-assertions');

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
        let error_ = 'Invalid number of parameters for "undefined". Got 0 expected 1!';
        await truffleAssert.fails(RegistrarStorage.new(), error_);
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
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.upgradeMainContractAddress(accounts[9], { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when trying to register a Registrar by non-main Contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.registerRegistrar(accounts[2], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when trying to update Registrar by non-main Contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.updateRegistrar(accounts[2], VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when an unregistered registrar name is queried for it\'s address.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : Registrar is not yet registered for this SafleID.';
        await truffleAssert.reverts(this.storageContract.resolveRegistrarName(UNREGISTERED_REGISTRAR), error_);
    });

    it('Should get the address of a Registrar from Registrar name.', async () => {

        await this.mainContract.setStorageContract(this.storageContract.address, { from: accounts[0] });

        await this.mainContract.registerRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        let registrarAddress = await this.storageContract.resolveRegistrarName.call(VALID_REGISTRAR_NAME_1);
        assert.equal(registrarAddress, accounts[2]);
    });

    it('Should return empty Registrar name since the address is not registered ', async () => {
        let registrarHandlename = await this.storageContract.Registrars(accounts[3]);
        assert.equal(registrarHandlename.registrarName, "");
    });

    it('Should resolve the registrar handlename from the address.', async () => {
        let registrarHandlename = await this.storageContract.Registrars(accounts[2]);
        assert.equal(registrarHandlename.registrarName, VALID_REGISTRAR_NAME_1);
    });

    it('Should return error when trying to set SafleId by non-main contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.registerSafleId(accounts[5], accounts[2], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when trying to update SafleId by non-main contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.updateSafleId(accounts[5], accounts[2], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT }), error_);
    });

    it('Should return error when trying to transfer SafleId by non-auction contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.transferSafleId(VALID_HANDLENAME_1, accounts[5], accounts[2], { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return error when trying to resolve address by SafleId which is not registered.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : User is not yet registered for this SafleID.';
        await truffleAssert.reverts(this.storageContract.resolveSafleId(UNREGISTERED_HANDLENAME), error_);
    });

    it('Should return the address by SalfeId.', async () => {
        await this.mainContract.registerSafleId(accounts[5], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

        let userAddress = await this.storageContract.resolveSafleId(VALID_HANDLENAME_1);
        assert.equal(userAddress, accounts[5]);
    });

    it('Should return error when trying to set Auction contract address from non-contract owner.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.setAuctionContract(accounts[6], { from: accounts[5] }), error_);
    });

    it('Should set the Auction contract address.', async () => {
        await this.storageContract.setAuctionContract(accounts[6]);
    });

    it('Should return an address from SafleId.', async () => {
        let address = await this.storageContract.resolveSafleId(VALID_HANDLENAME_1);
        assert.equal(address, accounts[5]);
    });

    it('Should return a Registrar address from name.', async () => {
        let address = await this.storageContract.resolveRegistrarName(VALID_REGISTRAR_NAME_1);
        assert.equal(address, accounts[2]);
    });

    it('Should return error if SafleId is not registered.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : User is not yet registered for this SafleID.';
        await truffleAssert.reverts(this.storageContract.resolveSafleId(VALID_HANDLENAME_2), error_);
    });

    it('Should return error if registrar name is not registered.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : Registrar is not yet registered for this SafleID.';
        await truffleAssert.reverts(this.storageContract.resolveRegistrarName(VALID_REGISTRAR_NAME_2), error_);
    });

    /*
    it('Should return true if a registrar name and address pair is registered.', async () => {
        let isHandlenameRegistered = await this.storageContract.isHandleNameTakenByAddress(VALID_HANDLENAME_1, accounts[5]);
        assert.equal(isHandlenameRegistered, true);
    });

    it('Should return false if a SafleId and address pair is not registered.', async () => {
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
    */

    it('Should return an error when checking auction status from non-auction contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.auctionInProcess(accounts[5], VALID_HANDLENAME_1), error_);
    });

    it('Should return an error when trying to add coin from non-main contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.mapCoin(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, accounts[2], { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should get the blockchain alias name by index.', async () => {

        await this.mainContract.mapCoins(INDEX_1, COIN_NAME_1, COIN_ALIAS_1, { from: accounts[2], gas: GAS_LIMIT });

        let coinAlias = await this.storageContract.OtherCoin(INDEX_1);
        assert.equal(coinAlias.aliasName.toString(), COIN_ALIAS_1);
    });

    it('Should return empty alias and data when passing invalid index to get the coin alias.', async () => {
        let cointDetails = await this.storageContract.OtherCoin(INVALID_INDEX_1);
        assert.equal(cointDetails.coinName.toString(), "");
        assert.equal(cointDetails.aliasName.toString(), "");
        assert.isFalse(cointDetails.isIndexMapped);
    });

    /* NO PUBLIC FUNCTION AVAILABLE TO CHECK IF COIN IS REGISTERD OR NOT
    it('Should return true if a particular coin name is registered/mapped.', async () => {
        let isCoinRegistered = await this.storageContract.isCoinMapped(COIN_NAME_1);
        assert.equal(isCoinRegistered, true);
    });

    it('Should return false if a particular coin name is not registered/mapped.', async () => {
        let isCoinRegistered = await this.storageContract.isCoinMapped(COIN_NAME_2);
        assert.equal(isCoinRegistered, false);
    });
    */

    it('Should return an error when trying to register coin address from non-main contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.registerCoinAddress(accounts[5], INDEX_1, OTHER_COIN_ADDRESS_1, accounts[2], { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return an error when trying to update coin address from non-main contract.', async () => {
        var error_ = 'Returned error: VM Exception while processing transaction: revert';
        await truffleAssert.reverts(this.storageContract.updateCoinAddress(accounts[3], INDEX_1, OTHER_COIN_ADDRESS_2, accounts[2], { from: accounts[2], gas: GAS_LIMIT }), error_);
    });

    it('Should return an empty coinAddress string when trying to resolve coin address by passing invalid index and registered handlename.', async () => {
        let _cointAddress = await this.storageContract.idToCoinAddress(VALID_HANDLENAME_1, INVALID_INDEX_1);
        assert.equal(_cointAddress, "")
    });

    it('Should return an empty coinAddress string when trying to resolve coin address by passing valid index and unregistered handlename.', async () => {
        let _cointAddress = await this.storageContract.idToCoinAddress(UNREGISTERED_HANDLENAME, INDEX_1);
        assert.equal(_cointAddress, "")
    });

    it('Should return an  empty coinAddress string when trying to resolve coin address by passing invalid index and unregistered handlename.', async () => {
        let _cointAddress = await this.storageContract.idToCoinAddress(UNREGISTERED_HANDLENAME, INVALID_INDEX_1);
        assert.equal(_cointAddress, "");
    });

    it('Should successfully resolve other address using SafleId.', async () => {

        await this.mainContract.registerCoinAddress(accounts[5], INDEX_1, OTHER_COIN_ADDRESS_1, { from: accounts[2], gas: GAS_LIMIT });

        let coinAddress = await this.storageContract.idToCoinAddress(VALID_HANDLENAME_1, INDEX_1);
        assert.equal(coinAddress.toString(), OTHER_COIN_ADDRESS_1);
    });

    /* NO FUNCTION TO GET SAFLEID FROM COIN ADDRESS AND INDEX
    *
    *
    it('Should return an error when trying to resolve handlename by passing registered address and invalid index.', async () => {
        await truffleAssert.reverts(, error_)
        try {
            await this.storageContract.resolveCoinHandleName(OTHER_COIN_ADDRESS_1, INVALID_INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve handlename by passing invalid address and valid index.', async () => {
     await truffleAssert.reverts(, error_)   
    try {
            await this.storageContract.resolveCoinHandleName(INVALID_OTHER_COIN_ADDRESS_1, INDEX_1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to resolve handlename by passing invalid address and valid index.', async () => {
     await truffleAssert.reverts(, error_)   
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
    */

    it('Should return an emptry String when resolving SafleId from address which is not registered.', async () => {
        let safleId = await this.storageContract.resolveUserAddress(accounts[3]);
        assert.equal(safleId, "")
        var error_ = 'Returned error: VM Exception while processing transaction: revert Not a valid user address';
    });

    it('Should successfully return user SafleId from address.', async () => {
        let handlename = await this.storageContract.resolveUserAddress(accounts[5]);
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
        let updateRegistrarCount = await this.storageContract.totalRegistrarUpdates.call(accounts[2]);
        assert.equal(parseInt(updateRegistrarCount), 0);
    });

    it('Should get the Registrar Info by Registrar address.', async () => {
        let registrar = await this.storageContract.Registrars.call(accounts[2]);
        assert.equal(registrar.isRegisteredRegistrar, true);
        assert.equal(registrar.registrarName, VALID_REGISTRAR_NAME_1);
        assert.equal(registrar.registarAddress, accounts[2]);
    });

    it('Should return true if the address provided is a registered registrar (or any registered address).', async () => {
        let isValidRegistrar = await this.storageContract.isAddressTaken.call(accounts[2]);
        assert.isTrue(isValidRegistrar);
    });

    it('Should return false if the address provided is not a registered registrar (or any registered address).', async () => {
        let isValidRegistrar = await this.storageContract.isAddressTaken.call(accounts[8]);
        assert.isFalse(isValidRegistrar);
    });

    it('Should return true if the index number for a particular coin address is taken.', async () => {
        let isIndexTaken = await this.storageContract.OtherCoin(INDEX_1);
        assert.isTrue(isIndexTaken.isIndexMapped, true);
    });

    it('Should return false if the index number for a particular coin address is not taken.', async () => {
        let isIndexTaken = await this.storageContract.OtherCoin(INDEX_2);
        assert.isFalse(isIndexTaken.isIndexMapped);
    });

    it('Should get the total SafleId registered at Storage contract.', async () => {
        let totalHandlenamesRegistered = await this.storageContract.totalSafleIdRegistered();
        assert.equal(parseInt(totalHandlenamesRegistered), 1);
    });

    it('Should return the update count of a particular SafleId.', async () => {
        let updateCount = await this.storageContract.totalSafleIDCount(accounts[5]);
        assert.equal(parseInt(updateCount), 0);
    });

    it('Should return false when an address is passed which is already registered.', async () => {
        let isAddressRegistered = await this.storageContract.isAddressTaken(accounts[7]);
        assert.isFalse(isAddressRegistered);
    });

    it('Should check if SafleId user address already registered or not.', async () => {
        let isAddressRegistered = await this.storageContract.isAddressTaken(accounts[5]);
        assert.isTrue(isAddressRegistered);
    });

    it('Should get a coin name By index.', async () => {
        let coinDetails = await this.storageContract.OtherCoin(INDEX_1);
        assert.equal(coinDetails.coinName.toString(), COIN_NAME_1);
    });

    it('Should return false if the auction has not started for handlename of the address passed.', async () => {
        let isAuctionActive = await this.storageContract.auctionProcess(accounts[5]);
        assert.isFalse(isAuctionActive);
    });

    it('Should get the address by SafleId after update.', async () => {

        await this.mainContract.updateSafleId(accounts[5], VALID_HANDLENAME_2, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

        let oldHandlename = await this.storageContract.resolveOldSafleIdFromAddress.call(accounts[5], 0);
        assert.equal(Web3Utils.hexToUtf8(oldHandlename), VALID_HANDLENAME_1);
    });

    it('Should get the Registrar address by name after update.', async () => {

        await this.mainContract.updateRegistrar(VALID_REGISTRAR_NAME_2, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        let registrarName = await this.storageContract.resolveOldRegistrarAddress.call(accounts[2], 0);
        assert.equal(Web3Utils.hexToUtf8(registrarName), VALID_REGISTRAR_NAME_1);
    });

})