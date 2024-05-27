function updateBoxHelper(bbHelper, bb) {
    const array = bbHelper.geometry.attributes.position.array;

    let max = bb.max
    let min = bb.min
    array[ 0] = max.x; array[ 1] = max.y; array[ 2] = max.z;
    array[ 3] = min.x; array[ 4] = max.y; array[ 5] = max.z;
    array[ 6] = min.x; array[ 7] = min.y; array[ 8] = max.z;
    array[ 9] = max.x; array[10] = min.y; array[11] = max.z;
    array[12] = max.x; array[13] = max.y; array[14] = min.z;
    array[15] = min.x; array[16] = max.y; array[17] = min.z;
    array[18] = min.x; array[19] = min.y; array[20] = min.z;
    array[21] = max.x; array[22] = min.y; array[23] = min.z;

    bbHelper.geometry.attributes.position.needsUpdate = true
}

function sq(a) {
    return a * a
}

function makeMovableWithKeyboard(thing) {
    document.addEventListener(`keydown`, e => {
        if (e.key === "ArrowUp")
            thing.y += .0025
        if (e.key === "ArrowDown")
            thing.y -= .0025
        if (e.key === "ArrowRight")
            thing.x += .0025
        if (e.key === "ArrowLeft")
            thing.x -= .0025
        if (e.key === "[")
            thing.z += .0025
        if (e.key === "]")
            thing.z -= .0025

        log(thing)
    })
}

function keyToDiscreteStick(eventKey, target) {

    target.set(0., 0.)
    if (eventKey === "ArrowUp")
        target.set(0., 1.)
    else if (eventKey === "ArrowDown")
        target.set(0., -1.)
    else if (eventKey === "ArrowLeft")
        target.set(1., 0.)
    else if (eventKey === "ArrowRight")
        target.set(-1., 0.)

    return target
}

function vrControllerAxesToDiscreteStick(axes, target) {

    let dominant = Math.abs(axes[2]) > Math.abs(axes[3]) ? 2 : 3

    if (Math.abs(axes[dominant]) < .1)
        target.set(0.,0.)
    else if(dominant === 2)
        target.set(axes[2] > 0 ? 1. : -1., 0.)
    else
        target.set(0., axes[3] > 0 ? -1. : 1.)
    
    return target
}

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

function smoothstep(x) {
	x = clamp(x,0.,1.)
	return x * x * (3. - 2. * x)
}

function makeThingOnTop(thing) {
	thing.renderOrder = 99999
	thing.material.depthTest = false
	thing.material.depthWrite = false
	thing.onBeforeRender = function (renderer) { renderer.clearDepth(); };
}

class LineSegment extends THREE.Line {
	constructor(hexCol) {
		super(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial({ color: hexCol }))
		this.geometry.setAttribute(`position`, new THREE.BufferAttribute(new Float32Array(6), 3))
		scene.add(this)
	}

	set(p1, p2) {
		p1.pointToGibbsVec(v1)
		p2.pointToGibbsVec(v2)
		v1.toArray(this.geometry.attributes.position.array, 0)
		v2.toArray(this.geometry.attributes.position.array, 3)

		this.geometry.attributes.position.needsUpdate = true
	}
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