using Limbo.Umbraco.Maps.PropertyEditors.Points;
using Microsoft.Extensions.Configuration;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;

#pragma warning disable CS1591

namespace Limbo.Umbraco.Maps.PropertyEditors.Circles;

[DataEditor(EditorAlias, EditorType.PropertyValue, EditorName, EditorView, ValueType = ValueType, Group = EditorGroup, Icon = EditorIcon)]
public class CircleEditor : DataEditor {

    private readonly IConfiguration _configuration;
    private readonly IIOHelper _ioHelper;
    private readonly IEditorConfigurationParser _editorConfigurationParser;

    #region Constants

    public const string EditorAlias = "Limbo.Umbraco.Maps.Circle";

    public const string EditorName = "Limbo Maps - Circle";

    public const string EditorView = "/App_Plugins/Limbo.Umbraco.Maps/Views/Editors/Circle.html";

    public const string EditorGroup = "Limbo Maps";

    public const string EditorIcon = "icon-maps-circle color-limbo";

    public const string ValueType = ValueTypes.Json;

    #endregion

    #region Constructors

    /// <summary>
    /// Initializes a new instance of the <see cref="PointEditor"/> class.
    /// </summary>
    public CircleEditor(IConfiguration configuration, IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper, IEditorConfigurationParser editorConfigurationParser) : base(dataValueEditorFactory) {
        _configuration = configuration;
        _ioHelper = ioHelper;
        _editorConfigurationParser = editorConfigurationParser;
    }

    #endregion

    #region Member methods

    protected override IConfigurationEditor CreateConfigurationEditor() {
        return new PointConfigurationEditor(_configuration, _ioHelper, _editorConfigurationParser);
    }

    #endregion

}