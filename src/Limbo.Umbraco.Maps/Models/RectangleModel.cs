using Skybrud.Essentials.Maps.GeoJson.Geometry;
using Skybrud.Essentials.Maps.Geometry;
using Skybrud.Essentials.Maps.Geometry.Shapes;
using Skybrud.Essentials.Maps.Wkt;

namespace Limbo.Umbraco.Maps.Models;

/// <summary>
/// Class representing a retangle.
/// </summary>
/// <see>
///     <cref>https://en.wikipedia.org/wiki/Rectangle</cref>
/// </see>
public class RectangleModel : IRectangle {

    private readonly IRectangle _rectangle;

    #region Properties

    /// <summary>
    /// Gets the south west point.
    /// </summary>
    public IPoint SouthWest => _rectangle.SouthWest;

    /// <summary>
    /// Gets the north east point.
    /// </summary>
    public IPoint NorthEast => _rectangle.NorthEast;

    /// <summary>
    /// Gets the latitude of the northern side of the rectangle.
    /// </summary>
    public double North => NorthEast.Latitude;

    /// <summary>
    /// Gets the longitude of the eastern side of the rectangle.
    /// </summary>
    public double East => NorthEast.Longitude;

    /// <summary>
    /// Gets the latitude of the southern side of the rectangle.
    /// </summary>
    public double South => SouthWest.Latitude;

    /// <summary>
    /// Gets the longitude of the western side of the rectangle.
    /// </summary>
    public double West => SouthWest.Longitude;

    /// <summary>
    /// Gets the south east point.
    /// </summary>
    public IPoint SouthEast => new Point(South, East);

    /// <summary>
    /// Gets the north west point.
    /// </summary>
    public IPoint NorthWest => new Point(North, West);

    #endregion

    #region Constructors

    /// <summary>
    /// Initializes a new instance based from <paramref name="rectangle"/>.
    /// </summary>
    /// <param name="rectangle">The rectangle the instance should be based on.</param>
    public RectangleModel(IRectangle rectangle) {
        _rectangle = rectangle;
    }

    #endregion

    #region Member methods

    /// <summary>
    /// Returns whether the rectangle contains <paramref name="point"/>.
    /// </summary>
    /// <param name="point">The point.</param>
    /// <returns><see langword="true"/> if the rectangle contains the point; otherwise <see langword="false"/>.</returns>
    public bool Contains(IPoint point) {
        return _rectangle.Contains(point);
    }

    /// <summary>
    /// Returns an instance of <see cref="IPoint"/> representing the center of the rectangle.
    /// </summary>
    /// <returns>An instance of <see cref="IPoint"/>.</returns>
    public IPoint GetCenter() {
        return _rectangle.GetCenter();
    }

    /// <summary>
    /// Returns the area of the rectangle in square metres.
    /// </summary>
    /// <returns>The area in square metres.</returns>
    public double GetArea() {
        return _rectangle.GetArea();
    }

    /// <summary>
    /// Returns the circumference of the rectangle in metres.
    /// </summary>
    /// <returns>The circumference in metres.</returns>
    public double GetCircumference() {
        return _rectangle.GetCircumference();
    }

    /// <summary>
    /// Returns an instance of <see cref="IRectangle"/> representing the bounding box of the rectangle.
    /// </summary>
    /// <returns>An instance of <see cref="IRectangle"/>.</returns>
    public IRectangle GetBoundingBox() {
        return _rectangle.GetBoundingBox();
    }

    /// <summary>
    /// Returns a new <see cref="GeoJsonPolygon"/> instance representing the rectangle.
    /// </summary>
    /// <returns>An instance of <see cref="GeoJsonPolygon"/>.</returns>
    public GeoJsonPolygon ToGeoJson() {

        IPoint[] outer = {
            SouthWest,
            NorthWest,
            NorthEast,
            SouthEast,
            SouthWest
        };

        return new GeoJsonPolygon(outer);

    }

    /// <summary>
    /// Returns a new <see cref="WktPolygon"/> instance representing the rectangle.
    /// </summary>
    /// <returns>An instance of <see cref="WktPolygon"/>.</returns>
    public WktPolygon ToWkt() {

        IPoint[] outer = {
            SouthWest,
            NorthWest,
            NorthEast,
            SouthEast,
            SouthWest
        };

        return new WktPolygon(new[] { outer });

    }

    #endregion

}