angular.module("umbraco").controller("Limbo.Umbraco.Maps.Polyline.Controller", function ($scope, localizationService) {

    const vm = this;

    // Make sure we read property editor settings from the data type configuration
    $scope.model.hideLabel = $scope.model.config.hideLabel === true;
    $scope.model.readonly = $scope.model.config.readonly === true;

    // Calculate a unique ID for the map element
    vm.uniqueId = `limboMaps_${Math.random().toString().replace(".", "")}`;

    function initLabels() {

        vm.labels = {
            vertices: "Vertices",
            length: "Length"
        };

        const keys = Object.keys(vm.labels);

        localizationService.localizeMany(keys.map(x => "limboMaps_" + x)).then(function (data) {
            data.forEach(function (e, i) {
                if (e.length > 0 && e[0] !== '[') vm.labels[keys[i]] = e;
            });
        });

    }

    function initOptions() {
        vm.options = {
            readonly: $scope.model.config.readonly === true,
            onInit: function (map) {

                if ($scope.model.value?.type === "polyline") {

                    // Convert the saved YX array to an array of lobjects with lat/lng properties
                    const path = [];
                    $scope.model.value.coordinates.forEach(function (x) {
                        path.push({ lat: x[0], lng: x[1] });
                    });

                    // Add a new polyline to the map based on the path
                    map.addPolyline(path);

                    // Update the UI
                    update();

                    // Seems that adding a small delay is necessary in order for the focus to fire properly
                    $timeout(function () {
                        map.fitToPolyline();
                    }, 20);

                }

            },
            onPathChange: function (path) {
                $scope.model.value = {
                    type: "polyline",
                    coordinates: path
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

        if (!vm.provider.hasPolyline()) {
            vm.stats = null;
            return;
        }

        let length = vm.provider.getLength();
        let lengthUnit = "m";

        if (length > 1000) {
            length = length / 1000;
            lengthUnit = "km";
        }

        vm.stats = [
            { key: vm.labels.vertices, value: vm.provider.getVertexCount() },
            { key: vm.labels.length, value: length.toFixed(2) + " " + lengthUnit }
        ];

    };

    // Currently this property editor only supports Google Maps, but ideally we should support more providers - eg.
    // Leaflet.So in order to provide some level of absraction, the Google Maps specific logic is isolated within this
    // object
    function googleMaps(o) {

        let map = null;
        let polyline = null;

        const g = {};

        function getYXPath() {

            if (!polyline) return [];

            // Construct a YX array for the outer coordinates
            const coordinates = [];
            polyline.getPath().forEach(function (latLng) {
                coordinates.push([latLng.lat(), latLng.lng()]);
            });

            return coordinates;

        }

        function addPoint(latLng) {

            // If we're in readonly mode, we should just return right away
            if (o.readonly) return;

            // Get the path of the polyline
            const path = polyline.getPath();

            // Append the clicked coordinates to the path
            path.push(latLng);

        }

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

                if (!polyline) g.addPolyline([]);

                addPoint(e.latLng);

                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });

            });

            $scope.$apply(function () {
                o.onInit(g);
            });

        };

        // Return whether the map currently has a polyline
        g.hasPolyline = function () {
            return polyline != null;
        };

        // Adds a new polyline to the map. Should only be used if the map doesn't already have a polyline
        g.addPolyline = function (path) {

            // Initialize a new polygon shape and add it to the map
            polyline = new google.maps.Polyline({
                strokeColor: o.readonly === true ? "black" : "red",
                strokeOpacity: 1.0,
                strokeWeight: 3,
                editable: o.readonly !== true,
                path: path,
                map: map
            });

            // Triggered when the user drags a vertex (point)
            polyline.getPath().addListener("set_at", function () {
                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });
            });

            // Triggered when the user drags the center point of a segment in the polyline's path
            polyline.getPath().addListener("insert_at", function () {
                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });
            });

            // Triggered when the user right clicks on the path. If the click position matches a
            // vertex, we remove that vertex from the path
            polyline.addListener("rightclick", function (e) {
                if (!e.vertex) return;
                polyline.getPath().removeAt(e.vertex);
                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });
            });

        };

        // Removes the current polyline from the map
        g.removePolyline = function () {

            if (!polyline) return;

            polyline.setMap(null);

            polyline = null;

        };

        // Zooms the map to fit the current polyline in the viewport
        g.fitToPolyline = function () {

            // Return if the map doesn't have a polyline'
            if (!polyline) return;

            // Initialize a new bounds instance
            const bounds = new google.maps.LatLngBounds();

            // Append each point in the path to the bounds
            polyline.getPath().forEach(function (latLng) {
                bounds.extend(latLng);
            });

            // Make the map zoom to the bounds
            map.fitBounds(bounds);

        };

        // Returns the length of the polyline
        g.getLength = function () {
            if (!polyline) return -1;
            const path = polyline.getPath();
            return google.maps.geometry.spherical.computeLength(path);
        };

        // Returns the total amount of vertices in the path
        g.getVertexCount = function () {
            if (!polyline) return -1;
            const path = polyline.getPath();
            return path.length;
        }

        return g;

    };

    // Resets the current property value and removes the polyline from the map
    vm.reset = function () {
        vm.provider.removePolyline();
        $scope.model.value = "";
        update();
    };

    vm.focus = function () {
        vm.provider.fitToPolyline();
    };

    init();

});