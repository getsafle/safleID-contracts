var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const { duration } = require('openzeppelin-solidity/test/helpers/increaseTime');
const { time } = require('@openzeppelin/test-helpers');
const { latestTime } = require('openzeppelin-solidity/test/helpers/latestTime');

const RegistrarMain = artifacts.require('RegistrarMain.sol');
const RegistrarStorage = artifacts.require('RegistrarStorage.sol');
const Auction = artifacts.require('Auction.sol');

const { 
    GAS_LIMIT,
    REGISTRAR_FEES, 
    HANDLENAME_FEES, 
    VALID_REGISTRAR_NAME_1, 
    VALID_HANDLENAME_1,
    VALID_HANDLENAME_2,
    BID_1,
    BID_2,
    BID_4,
} = require('./constants');

contract('Auction Contract ', async (accounts) => {

    it('Should deploy the Main Contract with the constructor.', async () => {
        this.mainContract = await RegistrarMain.new(accounts[1], { gas: GAS_LIMIT });
    });

    it('Should deploy the Storage Contract with the constructor.', async () => {
        this.storageContract = await RegistrarStorage.new(this.mainContract.address, { gas: GAS_LIMIT });
    });;

    it('Should deploy the Auction Contract with the constructor.', async () => {
        this.auctionContract = await Auction.new(this.storageContract.address, { gas: GAS_LIMIT });
    });

    it('Should set the Auction contract address at Storage contract.', async () => {
        await this.storageContract.setAuctionContract(this.auctionContract.address, { gas: GAS_LIMIT });
    });

    it('Should set the Auction contract address at Storage contract.', async () => {
        await this.mainContract.setRegistrarStorageContract(this.storageContract.address, { from: accounts[0] });
    });

    it('Should check the Storage contract address.', async () => {
        let contractAddress = await this.auctionContract.registrarStorageContractAddress.call({ gas: GAS_LIMIT });
        assert.equal(contractAddress, this.storageContract.address);
    });

    it('Should return the contract owner of Auction contract.', async () => {
        let contractOwner = await this.auctionContract.contractOwner.call({ gas: GAS_LIMIT });
        assert.equal(contractOwner, accounts[0]);
    });

    it('Should successfully register new Registrar and Handlename at Main contract.', async () => {

        await this.mainContract.addRegistrar(VALID_REGISTRAR_NAME_1, { from: accounts[2], value: REGISTRAR_FEES, gas: GAS_LIMIT });

        await this.mainContract.addHandleName(accounts[3], VALID_HANDLENAME_1, { from: accounts[2], value: HANDLENAME_FEES, gas: GAS_LIMIT });

    });

    it('Should return the address by Handlename.', async () => {
        let address = await this.storageContract.resolveHandleNameString(VALID_HANDLENAME_1);
        assert.equal(address, accounts[3]);
    });

    it('Should return false if Auction is not active.', async () => {
        let isAuctionActive = await this.auctionContract.alreadyActiveAuction.call(accounts[3], { gas: GAS_LIMIT });
        assert.equal(isAuctionActive, false);
    });

    it('Should return error when starting the the Auction with improper timelimit.', async () => {
        try {
            await this.auctionContract.auctionHandlename(VALID_HANDLENAME_1, 865400 * 30, { from: accounts[3], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Auction time should be in between 330 to 7776000 seconds -- Reason given: Auction time should be in between 330 to 7776000 seconds.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return an error when trying to Auction the Handlename by non-owner.', async () => {
        try {
            await this.auctionContract.auctionHandlename(VALID_HANDLENAME_1, 86400 * 30, { from: accounts[2], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert you are not an owner of this handle name -- Reason given: you are not an owner of this handle name.';
            assert.equal(error.message, error_);
        }
    });

    it('Should start the Handlename auction.', async () => {
        await this.auctionContract.auctionHandlename(VALID_HANDLENAME_1, 86400 * 30, { from: accounts[3], gas: GAS_LIMIT });
    });

    it('Should return true if Auction is active.', async () => {
        let isAuctionActive = await this.auctionContract.alreadyActiveAuction.call(accounts[3], { gas: GAS_LIMIT });
        assert.equal(isAuctionActive, true);
    });

    it('Should return an error when trying to Auction the Handlename which is already in auction.', async () => {
        try {
            await this.auctionContract.auctionHandlename(VALID_HANDLENAME_1, 86400 * 30, { from: accounts[3], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert Auction is already in process by this user -- Reason given: Auction is already in process by this user.';
            assert.equal(error.message, error_);
        }
    });

    it('Should return the Auction data of auctioner.', async () => {
        let auctiondata = await this.auctionContract.auction.call(accounts[3], { gas: GAS_LIMIT });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[3]);
        assert.equal(auctiondata.handleName, VALID_HANDLENAME_1);
    });

    it('Should return true if the Handlename of the address is in auction.', async () => {
        let auctionProcess = await this.storageContract.auctionProcess.call(accounts[3], { gas: GAS_LIMIT });
        assert.equal(auctionProcess, true);
    });

    it('Should return false if the Handlename of the address is not in auction.', async () => {
        let auctionProcess = await this.storageContract.auctionProcess.call(accounts[6], { gas: GAS_LIMIT });
        assert.equal(auctionProcess, false);
    });

    it('Should return an error when bidding function is called without Ether.', async () => {
        try {
            await this.auctionContract.bidForHandleName(VALID_HANDLENAME_1, { from: accounts[4], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert bid amount should be higher then previous bid -- Reason given: bid amount should be higher then previous bid.';
            assert.equal(error.message, error_);
        }
    });

    it('Should bid for the handlename.', async () => {
        await this.auctionContract.bidForHandleName(VALID_HANDLENAME_1, { from: accounts[4], value: BID_1, gas: GAS_LIMIT });
    });

    it('Should bid for the handlename.', async () => {
        await this.auctionContract.bidForHandleName(VALID_HANDLENAME_1, { from: accounts[5], value: BID_2, gas: GAS_LIMIT });
    });

    it('Should return an error when a bidder bids a value less than that of the previous bidder.', async () => {
        try {
            await this.auctionContract.bidForHandleName(VALID_HANDLENAME_1, { from: accounts[6], value: BID_4, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert bid amount should be higher then previous bid -- Reason given: bid amount should be higher then previous bid.';
            assert.equal(error.message, error_)
        }
    });

    it('Should return an error when a bidder bids for a handlename which is not registered.', async () => {
        try {
            await this.auctionContract.bidForHandleName(VALID_HANDLENAME_2, { from: accounts[4], value: BID_4, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_)
        }
    });

    it('Should return an error when a the auctioneer bids for their own handlename.', async () => {
        try {
            await this.auctionContract.bidForHandleName(VALID_HANDLENAME_1, { from: accounts[3], value: BID_4, gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert you cannot bid for your handle name -- Reason given: you cannot bid for your handle name.';
            assert.equal(error.message, error_)
        }
    });

    it('Should check the auction data of auctioneer', async () => {
        let auctiondata = await this.auctionContract.auction.call(accounts[3], { gas: GAS_LIMIT });
        assert.equal(auctiondata.isAuctionLive, true);
        assert.equal(auctiondata.auctionConductor, accounts[3]);
        assert.equal(auctiondata.handleName, VALID_HANDLENAME_1);
        assert.equal(auctiondata.higestBidderAddress, accounts[5]);
        assert.equal(parseInt(auctiondata.totalBids), 2);
        assert.equal(auctiondata.totalBidders, 2);
        assert.equal(auctiondata.highestBid.toString(), BID_2);
    });

    it('Should return the bidder data of auction in array.', async () => {
        let auctiondata = await this.auctionContract.arrayOfbidders(accounts[3], { gas: GAS_LIMIT });
        assert.equal(auctiondata[0], accounts[4]);
        assert.equal(auctiondata[1], accounts[5]);
    });

    it('Should return the bidRate of a particular bidder.', async () => {
        let auctiondata = await this.auctionContract.getBidRate(accounts[3], accounts[4], { gas: GAS_LIMIT });
        assert.equal(auctiondata.toString(), BID_1);
    });

    it('Should return the bidRate of a particular bidder.', async () => {
        let auctiondata = await this.auctionContract.getBidRate(accounts[3], accounts[5], { gas: GAS_LIMIT });
        assert.equal(auctiondata.toString(), BID_2);
    });

    it('Should return an error when getting the bid rate for non-auctioned account.', async () => {
        try {
            await this.auctionContract.getBidRate(accounts[4], accounts[5]);
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_)
        }
    });

    it('Should return an error when refund function is called by non-auctioneer account.', async () => {
        try {
            await this.auctionContract.refundOtherBidders({ from: accounts[5], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_)
        }
    });

    it('Should return the bids of all bidders other than winner.', async () => {
        this.openingTime = (await latestTime());
        await time.increaseTo(this.openingTime + duration.seconds(2678400));

        let walletBalanceInitially = await web3.eth.getBalance(accounts[4]);

        await this.auctionContract.refundOtherBidders({ from: accounts[3], gas: GAS_LIMIT });

        let walletBalanceLater = await web3.eth.getBalance(accounts[4]);
        let updateBalance = parseInt(walletBalanceInitially) + BID_1;
        assert.equal(parseInt(walletBalanceLater), updateBalance);
    });

    it('Should return the address by Handlename.', async () => {
        let address = await this.storageContract.resolveHandleNameString(VALID_HANDLENAME_1);
        assert.equal(address, accounts[5]);
    });

    it('Should return an error when calling refund function second time.', async () => {
        try {
            await this.auctionContract.refundOtherBidders({ from: accounts[3], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert';
            assert.equal(error.message, error_)
        }
    });

    it('Should return an error when directly transferring handlename to another account by non-owner.', async () => {
        try {
            await this.auctionContract.directlyTransferHandleName(VALID_HANDLENAME_1, accounts[6], { from: accounts[3], gas: GAS_LIMIT });
        } catch (error) {
            var error_ = 'Returned error: VM Exception while processing transaction: revert you are not an owner of this handle name -- Reason given: you are not an owner of this handle name.';
            assert.equal(error.message, error_)
        }
    });

    it('Should transfer the Handlename directly to another account.', async () => {
        await this.auctionContract.directlyTransferHandleName(VALID_HANDLENAME_1, accounts[6], { from: accounts[5], gas: GAS_LIMIT });
    });

    it('Should return the address by Handlename.', async () => {
        let address = await this.storageContract.resolveHandleNameString(VALID_HANDLENAME_1);
        assert.equal(address, accounts[6]);
    });

});