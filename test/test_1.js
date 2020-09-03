const RegistrarStorage = artifacts.require('RegistrarStorage.sol');
const RegistrarMain = artifacts.require('RegistrarMain.sol');
const Auction = artifacts.require('Auction.sol');

const { increaseTimeTo, duration } = require('openzeppelin-solidity/test/helpers/increaseTime');
const { latestTime } = require('openzeppelin-solidity/test/helpers/latestTime');

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var Web3Utils = require('web3-utils');
contract('Inblox Contract', async (accounts) => {

    it('Should correctly initialize constructor values of RegistrarMain Contract', async () => {
        this.tokenhold = await RegistrarMain.new(accounts[1], { gas: 600000000 });
    });

    it('Should not be able to set a fees for registrar by non owner', async () => {
        try {
            let registrationFees = 1 * 10 ** 18;
            await this.tokenhold.setRegistrarFees(Web3Utils.toHex(registrationFees), { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set a fees for registrar', async () => {
        let registrationFees = 1 * 10 ** 18;
        await this.tokenhold.setRegistrarFees(Web3Utils.toHex(registrationFees), { from: accounts[0] });
    });

    it('Should check a fees for registrar', async () => {
        let registrarFees = await this.tokenhold.registrarFees.call();
        assert.equal(registrarFees.toString() / 10 ** 18, 1);
    });

    it('Should not set a fees for Handle Name', async () => {
        try {
            let registrationFees = 1 * 10 ** 18;
            await this.tokenhold.setHandleNameFees(Web3Utils.toHex(registrationFees), { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set a fees for Handle Name', async () => {
        let registrationFees = 1 * 10 ** 18;
        await this.tokenhold.setHandleNameFees(Web3Utils.toHex(registrationFees), { from: accounts[0] });
    });

    it('Should check a fees for handle name', async () => {
        let registrarFees = await this.tokenhold.userHandleNameRegFees.call();
        assert.equal(registrarFees.toString() / 10 ** 18, 1);
    });

    it('Should check a contract owner', async () => {
        let contractOwner = await this.tokenhold.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should check a wallet address', async () => {
        let walletAddress = await this.tokenhold.walletAddress.call();
        assert.equal(walletAddress, accounts[1]);
    });

    it('Should correctly initialize constructor values of Registrar Storage Contract', async () => {
        this.storage = await RegistrarStorage.new(this.tokenhold.address);
    });

    it('Should not set storage contract address', async () => {
        try {
            await this.tokenhold.setRegistrarStorageContract(this.storage.address, { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set storage contract address', async () => {
        await this.tokenhold.setRegistrarStorageContract(this.storage.address, { from: accounts[0] });
    });

    it('Should check a storage contract owner address', async () => {
        let contractOwner = await this.storage.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should check a storage contract address', async () => {
        let registrarStorageContractAddress = await this.tokenhold.registrarStorageContractAddress.call();
        assert.equal(registrarStorageContractAddress, this.storage.address);
    });

    it('Should not be able to set registrar at main contract with name Length lesser then 4', async () => {
        try {
            await this.tokenhold.addRegistrar('QUI', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to set registrar at main contract with name Length higher then 16', async () => {
        try {
            await this.tokenhold.addRegistrar('QUILLHASHABHISHEKSHARMA', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to set registrar at storage contract by non main contract', async () => {
        try {
            await this.storage.registerRegistrar(accounts[2], 'abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set registrar at main contract', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addRegistrar('abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should not be able to set registrar at main contract with same name in capitals', async () => {
        try {
            await this.tokenhold.addRegistrar('ABHISHEK', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to set registrar at main contract with same name', async () => {
        try {
            await this.tokenhold.addRegistrar('abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to set registrar at main contract, by already registered registrar ', async () => {
        try {
            await this.tokenhold.addRegistrar('abhisheksharma', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set registrar at main contract', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addRegistrar('abhisheksharma', { from: accounts[3], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should not be able to set registrar at main contract with same name', async () => {
        try {
            await this.tokenhold.addRegistrar('ABHISHEKSHARMA', { from: accounts[4], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar with the same name -- Reason given: Ragistrar with the same name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to set registrar at main contract with same name in lower letters', async () => {
        try {
            await this.tokenhold.addRegistrar('abhisheksharma', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to set registrar at main contract, different name, by already registered registrar ', async () => {
        try {
            await this.tokenhold.addRegistrar('abhisheksharmaaas', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should get a address of a registrar from address', async () => {
        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhishek');
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get a total registrar registered', async () => {
        let totalRegistrars = await this.storage.totalRegistrars.call();
        assert.equal(totalRegistrars, 2);
    });

    it('Should get a registrar Info by Registrar Address', async () => {
        let Registrars = await this.storage.Registrars.call(accounts[2]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, 'abhishek');
        assert.equal(Registrars.registarAddress, accounts[2]);
    });

    it('Should get a registrar Info by Registrar Address for account 3', async () => {
        let Registrars = await this.storage.Registrars.call(accounts[3]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, 'abhisheksharma');
        assert.equal(Registrars.registarAddress, accounts[3]);
    });

    it('Should get a registrar name by address', async () => {
        let resolveRegistrarFromaddress = await this.storage.resolveRegistrarFromaddress(accounts[2]);
        assert.equal(resolveRegistrarFromaddress, 'abhishek');
    });

    it('Should not get a registrar name by address when registrar is not valid', async () => {
        try {
            await this.storage.resolveRegistrarFromaddress(accounts[5]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar not registered';
            assert.equal(error.message, error_);
        }
    });

    it('Should Not update registrar at main contract, when Ragistrar not registered', async () => {
        try {
            await this.tokenhold.updateRegistrar('abhisheks', { from: accounts[0], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar should register first -- Reason given: Ragistrar should register first.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not update a registrar at main contract when length is less then 4', async () => {
        try {
            await this.tokenhold.updateRegistrar('abh', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should update registrar at main contract', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.updateRegistrar('abhisheks', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should get a address of a registrar from address', async () => {
        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhisheks');
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get a registrar Info by Registrar Address for account 2', async () => {
        let Registrars = await this.storage.Registrars.call(accounts[2]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, 'abhisheks');
        assert.equal(Registrars.registarAddress, accounts[2]);
    });


    it('Should get a address of a registrar from address after update', async () => {
        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhisheks');
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get a address of a registrar from address after update', async () => {
        try {
            await this.storage.resolveRegistrarFromHandleNameString.call('abhishek');
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Resolver : Ragistrar is not yet registered for this handle name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set registrar at main contract with name that was taken previously', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addRegistrar('abhishek', { from: accounts[4], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should get a registrar Info by Registrar Address for account 4', async () => {

        let Registrars = await this.storage.Registrars.call(accounts[4]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, 'abhishek');
        assert.equal(Registrars.registarAddress, accounts[4]);

    });

    it('Should get a address of a registrar from address', async () => {

        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhishek');
        assert.equal(registrarName, accounts[4]);
    });

    it('Should get a total registrar registered', async () => {

        let totalRegistrars = await this.storage.totalRegistrars.call();
        assert.equal(totalRegistrars, 3);
    });

    it('Should get a update registrar count', async () => {

        let updateRegistrarCount = await this.storage.updateRegistrarCount.call(accounts[2]);
        assert.equal(updateRegistrarCount.toNumber(), 1);

    });

    it('Should get a update registrar count of account 3', async () => {

        let updateRegistrarCount = await this.storage.updateRegistrarCount.call(accounts[3]);
        assert.equal(updateRegistrarCount.toNumber(), 0);
    });

    it('Should not set handle name at main contract by valid ragistrar when caller is not a main contract', async () => {

        try {
            await this.storage.setAddressAndHandleName(accounts[5], accounts[2], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }

    });


    it('Should check if handle name user address already registered or not', async () => {

        let validHandleName = await this.storage.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleName, false);

    });

    it('Should not be able to set handle name at main contract by Registrar when contain special charcters', async () => {

        try {

            await this.tokenhold.addHandleName(accounts[5], 'absana_@#.', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });

        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed -- Reason given: only alphanumeric allowed.';
            assert.equal(error.message, error_);
        }

    });

    it('Should set handle name at main contract by Registrar', async () => {

        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addHandleName(accounts[5], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);

    });

    it('Should check if handle name user address already registered or not', async () => {

        let validHandleName = await this.storage.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleName, true);

    });

    it('Should not set handle name at main contract by Registrar again', async () => {



        try {
            await this.tokenhold.addHandleName(accounts[5], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }

    });

    it('Should not set handle name at main contract by valid ragistrar, where name already registerd by Registrar', async () => {

        try {
            await this.tokenhold.addHandleName(accounts[5], 'abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registrar with same name -- Reason given: registrar with same name.';
            assert.equal(error.message, error_);
        }

    });

    it('Should get a handle name by address', async () => {

        let resolveHandleNameString = await this.storage.resolveHandleNameString('absana');
        assert.equal(resolveHandleNameString, accounts[5]);
    });

    it('Should get a handle name by address without error', async () => {

        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('absana');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[5]);
    });

    it('Should get a handle name by address without error for ragistrar', async () => {

        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('abhishek');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[4]);
    });

    it('Should get a handle name by address without error for not registered Name', async () => {

        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('ABHI');
        assert.equal(resolveHandleNameOrRegistrarName, 0x0000000000000000000000000000000000000000);
    });

    it('Should not be able update registrar at storage contract directly', async () => {

        try {
            await this.storage.updateRegistrar(accounts[5], 'absanasa', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }

    });

    it('Should not be able update registrar at main contract without value', async () => {

        try {
            await this.tokenhold.updateHandleNameOfUser(accounts[5], 'absanasa', { from: accounts[2], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registration fees not matched -- Reason given: registration fees not matched.';
            assert.equal(error.message, error_);
        }

    });

    it('Should update registrar at main contract', async () => {

        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.updateHandleNameOfUser(accounts[5], 'absanasa', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);

    });

    it('Should not set handle name at main contract by Registrar the name previously taken', async () => {

        try {
            await this.tokenhold.addHandleName(accounts[8], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handl name is already used once, not available now -- Reason given: Handl name is already used once, not available now.';
            assert.equal(error.message, error_);
        }
    });

    it('Should get a handle name by address after update', async () => {

        let resolveHandleNameString = await this.storage.resolveHandleNameString('absanasa');
        assert.equal(resolveHandleNameString, accounts[5]);
    });

    it('Should get a handle name by address without error after update', async () => {

        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('absanasa');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[5]);
    });

    it('Should get a total Handle Name Registered at storage contract', async () => {

        let totalHandleNameRegistered = await this.storage.totalHandleNameRegistered();
        assert.equal(totalHandleNameRegistered.toNumber(), 2);
    });

    it('Should correctly initialize constructor values of Auction Contract', async () => {

        this.Auction = await Auction.new(this.storage.address, { gas: 600000000 });

    });

    it('Should check the storage contract address', async () => {

        let contractAddress = await this.Auction.registrarStorageContractAddress.call({ gas: 600000000 });
        assert.equal(contractAddress, this.storage.address);

    });

    it('Should check the contract Owner of auction', async () => {

        let contractOwner = await this.Auction.contractOwner.call({ gas: 600000000 });
        assert.equal(contractOwner, accounts[0]);

    });

    it('Should check if auction active or not by this address', async () => {

        let alreadyActiveAuction = await this.Auction.alreadyActiveAuction.call(accounts[2], { gas: 600000000 });
        assert.equal(alreadyActiveAuction, false);

    });

    it('Should set the auction contracts address at storage contract', async () => {


        try {
            await this.storage.setAuctionContract(this.Auction.address, { from: accounts[1], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set the auction contracts address at storage contract', async () => {

        await this.storage.setAuctionContract(this.Auction.address, { gas: 600000000 });

    });

    it('Should not start the Auction of accounts[5] handle name', async () => {


        try {
            await this.Auction.auctionHandlename('absanaSA', 865400 * 30, { from: accounts[6], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Auction time should be in between 330 to 7776000 seconds -- Reason given: Auction time should be in between 330 to 7776000 seconds.';
            assert.equal(error.message, error_);
        }
    });

    it('Should start the Auction of accounts[5] handle name', async () => {

        await this.Auction.auctionHandlename('absanaSA', 86400 * 30, { from: accounts[5], gas: 600000000 });

    });

    it('Should check auction data of auctioner ', async () => {

        let auctiondata = await this.Auction.auction.call(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[5]);
        assert.equal(auctiondata.handleName, 'absanasa');

    });

    it('Should check handle name of address is in auction or not', async () => {

        let auctionProcess = await this.storage.auctionProcess.call(accounts[5], { gas: 600000000 });
        assert.equal(auctionProcess, true);

    });

    it('Should not start the biding process without sending ether', async () => {

        try {

            await this.Auction.bidForHandleName('absanaSA', { from: accounts[6], gas: 600000000 });

        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert bid amount should be higher then previous bid -- Reason given: bid amount should be higher then previous bid.';
            assert.equal(error.message, error_);
        }
    });

    it('Should start the biding process', async () => {

        await this.Auction.bidForHandleName('absanaSA', { from: accounts[6], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });

    });

    it('Should check auction data of auctioner ', async () => {

        let auctiondata = await this.Auction.auction.call(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[5]);
        assert.equal(auctiondata.handleName, 'absanasa');
        assert.equal(auctiondata.higestBidderAddress, accounts[6]);
        assert.equal(auctiondata.totalBids, 1);
        assert.equal(auctiondata.totalBidders, 1);
        assert.equal(auctiondata.highestBid.toString() / 10 ** 18, 1);
    });

    it('Should check auction data of auctioner, array of auctioners ', async () => {

        let auctiondata = await this.Auction.arrayOfbidders(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata[0], accounts[6]);
    });

    it('Should check auction data of auctioner, getBidRate of bidder ', async () => {

        let auctiondata = await this.Auction.getBidRate(accounts[5], accounts[6], { gas: 600000000 });
        assert.equal(auctiondata.toString(), 1 * 10 ** 18);
    });

    it('Should start the biding process by accounts[7]', async () => {

        await this.Auction.bidForHandleName('absanaSA', { from: accounts[7], value: Web3Utils.toWei("2", "ether"), gas: 600000000 });

    });

    it('Should check auction data of auctioner  by accounts[7]', async () => {

        let auctiondata = await this.Auction.auction.call(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[5]);
        assert.equal(auctiondata.handleName, 'absanasa');
        assert.equal(auctiondata.higestBidderAddress, accounts[7]);
        assert.equal(auctiondata.totalBids, 2);
        assert.equal(auctiondata.totalBidders, 2);
        assert.equal(auctiondata.highestBid.toString() / 10 ** 18, 2);
    });

    it('Should check auction data of auctioner, array of auctioners ', async () => {

        let auctiondata = await this.Auction.arrayOfbidders(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata[0], accounts[6]);
        assert.equal(auctiondata[1], accounts[7]);
    });

    it('Should check auction data of auctioner, getBidRate of bidder ', async () => {

        let auctiondata = await this.Auction.getBidRate(accounts[5], accounts[7], { gas: 600000000 });
        assert.equal(auctiondata.toString(), 2 * 10 ** 18);
    });


    it('Should return the bids of all bidders other than winner ', async () => {

        this.openingTime = (await latestTime());
        await increaseTimeTo(this.openingTime + duration.seconds(2678400));


        let walletBalanceInitially = await web3.eth.getBalance(accounts[6]);

        await this.Auction.refundOtherBidders({ from: accounts[5], gas: 600000000 });

        let walletBalanceLater = await web3.eth.getBalance(accounts[6]);
        let updateBalance = walletBalanceInitially.toNumber() + 1 * 10 ** 18;
        assert.equal(walletBalanceLater.toNumber(), updateBalance);
    });

    it('Should not transfer the handle name to winner and highest bid to auctioner ', async () => {


        try {

            await this.Auction.transferHandleNameToWinner({ from: accounts[2], gas: 600000000 });

        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert bids are not yet refunded -- Reason given: bids are not yet refunded.';
            assert.equal(error.message, error_);
        }


    });


    it('Should transfer the handle name to winner and highest bid to auctioner ', async () => {

        await this.Auction.transferHandleNameToWinner({ from: accounts[5], gas: 600000000 });

    });

    it('Should get a handle name by address after update', async () => {

        let resolveHandleNameString = await this.storage.resolveHandleNameString('absanasa');
        assert.equal(resolveHandleNameString, accounts[7]);
    });

    it('Should get a handle name by address without error after update', async () => {

        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('absanasa');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[7]);
    });

    it('Should transfer the handle name directly to another account', async () => {

        await this.Auction.directlyTransferHandleName('absanasa', accounts[9], { from: accounts[7], gas: 600000000 });

    });

    it('Should get a handle name by address after update', async () => {

        let resolveHandleNameString = await this.storage.resolveHandleNameString('absanasa');
        assert.equal(resolveHandleNameString, accounts[9]);
    });

    it('Should check if blockchain index taken or note before adding', async () => {

        let indexTaken = await this.storage.indexTaken(1);
        assert.equal(indexTaken, false);
    });

    it('should add other Blockchain for resolving', async () => {

        await this.tokenhold.addCoins(1, 'BITCOIN', 'BTC', { from: accounts[2], gas: 600000000 });

    });

    it('Should check if blockchain index taken or note', async () => {

        let indexTaken = await this.storage.indexTaken(1);
        assert.equal(indexTaken, true);
    });

    it('Should get a Blockchain Name By Index', async () => {

        let indexOfCoin = await this.storage.indexOfCoin(1);
        assert.equal(indexOfCoin.toString(), 'bitcoin');
    });

    it('Should get a Blockchain alias Name By Index', async () => {

        let getBlockchainAliasNameByIndex = await this.storage.getCoinAliasNameByIndex(1);
        assert.equal(getBlockchainAliasNameByIndex.toString(), 'btc');
    });

    it('Should check if Blockchain Registered or not by blockchain name', async () => {

        let isBlockchainRegistered = await this.storage.isCoinRegistered('bitcoin');
        assert.equal(isBlockchainRegistered, true);
    });

    it('should not be able to register new blockchain at same index that is used', async () => {

        try {
            await this.tokenhold.addCoins(1, 'BITCOINS', 'BTCS', { from: accounts[0], gas: 600000000 });

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('should not be able to register new blockchain by same name', async () => {


        try {

            await this.tokenhold.addCoins(2, 'BITCOIN', 'BTCS', { from: accounts[0], gas: 600000000 });

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('should not be able to register new blockchain by same Alias name', async () => {

        try {

            await this.tokenhold.addCoins(2, 'BITCOINSS', 'BTC', { from: accounts[2], gas: 600000000 });

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('should not be able to add other address to Blockchain for resolving who doesnt have handle name', async () => {

        try {

            await this.tokenhold.registerCoinAddress(accounts[9], 1, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea', { from: accounts[2], gas: 600000000 });

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert Storage contract fail -- Reason given: Storage contract fail.';
            assert.equal(error.message, error_);
        }
    });

    it('should not be able to add other address to Blockchain for resolving by invalid index', async () => {

        try {

            await this.tokenhold.registerCoinAddress(accounts[8], 0, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea', { from: accounts[2], gas: 600000000 });

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('should add other address to Blockchain for resolving', async () => {

        await this.tokenhold.registerCoinAddress(accounts[7], 1, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea', { from: accounts[2], gas: 600000000 });

    });

    it('Should not be able to check by invalid index', async () => {

        try {

            await this.storage.resolveCoinAddress('absana', 0);

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to check by invalid user name', async () => {


        try {

            await this.storage.resolveCoinAddress('absanasasa', 0);

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should check if other address resolve', async () => {

        let resolveCoinAddress = await this.storage.resolveCoinAddress('absanasa', 1);
        assert.equal(resolveCoinAddress.toString(), '3hqh1qgaqnwppbrvygjnrxnejcukd4e6ea');
    });

    it('should updtae other address to Blockchain for resolving', async () => {

        await this.tokenhold.updateCoinAddress(accounts[7], 1, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ep', { from: accounts[2], gas: 600000000 });

    });

    it('Should check if other address resolve', async () => {

        let resolveCoinAddress = await this.storage.resolveCoinAddress('absanasa', 1);
        assert.equal(resolveCoinAddress.toString(), '3hqh1qgaqnwppbrvygjnrxnejcukd4e6ep');
    });
    it('Should not be able to check by invalid index', async () => {


        try {

            await this.storage.resolveCoinHandleName('3hqh1qgaqnwppbrvygjnrxnejcukd4e6ea', 0);

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to check by invalid address', async () => {


        try {

            await this.storage.resolveCoinHandleName('3vygjnrxnejcukd4e6ea', 1);

        } catch (error) {

            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should check if resolve Other HandleName', async () => {

        let resolveCoinHandleName = await this.storage.resolveCoinHandleName('3hqh1qgaqnwppbrvygjnrxnejcukd4e6ea', 1);
        assert.equal(resolveCoinHandleName.toString(), 'absanasa');
    });

    it('Should update registrar at main contract second time', async () => {

        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.updateRegistrar('abhi21094', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);

    });

    it('Should not update registrar at main contract third time', async () => {

        try {
            await this.tokenhold.updateRegistrar('abhi21094', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert new name is already taken -- Reason given: new name is already taken.';
            assert.equal(error.message, error_);
        }

    });

    it('Should check Old Registrar Address To Names details', async () => {

        let resolveCoinHandleName = await this.storage.OldRegistrarAddressToNames(accounts[2], 0);
        let resolveCoinHandleName1 = await this.storage.OldRegistrarAddressToNames(accounts[2], 1);
        console.log(resolveCoinHandleName);
        console.log(resolveCoinHandleName1);
    });

    it('Should check Old Handles details', async () => {

        let resolveCoinHandleName = await this.storage.OldHandles(accounts[5], 1);
        let resolveCoinHandleName1 = await this.storage.OldHandles(accounts[5], 2);
        console.log(resolveCoinHandleName);
        console.log(resolveCoinHandleName1);

    });

    it('Should not check user handle name from address length more then actual address length', async () => {

        let resolveHandleName = await this.storage.resolveHandleName('0x0906aF095470F7Dbf6eB0ff698F9f576AFA961BAA');
        assert.equal(resolveHandleName.toString(), 'absanasa');
    });

    it('Should check user handle name from address', async () => {

        let resolveHandleName = await this.storage.resolveHandleName(accounts[9]);
        assert.equal(resolveHandleName.toString(), 'absanasa');
    });

    it('Should not check user handle name from address length less then actual address length', async () => {

        let resolveHandleName = await this.storage.resolveHandleName('0x0906aF095470F7Dbf6eB0ff698F9f576AFA961B');
        assert.equal(resolveHandleName.toString(), 'absanasa');
    });

    it('Should not check user handle name from address(0) ', async () => {

        let resolveHandleName = await this.storage.resolveHandleName(accounts[9]);
        assert.equal(resolveHandleName.toString(), 'absanasa');
    });

    it('Should not check user handle name from address do not have handle name', async () => {
        try {
            await this.storage.resolveHandleName(accounts[2]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Not a valid user address';
            assert.equal(error.message, error_);
        }
    });

    it('Should check the valid handle name address', async () => {
        let validHandleNameAddress = await this.storage.validHandleNameAddress(accounts[9]);
        assert.equal(validHandleNameAddress, true);
    });

    it('Should check the valid handle name address', async () => {
        let validHandleNameAddress = await this.storage.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleNameAddress, false);
    });

})

