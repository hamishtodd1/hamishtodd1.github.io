/*
	Focus on the maths and build animations out of that for a while
	this is not doodling!
	definitely want to doodle with process

	Technical
		possibly should be able to hotload
		Better to save as JSON (this basically already is?)
		Level editor is shader programmer?

	Abstract level ideas
		Early puzzle about separating orth and para parts of vec
		Make a torus knot
		Animation of the angles and squares attached to a right triangle and you figure out a2+b2=c2 cos whatever
		For a given vector, you can multiply it by I to get a bivec and add some scalar to get a quay. What'sthe relationship between that quat and that vector?
		You can totes do rotation right now, just have a small complex number. At the same time, don't avoid e^ for the wrong reasons like laziness
		General ideas that might lead to levels
			A part where you derive the length of a vector. Even that drops out!
			Knowing distributivity lets you reduce
			Puzzles based around Orientation could be about a snake trying to eat an apple
		Can prove dot product is commutative by induction
		A basic smooth input thing to do would be series of numbers to corkscrew
		the threejs demo with the parented cubes
		A puzzle where there are 2 inputs and 2 outputs. One pair seems easy. The other appears to be blank- it's 0. Player has to understand this
		Puzzle such that for each vector you must make the bivector of it and the X axis
		Get in-plane component
		Make rotor from axis and angle

		Simple input output one: a bunch of vectors and you rotate them a little
			changing basis vectors

		Simple input output one: a bunch of vectors and you rotate them a little

	Levels:
		Scalar multiplication is the first aspect of the clifford product to show
		Add only, diagonal
		Add only, two along three up
		"Double the size of this" - shows elegance of scalar multiplication
		People like animals! Dung beetle rolls dung for the turning
		it would be funny to have 0 as a goal!

	More aspects of 2D multiplication and addition needs to be visualized
		Coplanar bivector addition - easy and fun
		Vector addition - just do something
		Vector multiplication - need both scalar and bivector part
		Scalar multiplication - obvious, duplication then addition
		Coplanar bivector multiplication - complex multiplication!
		Bivector-vector multiplication
		Bivector multiplication???

	General structure
		Addition only, scalars only
		Addition only, vectors only
		Addition only, bivectors only
		multiplication and addition, scalars
		multiplication and addition, scalars and vectors
		multiplication and addition, scalars and bivectors
*/

function Levels()
{
	let arr = [
	/*
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
	*/
		{
			singularGoal:
				new Float32Array([5., 0., 0., 0., 0., 0., 0., 0.]),
			options: [
				new Float32Array([2.3, 0., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([-3.8, 0., 0., 0., 0., 0., 0., 0.]),
			],
			operators: [geometricSum]
		},

		
		{
			singularGoal:
				new Float32Array([0.,1.,1.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum]
		},
		{
			singularGoal: 
				new Float32Array([5.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum]
		},
		{
			singularGoal: 
				new Float32Array([6.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([2.,0.,2.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,1.,0.,0.,0.]),
			options: [
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricProduct]
		},

		{
			singularGoal:
				new Float32Array([0., -1., -1., 0., 0., 0., 0., 0.]),
			options: [
				new Float32Array([0., 1., 1., 0., 0., 0., 0., 0.]),
				new Float32Array([0., 0., 0., 0., 1., 0., 0., 0.]),
				new Float32Array([0., 0., 0., 0., 1., 0., 0., 0.]),
			],
			operators: [geometricProduct, geometricSum, geometricProduct]
		},
		
		{
			singularGoal:
				new Float32Array([0., 3., 2., 0., 0., 0., 0., 0.]),
			options: [
				new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([0., 0., 1., 0., 0., 0., 0., 0.]),
				new Float32Array([3., 0., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([2., 0., 0., 0., 0., 0., 0., 0.]),
			],
			operators: [geometricSum, geometricProduct, geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0., 3., -2., 0., 0., 0., 0., 0.]),
			options: [
				new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([0., 0., 1., 0., 0., 0., 0., 0.]),
				new Float32Array([3., 0., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([-2., 0., 0., 0., 0., 0., 0., 0.]),
			],
			operators: [geometricSum, geometricProduct, geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([-1., 0., 0., 0., 0., 0., 0., 0.]),
			options: [
				new Float32Array([0., 2., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([0., -3., 0., 0., 0., 0., 0., 0.]),

				new Float32Array([0., 0., 1., 0., 0., 0., 0., 0.]),
				new Float32Array([0., 0., 0., 0., -1., 0., 0., 0.]),
			],
			operators: [geometricSum, geometricProduct, geometricProduct]
		},

		{
			inputs: [ //"0"
				new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([0., 0., 1., 0., 0., 0., 0., 0.]),
			],
			options: [
				new Float32Array([2., 0., 0., 0., 0., 0., 0., 0.]),
				new Float32Array([3., 0., 0., 0., 0., 0., 0., 0.]),

				// // new Float32Array([Math.cos(TAU / 8.), 0., 0., 0., Math.sin(TAU / 8.), 0., 0., 0.]),
			],
			steps: [
				//don't worry about them being deleted
				[geometricSum, 0, 1], //result is "3"
				[geometricProduct, 2, 3],
			],
			operators: [geometricSum, geometricProduct]
		},
	]

	let browserIsChrome = false;
	for (i = 0; i < navigator.plugins.length; i++)
	{
		if (navigator.plugins[i].name == 'Chrome PDF Viewer')
		{
			browserIsChrome = true
			break
		}
	}
	if(!browserIsChrome)
		return arr

	let videoLevels = [{
		videoDetails: {
			filename: "hoberman",
			startTime: .1,
			endTime: 7.7,
			markerTimes: [4.5,7.2],
		},
		options: [
			new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
		],
		operators: [
			geometricSum,
			geometricProduct
			]
	},
	{
		videoDetails: {
			filename: "dzhanibekov",
			startTime: 0.,
			endTime: 8.,
			markerTimes: [4.,5.5,7.],
		},
		options: [
			new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
		],
		operators: [geometricSum,geometricProduct]
	}]
	/*
		{
			filename: "dzhanibekov",
			startTime: 0.,
			endTime: 8.,
			markerTimes: [4.,5.5,7.],
		},
		{
			filename: "segerman",
			startTime: 0.,
			endTime: Infinity,
			markerTimes: [3.4,7.2],
		},
	*/
	
	// arr[0] = videoLevels[0]
	return arr
}