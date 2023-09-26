angular.module("umbraco").controller("Limbo.Umbraco.Maps.Polygon.Controller", function ($scope, $timeout, localizationService) {

    const vm = this;

    // Make sure we read property editor settings from the data type configuration
    $scope.model.hideLabel = $scope.model.config.hideLabel === true;
    $scope.model.readonly = $scope.model.config.readonly === true;

    // Calculate a unique ID for the map element
    vm.uniqueId = `limboMaps_${Math.random().toString().replace(".", "")}`;

    function initLabels() {

        vm.labels = {
            vertices: "Vertices",
            area: "Area",
            perimeter: "Perimeter"
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

                if ($scope.model.value?.type === "polygon") {

                    // Convert the saved YX array to an array of lobjects with lat/lng properties
                    const path = [];
                    $scope.model.value.coordinates[0].forEach(function (x) {
                        path.push({ lat: x[0], lng: x[1] });
                    });

                    // Add a new polygon to the map based on the path
                    map.addPolygon(path);

                    // Update the UI
                    update();

                    // Seems that adding a small delay is necessary in order for the focus to fire properly
                    $timeout(function () {
                        map.fitToPolygon();
                    }, 20);
                }

            },
            onPathChange: function (path) {
                $scope.model.value = {
                    type: "polygon",
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

        if (!vm.provider.hasPolygon()) {
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
            { key: vm.labels.vertices, value: vm.provider.getVertexCount() },
            { key: vm.labels.area, value: area.toFixed(2) + " " + areaUnit },
            { key: vm.labels.perimeter, value: perimeter.toFixed(2) + " " + perimeterUnit }
        ];

    };

    // Currently this property editor only supports Google Maps, but ideally we should support more providers - eg.
    // Leaflet.So in order to provide some level of absraction, the Google Maps specific logic is isolated within this
    // object
    function googleMaps(o) {

        let map = null;
        let polygon = null;

        const g = {};

        function getYXPath() {

            if (!polygon) return [];

            // Construct a YX array for the outer coordinates
            const outer = [];
            polygon.getPath().forEach(function (latLng) {
                outer.push([latLng.lat(), latLng.lng()]);
            });

            // Ideally the first and last items in "outer" should represent the same coordinates, as a polygon is a
            // closed shape. Since Google Maps doesn't do this, we need to append the first point to end of the path to
            // close the shape
            if (outer.length > 0) outer.push(outer[0]);

            return [outer];

        }

        function addPoint(latLng) {

            // If we're in readonly mode, we should just return right away
            if (o.readonly) return;

            // Get the path of the polygon
            const path = polygon.getPath();

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

                if (!polygon) g.addPolygon([]);

                addPoint(e.latLng);

                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });

            });

            $scope.$apply(function () {
                o.onInit(g);
            });

        };

        // Return whether the map currently has a polygon
        g.hasPolygon = function () {
            return polygon != null;
        };

        // Adds a new polygon to the map. Should only be used if the map doesn't already have a polygon
        g.addPolygon = function (path) {

            // Initialize a new polygon shape and add it to the map
            polygon = new google.maps.Polygon({
                strokeColor: o.readonly === true ? "black" : "red",
                strokeOpacity: 1.0,
                strokeWeight: 3,
                editable: o.readonly !== true,
                path: path,
                map: map
            });

            // Triggered when the user drags a vertex (point)
            polygon.getPath().addListener("set_at", function () {
                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });
            });

            // Triggered when the user drags the center point of a segment in the polygon's path
            polygon.getPath().addListener("insert_at", function () {
                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });
            });

            // Triggered when the user right clicks on the path. If the click position matches a
            // vertex, we remove that vertex from the path
            polygon.addListener("rightclick", function (e) {
                if (!e.vertex) return;
                polygon.getPath().removeAt(e.vertex);
                $scope.$apply(function () {
                    o.onPathChange(getYXPath(), map);
                });
            });

        };

        // Removes the current polygon from the map
        g.removePolygon = function () {

            if (!polygon) return;

            polygon.setMap(null);

            polygon = null;

        };

        // Zooms the map to fit the current polygon in the viewport
        g.fitToPolygon = function() {

            // Return if the map doesn't have a polygon'
            if (!polygon) return;

            // Initialize a new bounds instance
            const bounds = new google.maps.LatLngBounds();

            // Append each point in the path to the bounds
            polygon.getPath().forEach(function (latLng) {
                bounds.extend(latLng);
            });

            // Make the map zoom to the bounds
            map.fitBounds(bounds);

        };

        // Returns the overall area of the polygon
        g.getArea = function () {
            if (!polygon) return -1;
            const path = polygon.getPath();
            return google.maps.geometry.spherical.computeArea(path);
        };

        // Returns the perimeter / circumference of the polygon
        g.getPerimeter = function () {
            if (!polygon) return -1;
            const path = polygon.getPath();
            // TODO: Are we missing the length of the last segment?
            return google.maps.geometry.spherical.computeLength(path);
        };

        // Returns the total amount of vertices in the path
        g.getVertexCount = function () {
            if (!polygon) return -1;
            const path = polygon.getPath();
            return path.length;
        }

        return g;

    };

    // Resets the current property value and removes the polygon from the map
    vm.reset = function () {
        vm.provider.removePolygon();
        $scope.model.value = "";
        update();
    };

    vm.focus = function () {
        vm.provider.fitToPolygon();
    };

    init();

});