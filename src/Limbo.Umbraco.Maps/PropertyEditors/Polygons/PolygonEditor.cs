using Limbo.Umbraco.Maps.PropertyEditors.Points;
using Microsoft.Extensions.Configuration;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Polygons;

[DataEditor(EditorAlias, EditorType.PropertyValue, EditorName, EditorView, ValueType = ValueType, Group = EditorGroup, Icon = EditorIcon)]
public class PolygonEditor : DataEditor {

    private readonly IConfiguration _configuration;
    private readonly IIOHelper _ioHelper;
    private readonly IEditorConfigurationParser _editorConfigurationParser;

    #region Constants

    public const string EditorAlias = "Limbo.Umbraco.Maps.Polygon";

    public const string EditorName = "Limbo Maps - Polygon";

    public const string EditorView = "/App_Plugins/Limbo.Umbraco.Maps/Views/Editors/Polygon.html";

    public const string EditorGroup = "Limbo Maps";

    public const string EditorIcon = "icon-maps-polygon color-limbo";

    public const string ValueType = ValueTypes.Json;

    #endregion

    #region Constructors

    /// <summary>
    /// Initializes a new instance of the <see cref="PointEditor"/> class.
    /// </summary>
    public PolygonEditor(IConfiguration configuration, IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper, IEditorConfigurationParser editorConfigurationParser) : base(dataValueEditorFactory) {
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