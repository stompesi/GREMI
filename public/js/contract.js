var contract = {};

$(document).ready(function() {
  contract.init();

});

contract.url = "http://61.75.63.149:8545";
contract.ownerAddress = "0x072fc66f7505db74e9dc242afd2df8a861271d4a";
contract.address = "0x24c78a64adb908dc7effdf42aa583ec13f896a17";

contract.init = function() {
  var web3 = new Web3();
  var provider = new web3.providers.HttpProvider(this.url);
  web3.setProvider(provider);

  var abi = [{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontributecheck","outputs":[{"name":"reached_","type":"bool"},{"name":"revenue_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontribute","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"seller","type":"address"},{"name":"buyer","type":"address"}],"name":"sellfunder","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached_","type":"bool"},{"name":"goal_","type":"uint256"},{"name":"amount_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"totalrevenue","type":"uint256"}],"name":"distribution","outputs":[{"name":"reached_","type":"bool"},{"name":"revenue_","type":"uint256"},{"name":"revenue_result","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"contribute","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"checkfunders","outputs":[{"name":"reached_","type":"bool"},{"name":"amount_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_goal","type":"uint256"},{"name":"_compaignId","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"m","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"returncontribute","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"type":"function"}];

  this.crowd = web3.eth.contract(abi).at(this.address);
  this.web3 = web3;
};

contract.createCampaign = function(campaignId, price, owner, callback) {
  var web3 = this.web3;
  var priceWei = web3.toWei(price, 'ether');

  var result = contract.crowd.newCampaign.call(owner, priceWei, campaignId, {
    from: owner
  });

  var password = prompt("Please enter your password:");

  web3.personal.unlockAccount(contract.ownerAddress, password, function(error) {

    if(!error) {
      contract.crowd.newCampaign.sendTransaction(owner, priceWei, campaignId, {
        from: contract.ownerAddress,
        gas: 500000 // toWei
      }, function(error, txId) {
        if(!error) {
          debugger;
          callback(txId, campaignId);
        }
        web3.personal.lockAccount(contract.ownerAddress);
      });
    }  
  });
};

contract.investment = function(campaignId, amount, buyer, callback) {
  var web3 = this.web3;

  var password = prompt("Please enter your password:");
  var wei = web3.toWei(amount, 'ether');

  console.log('start....');
  console.log('campaignId: ' + campaignId);
  console.log('amount: ' + wei);
  console.log('buyer: ' + buyer);

  web3.personal.unlockAccount(buyer, password, function(error) {
    if(!error) {
      contract.crowd.contribute(campaignId, {
        from: buyer,
        gas: 500000,
        value: wei
      }, function(error, txId) {
        if(!error) {
          callback(txId, campaignId, amount);
        }
        web3.personal.lockAccount(contract.ownerAddress);
      });
    }
  });
};