angular.module("umbraco").controller("Limbo.Umbraco.Maps.PointValueType.Controller", function ($scope, editorService) {

    const vm = this;

    vm.valueTypes = [
        { name: "IPoint", type: "", description: "Skybrud.Essentials.Maps.Geometry.IPoint", icon: "icon-map-location" },
        { name: "Double array", type: "System.Double[]" },
        { name: "GeoJsonPoint", type: "Skybrud.Essentials.Maps.GeoJson.Geometry.GeoJsonPoint", icon: "icon-brackets" },
        { name: "WktPoint", type: "Skybrud.Essentials.Maps.Wkt.WktJsonPoint", icon: "icon-notepad" }
    ];

    vm.valueType = null;

    vm.valueTypes.forEach(function (valueType) {
        if (!valueType.description) valueType.description = valueType.type;
        if (!valueType.icon) valueType.icon = "icon-box-alt";
        if (valueType.type === $scope.model.value) vm.valueType = valueType;
    });

    vm.updated = function () {
        $scope.model.value = vm.valueType.type;
    };

    if (!vm.valueType) {
        vm.valueType = vm.valueTypes[0];
        vm.updated();
    }

    vm.change = function () {

        editorService.open({
            title: "Select value type",
            view: "/App_Plugins/Limbo.Umbraco.Maps/Views/Editors/ValueTypeOverlay.html",
            size: "medium",
            availableItems: vm.valueTypes,
            close: function () {
                editorService.close();
            },
            submit: function (valueType) {
                vm.valueType = valueType;
                editorService.close();
            }
        });

    };

});