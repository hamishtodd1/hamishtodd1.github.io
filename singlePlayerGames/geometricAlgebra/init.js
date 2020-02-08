/*
	TODO for Cambridge
		Real levels
		Would be nice to have one time thing and one differential geometry thing
		And just some videos plus extracting pictures
		Would be nice to at least have parallelogram liquid sim to show your ambition

	TODO for slack
		Every aspect of the multiplication and addition needs to be visualized. Well, for 2D!
			Coplanar bivector addition - easy and fun
			Vector addition - just do something
			Vector multiplication - need both scalar and bivector part
			Scalar multiplication - obvious, duplication then addition
			Coplanar bivector multiplication - complex multiplication!
			Bivector-vector multiplication
			Bivector multiplication???

	TODO sandbox / tool for thought
	AR https://jeromeetienne.github.io/AR.js/three.js/examples/basic.html
	Helping make shaders
		Parametric geometry - can feed in either line or grid
		Ideally you paste and it tells you what it thinks you pasted
		Spit out glsl?
		Heh, have it be possible for the input and output to be arranged in a rectangle with x and y smoothly varying, i.e. a framebuffer
	A nice thing to do at a live coding event if nothing else
		Folks can see what you're doing
		Your hand covers a small surface and your hand is big
		Music
			https://www.youtube.com/watch?v=R_Rfkhg7s_M 
			https://www.youtube.com/watch?v=EtEOl-xJTg8

	TODO for GDC
		A fast to access webpage
		With something that creates surprises and communicates its purpose in 45s
		And can show something quaternion-related in short order

	TODO for academic course (not much effort)
		record a bunch of videos in zeimlight style
		Link it to the ordinary way of visualizing things, brackets and numerals

	Long term
		Oculus quest / hololens thing where you record a video, and it automatically takes the frames
		They should be able to rearrange multivectorScope, and delete bits of it
		Have a "superimpose everything so it's in the same coord system" button
		Zoom out every time multivectorScope gets big
		Bootstrapping!
			Maybe you should use GA for your camera projection and that should be considered part of the system
			After all, if you pick up a vector and rotate it it can be rotated to become its negative
			Rotating the basis vectors rotates eeeeverything
			If you rotate a vector, well, it is a different vector
		So how about when you have too many multivectors in your multivectorScope?
			Could rearrange to put recent ones at top
			Could pack rectangles
			Scrollbar
*/

async function init()
{
	// await initBivectorAppearance()
	// return

	initMultivectorAppearances()
	await initOperatorAppearances()

	// initWheelScene()
	// return

	// if(0)
	{
		initVideo()

		let v = [
			{
				filename: "segerman",
				startTime: 0.,
				endTime: 10.,
				markerTimes: [3.4,5.3,7.2],
			},
			{
				filename: "hoberman",
				startTime: .1,
				endTime: 7.7,
				markerTimes: [3.4,5.3,7.2],
			},
			{
				filename: "dzhanibekov",
				startTime: .1,
				endTime: 7.7,
				markerTimes: [3.4,5.3,7.2],
			},
		]
		for(let j = 0; j < v.length; j++)
		{
			v[j].markerPositions = Array(v[j].markerTimes.length)
			for(let i = 0; i < v[j].markerTimes.length; i++)
			{
				v[j].markerPositions[i] = new THREE.Vector3(
					camera.rightAtZZero * .5,
					-(i-(v[j].markerTimes.length-1)/2.)*2.,
					-.01 )
			}
		}
		await doVideoThing(v[0].filename,v[0].startTime,v[0].endTime,v[0].markerTimes,v[0].markerPositions)
	}

	initOperationInterface()

	let modeChange = {}
	initPlayModes(modeChange)
	// modeChange.campaign()

	await initMenu(modeChange)
}