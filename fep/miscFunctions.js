function getWhereThisWasCalledFrom(depth) {
    let actualDepth = (depth || 0) + 3
    let splitIntoLines = Error().stack.split("\n")
    if (actualDepth >= splitIntoLines.length)
        actualDepth = splitIntoLines.length - 1
    let lineOfStackTrace = splitIntoLines[actualDepth]

    let splitBySlash = lineOfStackTrace.split("/")
    let stillGotColons = splitBySlash[splitBySlash.length - 1]
    let splitByColons = stillGotColons.split(":")
    return splitByColons[0] + ":" + splitByColons[1]
}

function initGa(initFuncWithoutDeclarations) {

    let funcString = initFuncWithoutDeclarations.toString().slice(0,-1)

    let i = 0
    let declarations = ""
    let withoutDeclarations = funcString.replace(/newMv31/g, () => {
        declarations += "\n    let newMv31" + i + " = new Mv31()"
        return "newMv31" + (i++)
    })
    var strToEval =
        "(" +
        withoutDeclarations +
        declarations +
        "\n\n})()"

    eval(strToEval)
}

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
function fovFromCenterToFrameDistanceAtOneUnitAway(centerToFrame) {
	return 2. * Math.atan(centerToFrame) * (360. / TAU);
}
function otherFov(inputFov, aspectRatio, inputIsVertical) {
	var centerToFrameInput = centerToFrameDistanceAtOneUnitAway(inputFov, 1)
	var centerToFrameOutput = centerToFrameInput;
	if (inputIsVertical)
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovFromCenterToFrameDistanceAtOneUnitAway(centerToFrameOutput)
	return outputFov;
}