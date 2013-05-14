var cfTaskURL = "http://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World/";
var webMapID = "6fdf3e4a0a8a4f7bb060765e9e658092";
var querySuffix = "/query?where=1%3D1&returnGeometry=true&outFields=*&f=json";

// 127.0.0.1 Token
// var iptok = "wo3S1GGtaVLnI2svskV43kjo_PTaR0IVZGghixMAiPYSRRihXNQ4RjziP4jxwfAQG98VX73Sb7GePmVkJ9g18QkvhFA93jiE_Eqvz-okxr0aU6cfCb02DaFkxK-YM1bv"
// Localhost Token
// var loctok = "ulQS-9h-atdQGXiGRabwtVioky9LwyudgWjY906NX9NUr8WIHGkqjajF0JJSIMe-uZne2d1xt9jcNKAXziyOVivjfCIKYZIcgZLJ9-bP7pxerwio-SAK9j5OP0TKeA_S"
// geeknixta.com Token
// var gntok = "5gszHCoGsijxTQ7EX_TCKF9eFpeQOSrFY8O2OQeyaA3LkQ7l8BGLXCbjkcVlyhIJvraQVs9dUaflJ9PQMvfVR4H7TSHTXDSm45uBlW6XG3gxQX-FSqoI-2T8KzHg9XL4"

var map;
var searchLayer;
var cfTask;
var cfParams;
var routeSymbol;

// esri.config.defaults.io.proxyUrl = "../proxy.php";

dojo.ready(function () {

	require(["esri/arcgis/utils",
			 "esri/tasks/ClosestFacilityTask",
			 "esri/tasks/ClosestFacilityParameters",
			 "esri/tasks/FeatureSet",
			 "esri/symbols/SimpleLineSymbol",
			 "dojo/_base/Color",
			 "esri/IdentityManager"], 
			function(arcGISUtils, ClosestFacilityTask, ClosestFacilityParameters,
				FeatureSet, SimpleLineSymbol, Color, IdentityManager)
	{
		dojo.addOnUnload(storeCredentials);
		// look for credentials in local storage
		loadCredentials();

		var mapDeferred = arcGISUtils.createMap(webMapID, "mapDiv");

		mapDeferred.then(function(response) 
		{
			map = response.map;
			for (i=0; i < map.graphicsLayerIds.length; i++)
			{
				if (map.graphicsLayerIds[i].lastIndexOf("Market",0) === 0)
				{
					searchLayer = map.getLayer(map.graphicsLayerIds[i]);
					break;
				}
			}

			cfTask = new ClosestFacilityTask(cfTaskURL);

			cfParams = new ClosestFacilityParameters();
			cfParams.outSpatialReference = map.spatialReference;
			cfParams.defaultCutoff = 30.0;
			cfParams.returnRoutes = true;
			cfParams.defaultTargetFacilityCount = 3;
			cfParams.travelDirection = esri.tasks.NATravelDirection.TO_FACILITY;

			cfParams.facilities = new esri.tasks.DataFile();
			cfParams.facilities.url = searchLayer.url + querySuffix;

			cfParams.incidents = new FeatureSet();

			routeSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
								new Color([75,180,255,0.8]),
								4.5);

			dojo.connect(map, "onClick", function(evt) 
			{
				var g = new esri.Graphic(evt.mapPoint);
				cfParams.incidents.features = [g];

				cfTask.solve(cfParams, function(solveResult) {
					map.graphics.clear();
					for (i=0; i < solveResult.routes.length; i++) {
						var routeGraphic = solveResult.routes[i];
						routeGraphic.symbol = routeSymbol;
						map.graphics.add(routeGraphic);
					}
				}, function(error) {
					console.log("Couldn't get closest markets! " + error);
				});
			});
		}, function(error) {
			console.log("Map creation failed: ", dojo.toJson(error));
		});
	});
});

var cred = "esri_jsapi_id_manager_data";

function loadCredentials() {
  var idJson, idObject;

  if ( supports_local_storage() ) {
    // read from local storage
    idJson = window.localStorage.getItem(cred);
  } else {
    // read from a cookie
    idJson = dojo.cookie(cred);
  }

  if ( idJson && idJson != "null" && idJson.length > 4) {
    idObject = dojo.fromJson(idJson);
    esri.id.initialize(idObject);
  } else {
    // console.log("didn't find anything to load :(");
  }
}

function storeCredentials() {
  // make sure there are some credentials to persist
  if ( esri.id.credentials.length === 0 ) {
    return;
  }

  // serialize the ID manager state to a string
  var idString = dojo.toJson(esri.id.toJson());
  // store it client side
  if ( supports_local_storage() ) {
    // use local storage
    window.localStorage.setItem(cred, idString);
    // console.log("wrote to local storage");
  } else {
    // use a cookie
    dojo.cookie(cred, idString, { expires: 1 });
    // console.log("wrote a cookie :-/");
  }
}

function supports_local_storage() {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch( e ) {
    return false;
  }
}
