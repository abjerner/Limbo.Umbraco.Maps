angular.module("umbraco").controller("Limbo.Umbraco.Maps.Point.Controller", function ($scope) {

    const vm = this;

    // Make sure we read property editor settings from the data type configuration
    $scope.model.hideLabel = $scope.model.config.hideLabel === true;
    $scope.model.readonly = $scope.model.config.readonly === true;

    // Calculate a unique ID for the map element
    vm.uniqueId = `limboMaps_${Math.random().toString().replace(".", "")}`;

    // Initialize the point
    vm.point = { lat: 0, lng: 0 };
    if ($scope.model.value?.lat && $scope.model.value?.lng) {
        vm.point = { lat: $scope.model.value.lat, lng: $scope.model.value.lng };
    }

    vm.update = function () {
        vm.create = !$scope.model.value?.lat;
    };

    vm.reset = function () {
        provider.removeMarker();
        $scope.model.value = "";
        vm.update();
    };

    const options = {
        readonly: $scope.model.config.readonly === true,
        onInit: function (map) {
            if (!vm.point?.lat || !vm.point?.lng) return;
            map.setMarker(vm.point);
        },
        onMapClick: function (position, map) {
            if (options.readonly) return;
            vm.point = position;
            map.setMarker(position);
            $scope.model.value = {
                type: "point",
                lat: position.lat,
                lng: position.lng
            };
            vm.update();
        }
    };

    // Currently this property editor only supports Google Maps, but ideally we should support more providers - eg.
    // Leaflet.So in order to provide some level of absraction, the Google Maps specific logic is isolated within this
    // object
    const googleMaps = (function (o) {

        let map = null;
        let marker = null;

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
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
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

            // if the property already has a value with a valid point, we use that instead
            if (vm.point.lat && vm.point.lng) {
                center = Utilities.copy(vm.point);
                zoom = 15;
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
                if (o.onMapClick) o.onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() }, g);
            });

            o.onInit(g);

        };

        g.panTo = function (position) {
            map.panTo(position);
        };

        g.setMarker = function (position) {
            if (!marker) {
                marker = new google.maps.Marker({
                    position: position,
                    map: map
                });
            } else {
                marker.setPosition(position);
            }
        };

        g.removeMarker = function () {
            marker.setMap(null);
            marker = null;
        }

        return g;

    })(options);

    // Set the current provider to Google Maps
    const provider = googleMaps;

    // Load the provider
    provider.load();


});