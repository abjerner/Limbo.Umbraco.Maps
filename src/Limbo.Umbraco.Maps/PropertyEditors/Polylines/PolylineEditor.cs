using Limbo.Umbraco.Maps.PropertyEditors.Polygons;
using Microsoft.Extensions.Configuration;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Polylines;

[DataEditor(EditorAlias, EditorType.PropertyValue, EditorName, EditorView, ValueType = ValueType, Group = EditorGroup, Icon = EditorIcon)]
public class PolylineEditor : DataEditor {

    private readonly IConfiguration _configuration;
    private readonly IIOHelper _ioHelper;
    private readonly IEditorConfigurationParser _editorConfigurationParser;

    #region Constants

    public const string EditorAlias = "Limbo.Umbraco.Maps.Polyline";

    public const string EditorName = "Limbo Maps - Polyline";

    public const string EditorView = "/App_Plugins/Limbo.Umbraco.Maps/Views/Editors/Polyline.html";

    public const string EditorGroup = "Limbo Maps";

    public const string EditorIcon = "icon-maps-polyline color-limbo";

    public const string ValueType = ValueTypes.Json;

    #endregion

    #region Constructors

    public PolylineEditor(IConfiguration configuration , IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper, IEditorConfigurationParser editorConfigurationParser) : base(dataValueEditorFactory) {
        _configuration = configuration;
        _ioHelper = ioHelper;
        _editorConfigurationParser = editorConfigurationParser;
    }

    #endregion

    #region Member methods

    protected override IConfigurationEditor CreateConfigurationEditor() {
        return new PolygonConfigurationEditor(_configuration, _ioHelper, _editorConfigurationParser);
    }

    #endregion

}