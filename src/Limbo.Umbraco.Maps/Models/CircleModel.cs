using Skybrud.Essentials.Maps.Geometry;
using Skybrud.Essentials.Maps.Geometry.Shapes;

namespace Limbo.Umbraco.Maps.Models;

/// <summary>
/// Class representing a circle on a spheroid.
/// </summary>
public class CircleModel : ICircle {

    private readonly ICircle _circle;

    #region Properties

    /// <summary>
    /// Gets or sets the center of the circle.
    /// </summary>
    public IPoint Center => _circle.Center;

    /// <summary>
    /// Gets or sets the radius of the circle.
    /// </summary>
    public double Radius => _circle.Radius;

    #endregion

    #region Constructors

    /// <summary>
    /// Initializes a new instance based on the specified <paramref name="circle"/>.
    /// </summary>
    /// <param name="circle">The circle the instance should be based on.</param>
    public CircleModel(ICircle circle) {
        _circle = circle;
    }

    #endregion

    #region Member methods

    /// <inheritdoc />
    public bool Contains(IPoint point) {
        return _circle.Contains(point);
    }

    /// <inheritdoc />
    public IPoint GetCenter() {
        return _circle.GetCenter();
    }

    /// <inheritdoc />
    public double GetArea() {
        return _circle.GetArea();
    }

    /// <inheritdoc />
    public virtual double GetCircumference() {
        return _circle.GetCircumference();
    }

    /// <inheritdoc />
    public virtual IRectangle GetBoundingBox() {
        return _circle.GetBoundingBox();
    }

    #endregion

}