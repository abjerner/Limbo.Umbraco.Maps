using Umbraco.Cms.Core.PropertyEditors;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Points;

public class PointConfiguration {

    /// <summary>
    /// Gets or sets .NET value type returned by properties using this data type.
    /// </summary>
    [ConfigurationField("valueType", "Value type", "/App_Plugins/Limbo.Umbraco.Maps/Views/Editors/PointValueType.html", Description = "Select the .NET value type returned by properties using this data type.")]
    public string? ValueType { get; set; }

    /// <summary>
    /// Gets or sets whether the value is nullable.
    /// </summary>
    [ConfigurationField("nullable", "Is nullable?", "boolean", Description = "Select whether the returned value is nullable.")]
    public bool IsNullable { get; set; } = true;

    /// <summary>
    /// Gets or sets whether the label of the property editor should be hidden.
    /// </summary>
    [ConfigurationField("hideLabel", "Hide label?", "boolean", Description = "Select whether the label of the property editor should be hidden.")]
    public bool HideLabel { get; set; }

    /// <summary>
    /// Gets or sets whether the property editor should be read only.
    /// </summary>
    [ConfigurationField("readonly", "Is readonly?", "boolean", Description = "Select whether the property editor should be readonly.")]
    public bool IsReadOnly { get; set; }

}