using System;
using Newtonsoft.Json.Linq;
using Skybrud.Essentials.Json.Newtonsoft;
using Skybrud.Essentials.Maps.Geometry.Shapes;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Circles;

public class CircleValueConverter : PropertyValueConverterBase {

    public override bool IsConverter(IPublishedPropertyType propertyType) {
        return propertyType.EditorAlias.InvariantEquals(CircleEditor.EditorAlias);
    }

    public override object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview) {
        return source switch {
            JObject json => json,
            string str when JsonUtils.TryParseJsonObject(str, out JObject? jsonNullable) => jsonNullable,
            _ => null
        };
    }

    public override object ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview) {
        throw new NotImplementedException();
    }

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType) {
        return typeof(ICircle);
    }

}