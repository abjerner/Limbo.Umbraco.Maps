using Skybrud.Essentials.Maps.Geometry;

namespace Limbo.Umbraco.Maps.Models;

/// <summary>
/// Class representing a point on a map.
/// </summary>
public class PointModel : IPoint {

    /// <summary>
    /// Gets the latitude of the point.
    /// </summary>
    public double Latitude { get; }

    /// <summary>
    /// Gets the longitude of the point.
    /// </summary>
    public double Longitude { get; }

    /// <summary>
    /// Initializes a point based on the specified <paramref name="latitude"/> and <paramref name="longitude"/>.
    /// </summary>
    /// <param name="latitude">The latitude.</param>
    /// <param name="longitude">The longitude.</param>
    public PointModel(double latitude, double longitude) {
        Latitude = latitude;
        Longitude = longitude;
    }

}