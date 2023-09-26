using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using Skybrud.Essentials.Json.Newtonsoft;
using Skybrud.Essentials.Maps.Geometry;
using Skybrud.Essentials.Maps.Geometry.Shapes;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Polygons;

public class PolygonValueConverter : PropertyValueConverterBase {

    public override bool IsConverter(IPublishedPropertyType propertyType) {
        return propertyType.EditorAlias.InvariantEquals(PolygonEditor.EditorAlias);
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

        // Parse the outer coordinates
        double[][][] coordinates = json.GetValue("coordinates")?.ToObject<double[][][]>() ?? Array.Empty<double[][]>();

        // Initialize a new polygon
        return new Polygon(FromYxArray(coordinates));

    }

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType) {
        return typeof(IPolygon);
    }

    private static IPoint[][] FromYxArray(double[][][] array) {
        // TODO: Move to Skybrud.Essentials.Maps
        return array.Select(sub1 => sub1.Select(FromYxArray).ToArray()).ToArray();
    }

    private static IPoint FromYxArray(double[] array) {
        // TODO: Move to Skybrud.Essentials.Maps
        return new Point(array[0], array[1]);
    }

}