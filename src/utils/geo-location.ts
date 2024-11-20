export interface Coordinate {
	lat: number;
	lon: number;
}

function _toRadians(degrees: number) {
	return degrees * Math.PI / 180;
}

function _getCoordinateDifferenceInMeters(coordinate1: Coordinate, coordinate2: Coordinate) {
	// Approximate conversions assuming spherical Earth
	const R = 6371000; // Earth's radius in meters (mean radius)
	const lat1 = _toRadians(coordinate1.lat);
	const lon1 = _toRadians(coordinate1.lon);
	const lat2 = _toRadians(coordinate2.lat);
	const lon2 = _toRadians(coordinate2.lon);

	const dLat = lat2 - lat1;
	const dLon = lon2 - lon1;

	const x = dLon * Math.cos((lat1 + lat2) / 2) * R;
	const y = dLat * R;

	return { x, y };
}

function _rotatePoint(x: number, y: number, angle: number): { x: number; y: number } {
	const rad = _toRadians(angle);
	const xRotated = x * Math.cos(rad) - y * Math.sin(rad);
	const yRotated = x * Math.sin(rad) + y * Math.cos(rad);
	return { x: xRotated, y: yRotated };
}

export function haversineDistance(coordinate1: Coordinate, coordinate2: Coordinate): number {
	const R = 6371000; // Earth's radius in meters
	const lat1 = _toRadians(coordinate1.lat);
	const lon1 = _toRadians(coordinate1.lon);
	const lat2 = _toRadians(coordinate2.lat);
	const lon2 = _toRadians(coordinate2.lon);

	const dLat = lat2 - lat1;
	const dLon = lon2 - lon1;

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in meters
}

export function coordinatesToGrid(referenceCoordinate: Coordinate, angleToNorth: number, coordinateList: Coordinate[]) {
	return coordinateList.map(coordinate => {
		const { x, y } = _getCoordinateDifferenceInMeters(referenceCoordinate, coordinate);
		return _rotatePoint(x, y, angleToNorth);
	});
}