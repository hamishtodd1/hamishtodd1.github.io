/*
	Would be nice to have superimposed things have patchwork

	When cancelling mirrors, can't do it if they square to 0
		The thing that happens is that the sphere stays in place, the plane can translate all it likes

	You type in one thing
	You type in another thing
	It visualizes the two and animates them collapsing
	Initial example

	The thing splitting into its differently-graded parts

	The "pair of overlapping planes" is very much a thing


	Show:
		You get rid of reflections two at a time
		You can't get rid of e0. Can use lower-dimensional analogy to explain why
		A given gauge is “applying a transform to a pair of planes”
		Why in the quaternions, ij = k   (e12*e23=e1223=e13)
		Yes, if you have two reflections side by side like e12, you can turn that into -e21
		There is no such thing as a "screwflection" in 3D	
		Mirrors "cancel" in a manner at least slightly analogous to common factors


	First figure out exactly where it fits in
	Should you do it in the context of ed? Might make sense, sounds like you're not making new visualizations!

	As an ed thing:
		The animation replaces the lines with the right-angle-crossed mirrors
		Lets you label!

	Ed does the coordinate system, this does the metric part
	
	Want to have labels of the elements GEE IF ONLY THERE WERE SOME WAY
	Ideally, you can show doing stuff to the algebra
	
	You can never gauge elements away from the surface
	The infinity sphere is best thought of as ePlusMinus

	Maybe this thing should also have:
		-the sandwich. And therefore presumably orientations!
		-show lots of 2D so you can say the eye thing
		-Is there a gauge visualization for commuting two planes? Applying one of the reflections, perhaps
*/

function initGauge() {
	
	// function getAppearancesOfType(name) {
	// 	return appearanceTypes.find((at) => at.glslName === name && !at.isArray).appearances
	// }
	// let dqAppearances = getAppearancesOfType( "Dq" )
	// let planeAppearances = getAppearancesOfType("Plane")
	// let pointAppearances = getAppearancesOfType("vec4")

	let planes = []
	let planeGeo = new THREE.CircleBufferGeometry(2., 32)
	function MakePlane(col) {
		let ret = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.35,
			side: THREE.DoubleSide, //alternatively, could make them cylinders
			color: col
		}))
		planes.push(ret)
		dws.euclidean.addNonMentionChild(ret)
		ret.mv = new Mv()
		return ret
	}

	function Make2Planes(dq,col) {
		let planes = [MakePlane(col), MakePlane(col)]

		planes[0].mv.plane( 0., Math.random(), Math.random(), Math.random()).normalize()

		let dqSqrt = dq.sqrt(dq0).toMv(mv3)
		let linePart = dqSqrt.selectGrade(2,mv0)
		//the below won't work if eNorm === 0
		planes[0].mv.projectOn( linePart, planes[0].mv )
		dqSqrt.sandwich( planes[0].mv, planes[1].mv )
		// planes[1].mv.copy(planes[0].mv)

		return planes
	}

	updateFunctions.push(() => {
		planes.forEach( (plane) => {
			threejsPlaneTransformFromPlaneMv( plane, plane.mv )
		})
	})

	let sounds = {};
	let fileNames = [
		"pop1",
		"pop2",
		"pop3",

		"break",

		"rotateTick",

		"grow",
		"shrink"
	];
	for (let i = 0; i < fileNames.length; i++) {
		sounds[fileNames[i]] = new Audio(`https://hamishtodd1.github.io/ga/common/data/sounds/` + fileNames[i] + `.mp3`);
		sounds[fileNames[i]].crossOrigin = 'anonymous'
	}
	
	document.addEventListener('keydown',(event)=>{
		// if (event.key !== "`")
		// 	return

		let line = null
		let lines = textarea.value.split(`\n`)
		lines.forEach((theLine)=>{
			if(theLine.indexOf(`mul`) !== -1)
				line = theLine
		})
		let parts = line.split(/\(|\)|,/g)

		let resultVariable = variables.find((v)=>v.name === parts[0].split(" ")[1])
		let resultState = resultVariable.mentions[0].appearance.state

		let inputStates = Array(2)
		let inputVariables = Array(2)
		log(variables.find((v) => v.name === parts[1]))
		inputVariables[0] = variables.find((v) => v.name === parts[1]) //probably shouldn't be 0. Temporary!
		inputVariables[1] = variables.find((v) => v.name === parts[2])
		inputStates[0] = inputVariables[0].mentions[0].appearance.state
		inputStates[1] = inputVariables[1].mentions[0].appearance.state
		
		inputs0Planes = Make2Planes( inputStates[0], inputVariables[0].col)
		inputs1Planes = Make2Planes( inputStates[1], inputVariables[1].col)

		let duration = 2.
		let t = 0.
		//where are we ending up?
		//in this case you have 1+e01
		//consider the plane to be cancelled
		
		updateFunctions.push(()=>{
			t = Math.min( t+frameDelta, duration)

		})

		// sounds.pop1.play()
		// event.preventDefault()
	})
}