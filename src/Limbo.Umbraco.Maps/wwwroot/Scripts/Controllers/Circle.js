angular.module("umbraco").controller("Limbo.Umbraco.Maps.Circle.Controller", function ($scope, $timeout) {

    const vm = this;

    // Make sure we read property editor settings from the data type configuration
    $scope.model.hideLabel = $scope.model.config.hideLabel === true;
    $scope.model.readonly = $scope.model.config.readonly === true;

    // Calculate a unique ID for the map element
    vm.uniqueId = `limboMaps_${Math.random().toString().replace(".", "")}`;

    function initLabels() {
        vm.labels = {
            placeholder: "Click on the map to draw a new circle",
            radius: "Radius",
            area: "Area",
            perimeter: "Perimeter"
        };
    }

    function initOptions() {
        vm.options = {
            readonly: $scope.model.config.readonly === true,
            onInit: function (map) {

                if ($scope.model.value?.type === "circle") {

                    // Add a new circle to the map
                    map.addCircle($scope.model.value.center, $scope.model.value.radius);

                    // Update the UI
                    update();

                    // Seems that adding a small delay is necessary in order for the focus to fire properly
                    $timeout(function () {
                        map.focus();
                    }, 20);
                }

            },
            onMapClick: function (center, map) {
                if (map.hasCircle()) return;
                $scope.model.value = {
                    type: "circle",
                    center: center,
                    radius: 100
                };
                map.addCircle(center, 100);
                update();
            },
            onCenterChange: function (center) {
                $scope.model.value.center = center;
                update();
            },
            onRadiusChange: function (radius) {
                $scope.model.value.radius = radius;
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

        if (!vm.provider.hasCircle()) {
            vm.stats = null;
            return;
        }

        let radius = $scope.model.value.radius;
        let radiusUnit = "m";

        if (radius > 1000) {
            radius = radius / 1000;
            radiusUnit = "km";
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
            { key: vm.labels.radius, value: radius.toFixed(2) + " " + radiusUnit },
            { key: vm.labels.area, value: area.toFixed(2) + " " + areaUnit },
            { key: vm.labels.perimeter, value: perimeter.toFixed(2) + " " + perimeterUnit }
        ];

    };

    // Currently this property editor only supports Google Maps, but ideally we should support more providers - eg.
    // Leaflet.So in order to provide some level of absraction, the Google Maps specific logic is isolated within this
    // object
    function googleMaps(o) {

        let map = null;
        let circle = null;

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

            // Add an event listener to the map so we can track when the user clicks on the map
            map.addListener("click", function (e) {
                $scope.$apply(function () {
                    o.onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() }, g);
                });
            });

            $scope.$apply(function () {
                o.onInit(g);
            });

        };

        g.hasCircle = function () {
            return circle !== null;
        };

        g.addCircle = function (center, radius) {

            circle = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map: map,
                center: center,
                radius: radius ?? 100,
                editable: $scope.model.readonly === false
            });

            circle.addListener("center_changed", function () {
                if (!o.onCenterChange) return;
                const center = circle.getCenter();
                $scope.$apply(function () {
                    o.onCenterChange({ lat: center.lat(), lng: center.lng() }, g);
                });
            });

            circle.addListener("radius_changed", function () {
                if (!o.onRadiusChange) return;
                const radius = circle.getRadius();
                $scope.$apply(function () {
                    o.onRadiusChange(radius, g);
                });
            });

        };

        g.removeCircle = function () {
            if (!circle) return;
            circle.setMap(null);
            circle = null;
        };

        g.getArea = function () {
            return $scope.model.value?.radius ? $scope.model.value.radius * $scope.model.value.radius * Math.PI : -1;
        };

        g.getPerimeter = function () {
            return $scope.model.value?.radius ? 2 * Math.PI * $scope.model.value.radius : -1;
        };

        g.focus = function () {
            if (!circle) return;
            map.fitBounds(circle.getBounds());
        };

        return g;

    };

    // Resets the current property value and removes the circle from the map
    vm.reset = function () {
        vm.provider.removeCircle();
        $scope.model.value = "";
        update();
    };

    vm.focus = function () {
        vm.provider.focus();
    };

    init();

});