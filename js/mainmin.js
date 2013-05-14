var webMapID = "6fdf3e4a0a8a4f7bb060765e9e658092";

var map;

dojo.ready(function () {

	require(["esri/arcgis/utils"], 
			function(arcGISUtils, ClosestFacilityTask, ClosestFacilityParameters,
				FeatureSet, SimpleLineSymbol, Color)
	{
		var mapDeferred = arcGISUtils.createMap(webMapID, "mapDiv");

		mapDeferred.then(function(response) 
		{
			// Set our global reference
			console.log("Map opened OK");
			map = response.map;
		}, function(error) {
			console.log("Map creation failed: ", dojo.toJson(error));
		});
	});
});

// To help with the map layout, we need these dojo layout components.
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");