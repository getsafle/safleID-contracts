const RegistrarStorage = artifacts.require('RegistrarStorage.sol');
const RegistrarMain = artifacts.require('RegistrarMain.sol');
const Auction = artifacts.require('Auction.sol');

const { duration } = require('openzeppelin-solidity/test/helpers/increaseTime');
const { time } = require('@openzeppelin/test-helpers');
const { latestTime } = require('openzeppelin-solidity/test/helpers/latestTime');

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var Web3Utils = require('web3-utils');
contract('Inblox Contract', async (accounts) => {

    it('Should deploy the Main Contract with the constructor.', async () => {
        this.tokenhold = await RegistrarMain.new(accounts[1], { gas: 600000000 });
    });

    it('Should return an error when Registrar registration fees is set by non contract owner.', async () => {
        try {
            let registrationFees = 1 * 10 ** 18;
            await this.tokenhold.setRegistrarFees(Web3Utils.toHex(registrationFees), { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set a fees for registrar.', async () => {
        let registrationFees = 1 * 10 ** 18;
        await this.tokenhold.setRegistrarFees(Web3Utils.toHex(registrationFees), { from: accounts[0] });
    });

    it('Should correctly return the registrar fees.', async () => {
        let registrarFees = await this.tokenhold.registrarFees.call();
        assert.equal(registrarFees.toString() / 10 ** 18, 1);
    });

    it('Should return an error when Registrar Handlename fees is set by non contract owner.', async () => {
        try {
            let registrationFees = 1 * 10 ** 18;
            await this.tokenhold.setHandleNameFees(Web3Utils.toHex(registrationFees), { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should set the fees for Handlename.', async () => {
        let registrationFees = 1 * 10 ** 18;
        await this.tokenhold.setHandleNameFees(Web3Utils.toHex(registrationFees), { from: accounts[0] });
    });

    it('Should check the Handlename fees.', async () => {
        let registrarFees = await this.tokenhold.userHandleNameRegFees.call();
        assert.equal(registrarFees.toString() / 10 ** 18, 1);
    });

    it('Should correctly return the contract owner.', async () => {
        let contractOwner = await this.tokenhold.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should correctly return the wallet address.', async () => {
        let walletAddress = await this.tokenhold.walletAddress.call();
        assert.equal(walletAddress, accounts[1]);
    });

    it('Should deploy the Storage Contract with the constructor.', async () => {
        this.storage = await RegistrarStorage.new(this.tokenhold.address);
    });

    it('Should return an error when storage contract address is set by non contract owner.', async () => {
        try {
            await this.tokenhold.setRegistrarStorageContract(this.storage.address, { from: accounts[1] });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert msg sender is not a contract owner -- Reason given: msg sender is not a contract owner.';
            assert.equal(error.message, error_);
        }
    });

    it('Should correctly set the Storage contract address.', async () => {
        await this.tokenhold.setRegistrarStorageContract(this.storage.address, { from: accounts[0] });
    });

    it('Should correctly return the Storage contract owner address.', async () => {
        let contractOwner = await this.storage.contractOwner.call();
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should correctly return the storage contract address.', async () => {
        let registrarStorageContractAddress = await this.tokenhold.registrarStorageContractAddress.call();
        assert.equal(registrarStorageContractAddress, this.storage.address);
    });

    it('Should return an error when Registrar name length is less than 4.', async () => {
        try {
            await this.tokenhold.addRegistrar('QUI', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar name length is less than 16.', async () => {
        try {
            await this.tokenhold.addRegistrar('QUILLHASHABHISHEKSHARMA', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when registerRegistrar method is called by non Main Contract.', async () => {
        try {
            await this.storage.registerRegistrar(accounts[2], 'abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set Registrar at Main Contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addRegistrar('abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when registrar is set with the same name in upper case characters.', async () => {
        try {
            await this.tokenhold.addRegistrar('ABHISHEK', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when registrar is set with the same name.', async () => {
        try {
            await this.tokenhold.addRegistrar('abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when registrar is registered by an already registered registrar.', async () => {
        try {
            await this.tokenhold.addRegistrar('abhisheksharma', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully register Registrar at Main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addRegistrar('abhisheksharma', { from: accounts[3], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when Registrar is registered with same name at Main contract.', async () => {
        try {
            await this.tokenhold.addRegistrar('ABHISHEKSHARMA', { from: accounts[4], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar with the same name -- Reason given: Ragistrar with the same name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar is registerd with same name in lower case characters.', async () => {
        try {
            await this.tokenhold.addRegistrar('abhisheksharma', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar registered -- Reason given: Ragistrar registered.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when Registrar is set with a different name by an already registered Registrar.', async () => {
        try {
            await this.tokenhold.addRegistrar('abhisheksharmaaas', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should get the address of a Registrar from Registrar name.', async () => {
        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhishek');
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get the total number of registered Registrars.', async () => {
        let totalRegistrars = await this.storage.totalRegistrars.call();
        assert.equal(totalRegistrars, 2);
    });

    it('Should get the Registrar Info by Registrar address.', async () => {
        let Registrars = await this.storage.Registrars.call(accounts[2]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, 'abhishek');
        assert.equal(Registrars.registarAddress, accounts[2]);
    });

    it('Should get the Registrar info by Registrar Address for Account 3.', async () => {
        let Registrars = await this.storage.Registrars.call(accounts[3]);
        assert.equal(Registrars.isRegisteredRegistrar, true);
        assert.equal(Registrars.registrarName, 'abhisheksharma');
        assert.equal(Registrars.registarAddress, accounts[3]);
    });

    it('Should get a Registrar name by address.', async () => {
        let resolveRegistrarFromaddress = await this.storage.resolveRegistrarFromaddress(accounts[2]);
        assert.equal(resolveRegistrarFromaddress, 'abhishek');
    });

    it('Should return an error when querying the infor for non-registered Registrar.', async () => {
        try {
            await this.storage.resolveRegistrarFromaddress(accounts[5]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar not registered';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to update non-registered Registrar.', async () => {
        try {
            await this.tokenhold.updateRegistrar('abhisheks', { from: accounts[0], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Ragistrar should register first -- Reason given: Ragistrar should register first.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when updating a Registrar with length less than 4.', async () => {
        try {
            await this.tokenhold.updateRegistrar('abh', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handlename length should be between 4-16 characters -- Reason given: Handlename length should be between 4-16 characters.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully update Registrar at Main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.updateRegistrar('abhisheks', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should get the address of a Registrar from Registrar name.', async () => {
        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhisheks');
        assert.equal(registrarName, accounts[2]);
    });

    it('Should get the address of a Registrar from address post updating.', async () => {
        let registrarName = await this.storage.resolveRegistrarFromHandleNameString.call('abhisheks');
        assert.equal(registrarName, accounts[2]);
    });

    it('Should set Registrar at Main contract with name that was taken previously.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addRegistrar('abhishek', { from: accounts[4], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should get the Registrar updation count.', async () => {
        let updateRegistrarCount = await this.storage.updateRegistrarCount.call(accounts[2]);
        assert.equal(updateRegistrarCount.toNumber(), 1);
    });

    it('Should not set Handlename at main contract by valid Registrar by non-main contract.', async () => {
        try {
            await this.storage.setAddressAndHandleName(accounts[5], accounts[2], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return false when an address is passed which is already registered.', async () => {
        let validHandleName = await this.storage.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleName, false);
    });

    it('Should return error when registering Handlename which contains special characters.', async () => {
        try {
            await this.tokenhold.addHandleName(accounts[5], 'absana_@#.', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert only alphanumeric allowed -- Reason given: only alphanumeric allowed.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully set Handlename at Main contract by Registrar.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.addHandleName(accounts[5], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should check if Handlename user address already registered or not.', async () => {
        let validHandleName = await this.storage.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleName, true);
    });

    it('Should return an error when Handlename is set at Main contract by Registrar again with same Handlename.', async () => {
        try {
            await this.tokenhold.addHandleName(accounts[5], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to register Handlename same as that of Registrar name.', async () => {
        try {
            await this.tokenhold.addHandleName(accounts[5], 'abhishek', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registrar with same name -- Reason given: registrar with same name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should get a Handlename by address.', async () => {
        let resolveHandleNameString = await this.storage.resolveHandleNameString('absana');
        assert.equal(resolveHandleNameString, accounts[5]);
    });

    it('Should get a Handlename by address.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('absana');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[5]);
    });

    it('Should get a Registrar name by address.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('abhishek');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[4]);
    });

    it('Should return an error when trying to update Registrar at Storage contract directly.', async () => {
        try {
            await this.storage.updateRegistrar(accounts[5], 'absanasa', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when updating Handlename at main contract without value.', async () => {
        try {
            await this.tokenhold.updateHandleNameOfUser(accounts[5], 'absanasa', { from: accounts[2], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert registration fees not matched -- Reason given: registration fees not matched.';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully update Registrar at main contract.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.updateHandleNameOfUser(accounts[5], 'absanasa', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);

    });

    it('Should return error when trying to set Handlename which was set previously.', async () => {
        try {
            await this.tokenhold.addHandleName(accounts[8], 'absana', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Handl name is already used once, not available now -- Reason given: Handl name is already used once, not available now.';
            assert.equal(error.message, error_);
        }
    });

    it('Should get a Handlename by address after update.', async () => {
        let resolveHandleNameString = await this.storage.resolveHandleNameString('absanasa');
        assert.equal(resolveHandleNameString, accounts[5]);
    });

    it('Should get a Handlename by address after update using different method.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('absanasa');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[5]);
    });

    it('Should get the total Handlenames registered at Storage contract.', async () => {
        let totalHandleNameRegistered = await this.storage.totalHandleNameRegistered();
        assert.equal(totalHandleNameRegistered.toNumber(), 2);
    });

    it('Should successfully deploy Auction contract with proper constructor.', async () => {
        this.Auction = await Auction.new(this.storage.address, { gas: 600000000 });
    });

    it('Should check the Storage contract address.', async () => {
        let contractAddress = await this.Auction.registrarStorageContractAddress.call({ gas: 600000000 });
        assert.equal(contractAddress, this.storage.address);
    });

    it('Should return the contract owner of Auction contract.', async () => {
        let contractOwner = await this.Auction.contractOwner.call({ gas: 600000000 });
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should check if Auction is active or not by this address.', async () => {
        let alreadyActiveAuction = await this.Auction.alreadyActiveAuction.call(accounts[2], { gas: 600000000 });
        assert.equal(alreadyActiveAuction, false);
    });

    it('Should return error when set the Auction contract\'s address at Storage contract.', async () => {
        try {
            await this.storage.setAuctionContract(this.Auction.address, { from: accounts[1], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should set the Auction contract address at Storage contract.', async () => {
        await this.storage.setAuctionContract(this.Auction.address, { gas: 600000000 });
    });

    it('Should return error when starting the the Auction with improper timelimit.', async () => {
        try {
            await this.Auction.auctionHandlename('absanaSA', 865400 * 30, { from: accounts[6], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Auction time should be in between 330 to 7776000 seconds -- Reason given: Auction time should be in between 330 to 7776000 seconds.';
            assert.equal(error.message, error_);
        }
    });

    it('Should start the Auction of accounts[5] Handlename.', async () => {
        await this.Auction.auctionHandlename('absanaSA', 86400 * 30, { from: accounts[5], gas: 600000000 });
    });

    it('Should return the Auction data of auctioner.', async () => {
        let auctiondata = await this.Auction.auction.call(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[5]);
        assert.equal(auctiondata.handleName, 'absanasa');
    });

    it('Should check if the Handlename of address is in auction or not.', async () => {
        let auctionProcess = await this.storage.auctionProcess.call(accounts[5], { gas: 600000000 });
        assert.equal(auctionProcess, true);
    });

    it('Should return an error when bidding function is called without Ether.', async () => {
        try {
            await this.Auction.bidForHandleName('absanaSA', { from: accounts[6], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert bid amount should be higher then previous bid -- Reason given: bid amount should be higher then previous bid.';
            assert.equal(error.message, error_);
        }
    });

    it('Should start the bidding process.', async () => {
        await this.Auction.bidForHandleName('absanaSA', { from: accounts[6], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
    });

    it('Should check the auction data of auctionerd', async () => {
        let auctiondata = await this.Auction.auction.call(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[5]);
        assert.equal(auctiondata.handleName, 'absanasa');
        assert.equal(auctiondata.higestBidderAddress, accounts[6]);
        assert.equal(auctiondata.totalBids, 1);
        assert.equal(auctiondata.totalBidders, 1);
        assert.equal(auctiondata.highestBid.toString() / 10 ** 18, 1);
    });

    it('Should return the bidder data of auction in array.', async () => {
        let auctiondata = await this.Auction.arrayOfbidders(accounts[5], { gas: 600000000 });
        assert.equal(auctiondata[0], accounts[6]);
    });

    it('Should return the bidRate of a particular bidder.', async () => {
        let auctiondata = await this.Auction.getBidRate(accounts[5], accounts[6], { gas: 600000000 });
        assert.equal(auctiondata.toString(), 1 * 10 ** 18);
    });

    it('Should start the bidding process by accounts[7].', async () => {
        await this.Auction.bidForHandleName('absanaSA', { from: accounts[7], value: Web3Utils.toWei("2", "ether"), gas: 600000000 });
    });

    it('Should return the auction data of auctioner by accounts[7].', async () => {
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

    it('Should return the bids of all bidders other than winner.', async () => {
        this.openingTime = (await latestTime());
        await time.increaseTo(this.openingTime + duration.seconds(2678400));

        let walletBalanceInitially = await web3.eth.getBalance(accounts[6]);

        await this.Auction.refundOtherBidders({ from: accounts[5], gas: 600000000 });

        let walletBalanceLater = await web3.eth.getBalance(accounts[6]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should get a address by Handlename after auction.', async () => {
        let resolveHandleNameString = await this.storage.resolveHandleNameString('absanasa');
        assert.equal(resolveHandleNameString, accounts[7]);
    });

    it('Should get a Handlename by address after update using a different method.', async () => {
        let resolveHandleNameOrRegistrarName = await this.storage.resolveHandleNameOrRegistrarName('absanasa');
        assert.equal(resolveHandleNameOrRegistrarName, accounts[7]);
    });

    it('Should transfer the Handlename directly to another account.', async () => {
        await this.Auction.directlyTransferHandleName('absanasa', accounts[9], { from: accounts[7], gas: 600000000 });
    });

    it('Should get a handle name by address after update', async () => {
        let resolveHandleNameString = await this.storage.resolveHandleNameString('absanasa');
        assert.equal(resolveHandleNameString, accounts[9]);
    });

    it('Should return false for blockchain index before adding.', async () => {
        let indexTaken = await this.storage.indexTaken(1);
        assert.equal(indexTaken, false);
    });

    it('Should add other coin address.', async () => {
        await this.tokenhold.addCoins(1, 'BITCOIN', 'BTC', { from: accounts[2], gas: 600000000 });
    });

    it('Should return true for blockchain index after adding.', async () => {
        let indexTaken = await this.storage.indexTaken(1);
        assert.equal(indexTaken, true);
    });

    it('Should get a coin name By index.', async () => {
        let indexOfCoin = await this.storage.indexOfCoin(1);
        assert.equal(indexOfCoin.toString(), 'bitcoin');
    });

    it('Should get the blockchain alias name by index.', async () => {
        let getBlockchainAliasNameByIndex = await this.storage.getCoinAliasNameByIndex(1);
        assert.equal(getBlockchainAliasNameByIndex.toString(), 'btc');
    });

    it('Should check if a particular coin name is registered or not by blockchain name.', async () => {
        let isBlockchainRegistered = await this.storage.isCoinRegistered('bitcoin');
        assert.equal(isBlockchainRegistered, true);
    });

    it('Should not be able to register another coin at same index.', async () => {
        try {
            await this.tokenhold.addCoins(1, 'BITCOINS', 'BTCS', { from: accounts[0], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to register new another coin of the same type.', async () => {
        try {
            await this.tokenhold.addCoins(2, 'BITCOIN', 'BTCS', { from: accounts[0], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to register new blockchain by same alias name.', async () => {
        try {
            await this.tokenhold.addCoins(2, 'BITCOINSS', 'BTC', { from: accounts[2], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to add other coin address for an account without Handlename.', async () => {
        try {
            await this.tokenhold.registerCoinAddress(accounts[9], 1, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea', { from: accounts[2], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Storage contract fail -- Reason given: Storage contract fail.';
            assert.equal(error.message, error_);
        }
    });

    it('Should not be able to add other address to Blockchain for resolving at an invalid index.', async () => {
        try {
            await this.tokenhold.registerCoinAddress(accounts[8], 0, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea', { from: accounts[2], gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully add other coin address.', async () => {
        await this.tokenhold.registerCoinAddress(accounts[7], 1, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea', { from: accounts[2], gas: 600000000 });
    });

    it('Should return an error at invalid index.', async () => {
        try {
            await this.storage.resolveCoinAddress('absana', 0);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error at invalid coin name.', async () => {
        try {
            await this.storage.resolveCoinAddress('absanasasa', 0);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should successfully resolve other address.', async () => {
        let resolveCoinAddress = await this.storage.resolveCoinAddress('absanasa', 1);
        assert.equal(resolveCoinAddress.toString(), '3hqh1qgaqnwppbrvygjnrxnejcukd4e6ea');
    });

    it('should successfully update other coin address.', async () => {
        await this.tokenhold.updateCoinAddress(accounts[7], 1, '3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ep', { from: accounts[2], gas: 600000000 });
    });

    it('Should successfully resolve other coin address using Handlename.', async () => {
        let resolveCoinAddress = await this.storage.resolveCoinAddress('absanasa', 1);
        assert.equal(resolveCoinAddress.toString(), '3hqh1qgaqnwppbrvygjnrxnejcukd4e6ep');
    });

    it('Should return an error at invalid index.', async () => {
        try {
            await this.storage.resolveCoinHandleName('3hqh1qgaqnwppbrvygjnrxnejcukd4e6ea', 0);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error at invalid address', async () => {
        try {
            await this.storage.resolveCoinHandleName('3vygjnrxnejcukd4e6ea', 1);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_);
        }
    });

    it('Should resolve HandleName using coin address.', async () => {
        let resolveCoinHandleName = await this.storage.resolveCoinHandleName('3hqh1qgaqnwppbrvygjnrxnejcukd4e6ea', 1);
        assert.equal(resolveCoinHandleName.toString(), 'absanasa');
    });

    it('Should update Registrar at Main contract second time.', async () => {
        let walletBalanceInitially = await web3.eth.getBalance(accounts[1]);
        await this.tokenhold.updateRegistrar('abhi21094', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        let walletBalanceLater = await web3.eth.getBalance(accounts[1]);
        let updateBalance = parseInt(walletBalanceInitially) + 1 * 10 ** 18;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return an error when trying to update Registrar at Main contract third time.', async () => {
        try {
            await this.tokenhold.updateRegistrar('abhi21094', { from: accounts[2], value: Web3Utils.toWei("1", "ether"), gas: 600000000 });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert new name is already taken -- Reason given: new name is already taken.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return old Registrar address To Names details.', async () => {
        let resolveCoinHandleName = await this.storage.OldRegistrarAddressToNames(accounts[2], 0);
        let resolveCoinHandleName1 = await this.storage.OldRegistrarAddressToNames(accounts[2], 1);
        console.log(resolveCoinHandleName);
        console.log(resolveCoinHandleName1);
    });

    it('Should check old Handlename details.', async () => {
        let resolveCoinHandleName = await this.storage.OldHandles(accounts[5], 1);
        let resolveCoinHandleName1 = await this.storage.OldHandles(accounts[5], 0);
        console.log(resolveCoinHandleName);
        console.log(resolveCoinHandleName1);
    });

    it('Should return error when resolving address with length greater than usual.', async () => {
        try {           
            await this.storage.resolveHandleName('0x0906aF095470F7Dbf6eB0ff698F9f576AFA961BAA');
        } catch (error) {
            const error_ = 'invalid address (arg="_userAddress", coderType="address", value="0x0906aF095470F7Dbf6eB0ff698F9f576AFA961BAA")';
            assert.equal(error.message, error_);
        }
    });

    it('Should return user handle name from address.', async () => {
        let resolveHandleName = await this.storage.resolveHandleName(accounts[9]);
        assert.equal(resolveHandleName.toString(), 'absanasa');
    });

    it('Should return error when resolving address with length less than usual.', async () => {
        try {
            await this.storage.resolveHandleName('0x0906aF095470F7Dbf6eB0ff698F9f576AFA961B');
        } catch (error) {
            const error_ = 'invalid address (arg="_userAddress", coderType="address", value="0x0906aF095470F7Dbf6eB0ff698F9f576AFA961B")';
            assert.equal(error.message, error_);
        }
    });

    it('Should resolve user Handlename from address(0).', async () => {
        let resolveHandleName = await this.storage.resolveHandleName(accounts[9]);
        assert.equal(resolveHandleName.toString(), 'absanasa');
    });

    it('Should return an error when resolving Handlename from address which is not registered.', async () => {
        try {
            await this.storage.resolveHandleName(accounts[2]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Not a valid user address';
            assert.equal(error.message, error_);
        }
    });

    it('Should return true when valid Handlename is passed.', async () => {
        let validHandleNameAddress = await this.storage.validHandleNameAddress(accounts[9]);
        assert.equal(validHandleNameAddress, true);
    });

    it('Should return false when invalid Handlename is passed.', async () => {
        let validHandleNameAddress = await this.storage.validHandleNameAddress(accounts[5]);
        assert.equal(validHandleNameAddress, false);
    });

})

