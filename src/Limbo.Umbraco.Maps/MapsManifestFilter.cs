using System.Collections.Generic;
using System.Reflection;
using Umbraco.Cms.Core.Manifest;

namespace Limbo.Umbraco.Maps;

/// <inheritdoc />
public class MapsManifestFilter : IManifestFilter {

    /// <inheritdoc />
    public void Filter(List<PackageManifest> manifests) {

        // Initialize a new manifest filter for this package
        PackageManifest manifest = new() {
            AllowPackageTelemetry = true,
            PackageName = MapsPackage.Name,
            Version = MapsPackage.InformationalVersion,
            Stylesheets = new[] {
                "/App_Plugins/Limbo.Umbraco.Maps/Styles/Styles.css"
            },
            Scripts = new[] {
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/Circle.js",
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/Point.js",
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/PointValueType.js",
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/Polygon.js",
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/Polyline.js",
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/Rectangle.js",
                "/App_Plugins/Limbo.Umbraco.Maps/Scripts/Controllers/ValueTypeOverlay.js"
            }
        };

        // The "PackageId" property isn't available prior to Umbraco 12, and since the package is build against
        // Umbraco 10, we need to use reflection for setting the property value for Umbraco 12+. Ideally this
        // shouldn't fail, but we might at least add a try/catch to be sure
        try {
            PropertyInfo? property = manifest.GetType().GetProperty("PackageId");
            property?.SetValue(manifest, MapsPackage.Alias);
        } catch {
            // We don't really care about the exception
        }

        // Append the manifest
        manifests.Add(manifest);

    }

}