using System;
using Newtonsoft.Json.Linq;
using Skybrud.Essentials.Json.Newtonsoft;
using Skybrud.Essentials.Json.Newtonsoft.Extensions;
using Skybrud.Essentials.Maps.GeoJson.Geometry;
using Skybrud.Essentials.Maps.Geometry;
using Skybrud.Essentials.Maps.Wkt;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Points;

public class PointValueConverter : PropertyValueConverterBase {

    internal const string TypeDoubleArray = "System.Double[]";

    internal const string TypeGeoJsonPoint = "Skybrud.Essentials.Maps.GeoJson.Geometry.GeoJsonPoint";

    internal const string TypeWktPoint = "Skybrud.Essentials.Maps.Wkt.WktJsonPoint";

    #region Member methods

    public override bool IsConverter(IPublishedPropertyType propertyType) {
        return propertyType.EditorAlias.InvariantEquals(PointEditor.EditorAlias);
    }

    public override object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview) {
        return source switch {
            JObject json => json,
            string str when JsonUtils.TryParseJsonObject(str, out JObject? jsonNullable) => jsonNullable,
            _ => null
        };
    }

    public override object? ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview) {

        // Get the configuration
        PointConfiguration? config = propertyType.DataType.Configuration as PointConfiguration;

        // Is the data type nullable?
        bool nullable = config?.IsNullable ?? false;

        IPoint? point;

        if (inter is JObject json && json.TryGetDouble("lat", out double lat) && json.TryGetDouble("lng", out double lng)) {
            point = new Point(lat, lng);
        } else if (nullable) {
            return null;
        } else {
            point = new Point(0, 0);
        }

        return config?.ValueType switch {
            TypeDoubleArray => new[] { point.Latitude, point.Longitude },
            TypeGeoJsonPoint => new GeoJsonPoint(point),
            TypeWktPoint => new WktPoint(point),
            _ => point
        };

    }

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType) {

        // Get the configuration
        PointConfiguration? config = propertyType.DataType.Configuration as PointConfiguration;

        return config?.ValueType switch {
            TypeDoubleArray => typeof(double[]),
            TypeGeoJsonPoint => typeof(GeoJsonPoint),
            TypeWktPoint => typeof(WktPoint),
            _ => typeof(IPoint)
        };

    }

    #endregion

}