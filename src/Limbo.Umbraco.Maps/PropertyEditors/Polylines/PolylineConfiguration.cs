using Umbraco.Cms.Core.PropertyEditors;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Polylines;

public class PolylineConfiguration {

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