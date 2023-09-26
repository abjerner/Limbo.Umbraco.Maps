using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Points;

public class PointConfigurationEditor : ConfigurationEditor<PointConfiguration> {

    private readonly IConfiguration _configuration;

    public PointConfigurationEditor(IConfiguration configuration, IIOHelper ioHelper, IEditorConfigurationParser editorConfigurationParser) : base(ioHelper, editorConfigurationParser) {
        _configuration = configuration;
    }

    public override Dictionary<string, object> ToConfigurationEditor(PointConfiguration? configuration) {

        Dictionary<string, object> config = base.ToConfigurationEditor(configuration);

        string googleMapsApiKey = _configuration.GetSection("Limbo:Maps:GoogleMaps:ApiKey").Value;

        config["height"] = "550px";

        config["googleMaps"] = new JObject {
            {"apiKey", googleMapsApiKey},
            {"center", new JObject { {"lat", 55.8633 }, {"lng", 10.8181 } } },
            {"zoom", 14}
        };

        return config;

    }

}