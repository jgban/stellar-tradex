var tradex = angular.module('tradex');
var horizonTest = "https://horizon-testnet.stellar.org";
var horizonPublic = "https://horizon.stellar.org";

var server = "";

tradex.controller('homeController', function($scope, $state, $http) {
		
	$scope.trades = [];
	$scope.searchResult = {};
	
	$scope.selling = {};
	$scope.buying = {};
	$scope.showSelling = false;
	$scope.showBuying = false;
	$scope.infoMsg = [];
	$scope.recentOffers = [];
	$scope.networkType = 1;


	var sellingForm = `<input class="form-control" placeholder="Asset Code" type="text" name="assetCode" ng-model="selling.assetCode" required ng-maxlength="{{selling.assetType}}"/>
          <input class="form-control" placeholder="Asset Issuer ID" type="text" name="assetIssuer" ng-model="selling.assetIssuer" required/>`;
	var buyingForm = `<input class="form-control" placeholder="Asset Code" type="text" name="assetCode" ng-model="buying.assetCode" required ng-maxlength="{{buying.assetType}}"/>
          <input class="form-control" placeholder="Asset Issuer ID" type="text" name="assetIssuer" ng-model="buying.assetIssuer" required/>  `;
	
	$scope.init = function() {
		// Get list of recent trades ~30-50
		// list of most recent offers
		// search for bids/asks
		
		if ($scope.networkType == 1) {
			console.log("setting server to testNetwork");
			server = new StellarSdk.Server(horizonTest);
		};
		
		if ($scope.networkType == 2) {
			console.log("setting server to liveNetwork");
			StellarSdk.Network.usePublicNetwork();
			server = new StellarSdk.Server(horizonPublic);
		};

		server.orderbook(new StellarSdk.Asset.native(), new StellarSdk.Asset.native())
					.trades()
					.limit(20)
					.order("desc")
					.call()
  				.then(function(resp) { 
  					console.log(resp); 
  					$scope.trades = resp.records;
  					$scope.$apply();
  				})
  				.catch(function(err) { console.log(err); });
	
		$scope.getOffers();

	};

	$scope.networkChange = function() {
		// change server
		if ($scope.networkType == 1) {
			console.log("setting server to testNetwork");
			server = new StellarSdk.Server(horizonTest);
		};
		
		if ($scope.networkType == 2) {
			console.log("setting server to liveNetwork");
			StellarSdk.Network.usePublicNetwork();
			server = new StellarSdk.Server(horizonPublic);
		};

		// reload all info
		$scope.trades = [];
		$scope.recentOffers = [];
		server.orderbook(new StellarSdk.Asset.native(), new StellarSdk.Asset.native())
					.trades()
					.limit(20)
					.order("desc")
					.call()
  				.then(function(resp) { 
  					console.log(resp); 
  					$scope.trades = resp.records;
  					$scope.$apply();
  				})
  				.catch(function(err) { console.log(err); });
	
		$scope.getOffers();
	};

	$scope.searchTrades = function() {
		$scope.infoMsg = [];
		console.log("selling", $scope.selling);
		console.log("buying", $scope.buying);
		if ($scope.selling.assetIssuer && !StellarSdk.Keypair.isValidPublicKey($scope.selling.assetIssuer)) {
			$scope.infoMsg.push('Invalid Selling Asset Issuer');
			return false;
		}

		if ($scope.buying.assetIssuer && !StellarSdk.Keypair.isValidPublicKey($scope.buying.assetIssuer)) {
			$scope.infoMsg.push('Invalid buying Asset Issuer');
			return false;
		}

		if ($scope.selling.assetType && $scope.buying.assetType ) {
			var sellingAsset = $scope.newAsset($scope.selling.assetType, $scope.selling.assetCode, $scope.selling.assetIssuer);
			var buyingAsset = $scope.newAsset($scope.buying.assetType, $scope.buying.assetCode, $scope.buying.assetIssuer);

			server.orderbook(sellingAsset, buyingAsset)
					.limit(20)
					.order("desc")
					.call()
  				.then(function(resp) { 
  					console.log(resp); 
  					$scope.searchResult = resp;
  					$scope.$apply();
  				})
  				.catch(function(err) { console.log(err); });


		}else{
			$scope.infoMsg.push('Select Assets');
			return false;
		}
	};

	$scope.assetInput = function(block,type){

		console.log("block: ", block," type: ", type);
		var myEl ="";
		var output = "";
		if (block == 1 && type > 1) {
			$scope.showSelling = true;
		}
		if (block == 1 && type == 1) {
			$scope.showSelling = false;
		}

		if (block == 2 && type > 1) {
			$scope.showBuying = true;
		}
		if (block == 2 && type == 1) {
			$scope.showBuying = false;
		}

	};

	$scope.newAsset = function (type, code, issuer) {
		if (type == 1) {
			return StellarSdk.Asset.native();
		}else{
			return new StellarSdk.Asset(code, issuer);
		}

	};

	$scope.getOffers = function(cursor) {
		// idea....
		// get current tx seq number and use is as cursor
		// cursor should be < current tx seq number
		// 
		
		if (cursor === 'undefined') {
			cursor = "now";
		};
	
      server.operations()
      			.cursor(cursor)
      			.order("desc")
      			.limit(200)
      			.call()
      			.then(function(resp) { 
      				console.log(resp.records); 
      				resp.records.forEach(function(record) {
      					offerHandler(record);
      				});

      				if ($scope.recentOffers.length < 20) {
      					console.log("rco length", $scope.recentOffers.length);
      					$scope.getOffers(resp.records[199].paging_token);
      					return null;
      				}else{
      					// do nothing
      				}

      			})
  					.catch(function(err) {
  					 console.log(err); 
  					});
	};

	function offerHandler (record) {
		if (record.type_i == 3 || record.type_i == 4) {
			// process offer
			$scope.recentOffers.push(record);
			$scope.$apply();
			console.log("recentOffers", $scope.recentOffers);

		} else{
			// do nothing
		}


	}

	function errorHandler(error) {
		console.log("Streaming error: ", error);

	}

});


