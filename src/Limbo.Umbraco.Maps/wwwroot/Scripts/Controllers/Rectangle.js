angular.module("umbraco").controller("Limbo.Umbraco.Maps.Rectangle.Controller", function ($scope, $timeout) {

    const vm = this;

    // Make sure we read property editor settings from the data type configuration
    $scope.model.hideLabel = $scope.model.config.hideLabel === true;
    $scope.model.readonly = $scope.model.config.readonly === true;

    // Calculate a unique ID for the map element
    vm.uniqueId = `limboMaps_${Math.random().toString().replace(".", "")}`;

    function initLabels() {
        vm.labels = {
            placeholder: "Click on the map to draw a new rectangle",
            circumference: "Circumference",
            area: "Area"
        };
    }

    function initOptions() {

        vm.options = {
            readonly: $scope.model.config.readonly === true,
            onInit: function (map) {

                if ($scope.model.value?.type === "rectangle") {

                    const sw = $scope.model.value.southWest;
                    const ne = $scope.model.value.northEast;

                    console.log("sw", sw);
                    console.log("ne", ne);

                    // Add a new rectangle
                    map.addRectangle(sw, ne);

                    // Update the UI
                    update();

                    // Seems that adding a small delay is necessary in order for the focus to fire properly
                    $timeout(function () {
                        map.focus();
                    }, 20);
                }

            },
            onBoundsChange: function (bounds) {
                $scope.model.value = {
                    type: "rectangle",
                    southWest: { lat: bounds.south, lng: bounds.west },
                    northEast: { lat: bounds.north, lng: bounds.east }
                };
                update();
            }
        };

    }

    function init() {

        initLabels();
        initOptions();

        // Set the current provider to Google Maps
        vm.provider = googleMaps(vm.options);

        // Load the provider
        vm.provider.load();

    }

    function update() {

        if (!vm.provider.hasRectangle()) {
            vm.stats = null;
            return;
        }

        let area = vm.provider.getArea();
        let areaUnit = "m²";

        if (area > 1000 * 1000) {
            area = area / 1000 / 1000;
            areaUnit = "km²";
        }

        let perimeter = vm.provider.getPerimeter();
        let perimeterUnit = "m";

        if (perimeter > 1000) {
            perimeter = perimeter / 1000;
            perimeterUnit = "km";
        }

        vm.stats = [
            { key: vm.labels.area, value: area.toFixed(2) + " " + areaUnit },
            { key: vm.labels.perimeter, value: perimeter.toFixed(2) + " " + perimeterUnit }
        ];

    };

    // Currently this property editor only supports Google Maps, but ideally we should support more providers - eg.
    // Leaflet.So in order to provide some level of absraction, the Google Maps specific logic is isolated within this
    // object
    function googleMaps(o) {

        let map = null;
        let rectangle = null;

        const g = {};

        // Function responsible for loading the map. Loads the Google Maps library if not already loaded for the
        // current page
        g.load = function () {

            // Get the API key from the app settings (if any)
            const apiKey = $scope.model.config?.googleMaps?.apiKey ?? "";

            // Determine a suitable callback name
            const callbackName = vm.uniqueId;

            // If "google.maps" already exist, we call to the "init" function to set up the map. If it doesn't exist,
            // we load the Google Maps library, and then call the "init" function
            if (window.google && window.google.maps) {

                g.init();

            } else {

                // Attach the callback function to the "window" object
                window[callbackName] = async function () {
                    g.init();
                };

                // Create the script tag, set the appropriate attributes
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?libraries=geometry&key=${apiKey}&callback=${callbackName}`;
                script.async = true;

                // Append the "script" element to "head"
                document.head.appendChild(script);

            }

        }

        g.init = async function () {

            let center = { lat: 0, lng: 0 };
            let zoom = $scope.model.config?.googleMaps?.zoom ?? 3;

            // If the data type specified a default center, we use that instead of Null Island
            if ($scope.model.config?.googleMaps?.center) {
                center = Utilities.copy($scope.model.config.googleMaps.center);
            }

            // Get a reference to the Google Maps library
            const { Map } = await google.maps.importLibrary("maps");

            // Initialize a new map
            map = new Map(document.getElementById(vm.uniqueId), {
                center: center,
                zoom: zoom,
                mapId: "4504f8b37365c3d0",
            });

            map.addListener("click", function (e) {

            });

            $scope.$apply(function () {
                o.onInit(g);
            });

        };

        // Return whether the map currently has a polygon
        g.hasRectangle = function () {
            return rectangle != null;
        };

        g.addRectangle = function (southWest, northEast) {

            const south = southWest.lat;
            const west = southWest.lng;
            const north = northEast.lat;
            const east = northEast.lng;

            rectangle = new google.maps.Rectangle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map: map,
                bounds: { south, west, north, east },
                editable: true
            });

            rectangle.addListener("bounds_changed", function () {
                if (!o.onBoundsChange) return;
                $scope.$apply(function () {
                    const b = rectangle.getBounds();
                    const sw = b.getSouthWest();
                    const ne = b.getNorthEast();
                    o.onBoundsChange({
                        south: sw.lat(),
                        west: sw.lng(),
                        north: ne.lat(),
                        east: ne.lng()
                    });
                });
            });

        };

        g.getArea = function () {
            if (!rectangle) return -1;
            console.log(rectangle);
            return google.maps.geometry.spherical.computeArea(rectangle.getBounds());
        };

        g.getPerimeter = function() {

            //const s = $scope.model.value.southWest[0];
            //const w = $scope.model.value.southWest[1];
            //const n = $scope.model.value.northEast[0];
            //const e = $scope.model.value.northEast[1];

            //const path = [
            //    { lat: s, lng: w },
            //    { lat: n, lng: w },
            //    { lat: n, lng: e },
            //    { lat: s, lng: e },
            //    { lat: s, lng: w }
            //];

            //vm.circumference = google.maps.geometry.spherical.computeLength(path);
            //vm.circumferenceText = vm.circumference.toFixed(2) + " m";

            return -1;

        };

        g.focus = function () {

            // Get the bounds of the new rectangle
            const bounds = googleMaps.rectangle.getBounds();

            // Make the map zoom to the bounds
            googleMaps.map.fitBounds(bounds);

        };

        return g;

    };

    // Resets the current property value and removes the rectangle from the map
    vm.reset = function () {
        vm.provider.removeRectangle();
        $scope.model.value = "";
        update();
    };

    vm.focus = function () {
        vm.provider.focus();
    };

    init();

});