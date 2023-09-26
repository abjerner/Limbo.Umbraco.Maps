using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Limbo.Umbraco.Maps.Composers;

/// <inheritdoc />
public class MapsComposer : IComposer {

    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder) {

        builder.ManifestFilters().Append<MapsManifestFilter>();

    }

}