using System;
using Limbo.Umbraco.Maps.Constants;
using Limbo.Umbraco.Maps.Models;
using Newtonsoft.Json.Linq;
using Skybrud.Essentials.Json.Newtonsoft;
using Skybrud.Essentials.Json.Newtonsoft.Extensions;
using Skybrud.Essentials.Maps.Geometry;
using Skybrud.Essentials.Maps.Geometry.Shapes;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Rectangles;

public class RectangleValueConverter : PropertyValueConverterBase {

    public override bool IsConverter(IPublishedPropertyType propertyType) {
        return propertyType.EditorAlias.InvariantEquals(RectangleEditor.EditorAlias);
    }

    public override object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview) {
        return source switch {
            JObject json => json,
            string str when JsonUtils.TryParseJsonObject(str, out JObject? jsonNullable) => jsonNullable,
            _ => null
        };
    }

    public override object? ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview) {

        // Return if "inter" is not a JSON object
        if (inter is not JObject json) return null;

        // Validate the type
        string? type = json.GetString("type");
        if (string.IsNullOrWhiteSpace(type)) return null;
        if (type is not Geometries.Circle) return null;

        // Parse the coordinates
        double? lat = json.GetDoubleOrNullByPath("center.lat");
        double? lng = json.GetDoubleOrNullByPath("center.lng");
        double? radius = json.GetDoubleOrNullByPath("radius");
        if (lat is null || lng is null || radius is null) return null;

        // Initialize a new rectangle model
        return new CircleModel(new Circle(new Point(lat.Value, lng.Value), radius.Value));

    }

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType) {
        return typeof(RectangleModel);
    }

}