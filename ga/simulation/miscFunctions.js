function clamp(value, min, max) {
	if (min !== null && value < min)
		return min

	if (max !== undefined && value > max)
		return max

	return value;
}

function isString(myVar) {
	return typeof myVar === 'string' || myVar instanceof String
}

function keyOfProptInObject(propt, obj) {
	let keys = Object.keys(obj)
	return keys.find((key) => propt === obj[key])
}

function forEachPropt(obj, func) {
	let keys = Object.keys(obj)
	keys.forEach((key) => {
		func(obj[key], key)
	})
}

function centerToFrameDistanceAtOneUnitAway(fov) {
	return Math.tan(fov / 2. * (TAU / 360.))
}
function fovGivenCenterToFrameDistanceAtOneUnitAway(centerToFrame) {
	return 2. * Math.atan(centerToFrame) * (360. / TAU);
}
function otherFov(inputFov, aspectRatio, inputIsVertical) {
	var centerToFrameInput = centerToFrameDistanceAtOneUnitAway(inputFov, 1)
	var centerToFrameOutput = centerToFrameInput;
	if (inputIsVertical)
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistanceAtOneUnitAway(centerToFrameOutput)
	return outputFov;
}