/*
	https://www.geogebra.org/m/kvy5zksn
	Anthony Howe kinetic masterpieces

	Wanna be able to program your own visualization, then use that to visualize your program

	Have a mode where all the things in your scope have the same origin. I.e. they're on a scene.

	Mocap markers are cheap! https://mocapsolutions.com/collections/mocap-solutions-markers

	These animations- you must make them using the system, the player is to reverse-engineer them

	Little games for kids to make
		They need a handle with three points
		Throw frisbees into goals
		Kids making semi realistic laser guns with limited resources?
		You know so little about multiplayer design beyond articulate. Keep it simple I guess...
		Swooshy veil behind sword
		whip

	They share levels, you just need to know locations

	Notes
		All the multivectors coming from the pictures should stay inside the animation, no need to have a clone of them in the scope
		so you're modelling the differential apparently
		A better representation of a thing over time might be its worldline with timestamps labelled
		the basis vectors should be inside the scene
		is there an elegant way to feed back into the scene?
			the "real" ones are frozen in place, when you click them they're cloned
		The thinking is: you are trying to go from t = a to t = a + epsilon
			This tries to avoid numerical analysis. That might be impossible / foolish
		Maybe you're always modelling the time evolution of something in which case it's a simple number as input.
		But "reaction to different parameters and events" is interesting which is why getting the differential between two frames may be more versatile

	Properties of ideas
		Should be "satisfying" stuff. Look at "most satisfying video"
		Juicey
		Look to Rhythm Paradise for inspiration
		you want to put random things in the littlescene. That's how you make cool demoscene stuff
		It should mostly be about mechanics to be a fun easy thing for people to do in their lives with AR
			Look through mechanics textbooks for examples

	Main dude for QC tim@energycompression.com
		You know, you're just barrelling into QC assuming CA is a good fit for it, maybe it isn't. Well. If it isn't, maybe don't work on this.

	First example
		Ball shot from cannon
		And then a nice step up is 

	Structure based around rocket science
		Could talk to isaac arthur
		Classical mechanics / mechanical engineering
			poi! fire poi with sparks!
			https://twitter.com/MachinePix/status/1249390426672361472
			it is very interesting that .5mv^2 works if v is squared using the Clifford product
			just moving the things around, rockets innit
			Thrusters in different directions
			guidance computer using gimbals
			fireworks
			Lunar Lander type game
		Electromagnetism:
			Electrically powered rockets https://en.wikipedia.org/wiki/Electrically_powered_spacecraft_propulsion
			telescope optics,
			telecommunicatio/satellites. No magnets but this may not matter
			Magneto dynamics! Of the sun or earth!
			Lightning, it's badass
		quantum
			If you have a vector and bivector together being a wave function with mod squared equal to 1, and vector is determined, what does that mean for bivector?
			nuclear powered rockets
			Not putting stuff in the van allen belt
			ion thrusters?
			nuclear fusion
		spec rel
			super fast rockets
		Relativistic QM?
		Quantum computing somehow?
			https://www.youtube.com/watch?v=F_Riqjdh2oM
		To make a thing about real rocket science you ought to have super awesome heart-swelling animations, hngh
			How to do it on the cheap: public domain NASA footage, plasma drive, ITER stuff with heart-swelling music
		Magnetised needly droplet going around it

	General ideas / mario-esque "areas"/islands
		Lasers may be a better central focus. EM AND QM AND a link to rocketry
		Could have a major thing about programming robots. It will be pretty important!
		How fast does glass crack https://www.youtube.com/watch?v=GIMVge5TYz4
		Quantum mechanics
			/Electromagnetism/Optics
				Reflections
			/Electrical engineering
			a vector of complex numbers can separate into a vector and bivector (i*vector) parts?
			3 states are used in this thing on bell https://freelanceastro.github.io/bell/
			Chromodynamics
				Got three nice variables(?)
				Applicable to nuclear power which is rather mysterious
		Planetary motion
			A bomb going off and lots of pieces of shrapnel. You have to do lots of them
		Mechanical engineering
			Bottle rocket
			A pair of curling stones attached with elastic on an ice rink
			Two minute paper Sims like the hair water one might be nice to try to replicate
			Mech engineering wise, you try to simulate Lego.. for eg designing the 4 speed transmission box
			Different sized cylinders rolling down straight slope
			Make a clock! Haha it's literally euler. Grandfather clock would be nice
			https://twitter.com/raedioisotope/status/1257135705030922240
			programming the spaceX booster landing
			Cogs
				funky mechanical leg https://youtu.be/wFqnH2iemIc?t=46
				Another nice cog https://youtu.be/SwVWfrZ3Q50?t=306
			Wave stairs that make marbles go up https://youtu.be/SwVWfrZ3Q50?t=353
			car engine like? https://youtu.be/SwVWfrZ3Q50?t=443
			moire patterns?
			trammel of archimedes https://youtu.be/SwVWfrZ3Q50?t=102
			conservation of angular momentum https://youtu.be/SwVWfrZ3Q50?t=242
			Some nice gears like one that gets pushed forward and does a figure of 8 or whatever
			Dice with constant angular momentum spinning in zero gravity
			Bicycle chain
			The machinery you have on the wheels of trains
			What's an example of adding torques?
			ink coming out of spinning pens https://www.youtube.com/watch?v=FOJ7JAUK6EU
			Coat hanger maker https://youtu.be/uuj6NLCG0vM?t=441
			Whip
			Constraint solving https://zalo.github.io/blog/constraints/
			Basketball bounce
			taco folding https://youtu.be/xWG5Jx66VzQ?t=400
			cog thing https://youtu.be/IjeKw0B8PG8
			pizza https://twitter.com/Rainmaker1973/status/1084064448690774016
		Condensed matter / "spatially extended" / the input is a big rectangle of values
			mandelbrot set
		Toys
			Stick and slip bird mechanism
			physics fun instagram
			Balancing https://youtu.be/mwzExNYs12Y?t=144
			beesandbombs
			Slinky https://youtu.be/Em6krJvumkI?t=422
			Sprinkler https://youtu.be/Em6krJvumkI?t=471
			A coiled up fern unrolling
			keenan crane "cross fields" https://twitter.com/keenanisalive/status/1155851119987290113
			Bubbles https://youtu.be/uuj6NLCG0vM?t=37
			harmonic water droplet https://twitter.com/bencbartlett/status/1172932701722009600
		Animals / humans, literally film them
			Swings
			Looks like fun https://youtu.be/mwzExNYs12Y?t=541
			Skiing?
			People pushing against one another https://twitter.com/robertghrist/status/1113952877733658624 a different person withdraws their hand
			Bicycle flip https://youtu.be/IjeKw0B8PG8?t=278
			Snooker
			Snooker on a tilted table
			Look in AR thing, arranged by ease of computer-visioning
			Ping pong
			sport eg spinning tennis ball hitting ground
			Classic: person walking on a train
			A puppy that is enjoying licking a lolly. The lolly moves away ordinarily, but if you can get its jetpack to follow the lolly it can continue licking
			Bee going from flower to flower
			Curling stones
			Diver
			Dancer
			Juggler. Lots of circus skills
				https://www.youtube.com/watch?v=9GOEz7FEh88 ribbon tutorial, great
			someone going down a helter skelter
			Someone is about to set of a spinning top
				you can change the amount of angular momentum they put into it by changing the size of their bicep
*/

function initClickyVideo()
{
	let video = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial())
	video.position.z = .01
	scene.add(video)
	video.material.map = new THREE.VideoTexture()
	video.material.map.minFilter = THREE.LinearFilter

	let startTime = 1.
	let endTime = 7.7
	let numFramesAdvanced = 0.


	
	let videoDomElement = document.createElement( 'video' )
	videoDomElement.style = "display:none"
	videoDomElement.crossOrigin = 'anonymous'
	videoDomElement.loop = false
	videoDomElement.muted = true
	video.material.map.image = videoDomElement

	let outputs = []
	bindButton("space",function()
	{
		log(outputs.toString())
	})

	let clickingMode = false

	videoDomElement.currentTime = startTime
	videoDomElement.paused = true
	videoDomElement.src = "data/videos/hoberman.mp4"
	videoDomElement.load()
	videoDomElement.onloadeddata = function ()
	{
		updateFunctions.push(function()
		{
			video.scale.x = camera.rightAtZZero * 2.
			video.scale.y = video.scale.x * (videoDomElement.videoHeight / videoDomElement.videoWidth)

			if (mouse.clicking && !mouse.oldClicking)
			{
				v1.copy(mouse.getZZeroPosition())
				video.worldToLocal(v1)
				outputs[numFramesAdvanced * 2 + 0] = v1.x
				outputs[numFramesAdvanced * 2 + 1] = v1.y

				++numFramesAdvanced
				//god it's slow. Could have two copies of the video and flick back and forth?
				videoDomElement.currentTime = startTime + numFramesAdvanced / 29.97
			}
		})
		if (clickingMode)
			videoDomElement.play()
	}

	if (clickingMode)
	{
		let realEnd = [0.004872107186358113, 0.002165380971714696, 0.02801461632155912, 0.0010826904858573484, 0.04019488428745435, 0.0021653809717146967, 0.052984165651644335, 0, 0.06333739342265536, 0, 0.07490864799025579, 0, 0.08708891595615101, -0.002165380971714696, 0.0980511571254568, -0.0043307619434293934, 0.1084043848964678, -0.0021653809717146967, 0.11936662606577346, -0.0043307619434293934, 0.1297198538367845, -0.005413452429286794, 0.13946406820950066, -0.006496142915144089, 0.14859926918392213, -0.007578833401001489, 0.15590742996345927, -0.0054134524292867945, 0.1644336175395859, -0.00757883340100149, 0.17113276492082835, -0.00757883340100149, 0.17783191230207074, -0.008661523886858893, 0.1833130328867236, -0.008661523886858891, 0.18940316686967126, -0.008661523886858891, 0.19427527405602923, -0.007578833401001489, 0.19792935444579796, -0.00757883340100149, 0.20036540803897693, -0.00649614291514409, 0.2015834348355665, -0.0054134524292867945, 0.2040194884287455, -0.0043307619434293934, 0.2040194884287455, -0.0043307619434293934, 0.20523751522533507, -0.003248071457572098, 0.20523751522533504, 0, 0.2046285018270403, 0.0010826904858573484, 0.2040194884287455, 0.0021653809717146967, 0.20280146163215607, 0.006496142915144143, 0.20097442143727176, 0.00757883340100149, 0.19853836784409273, 0.007578833401001492, 0.1967113276492084, 0.00757883340100149, 0.1930572472594399, 0.00757883340100149, 0.1906211936662607, 0.010826904858573589, 0.18574908647990263, 0.010826904858573589, 0.18209500609013407, 0.011909595344430937, 0.17783191230207074, 0.014074976316145632, 0.1723507917174178, 0.014074976316145633]
		let mvEndValues = Array(200)
		let mvOriginValues = Array(200)
		for (let i = 0; i < mvOriginValues.length/2.; i++)
		{
			mvOriginValues[i * 2 + 0] = 0.
			mvOriginValues[i * 2 + 1] = 0.

			if (i * 2 + 1 < realEnd.length)
			{
				mvEndValues[i * 2 + 0] = realEnd[i * 2 + 0]
				mvEndValues[i * 2 + 1] = realEnd[i * 2 + 1]
			}
			else
			{
				mvEndValues[i*2+0] = 1.2 + Math.sin(i * .02)
				mvEndValues[i*2+1] = 1.0 + Math.sin(i * .03)
			}
		}

		let mv = MultivectorAppearance(function () { }, [0., 1., 0., 0., 0., 0., 0., 0.])
		scene.add(mv)
		updateFunctions.push(function ()
		{
			if(frameCount*2+1>mvOriginValues.length-1)
				return

			let frameNumber = Math.round( (videoDomElement.currentTime - startTime) * 29.97 ) //floor?
			if (!(frameNumber > 0.) || !(frameNumber < mvOriginValues.length / 2. ) )
				return

			v1.set(
				mvEndValues[frameNumber * 2 + 0] - mvOriginValues[frameNumber * 2 + 0],
				mvEndValues[frameNumber * 2 + 1] - mvOriginValues[frameNumber * 2 + 1],
				0.
			)
			video.localToWorld(v1)

			mv.position.x = v1.x / 2.
			mv.position.y = v1.y / 2.

			mv.elements[1] = v1.x
			mv.elements[2] = v1.y
			mv.updateAppearance()
		})
	}
}

setVideo = async function(){console.error("Video can only be played on chrome!")}
function initVideo(goalOutputGroup)
{
	let video = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial())
	video.position.z = .01
	video.material.map = new THREE.VideoTexture()
	let wantedOnScreen = false
	clickables.push(video)
	let onscreenness = 0.
	let offscreenX = 0.
	let onscreenX = -.5 * camera.rightAtZZero
	let intendedOutputScale = new THREE.Vector3()
	let outputs = Array(10)
	for(let i = 0; i < outputs.length; i++)
		outputs[i] = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture() }))

	let videoDomElement = document.createElement( 'video' )
	videoDomElement.style = "display:none"
	videoDomElement.crossOrigin = 'anonymous'
	videoDomElement.loop = false
	videoDomElement.muted = true
	// videoDomElement.playbackRate = .5

	//hack
	let notAlreadyUpdating = true

	setVideo = async function( filename, startTime, endTime, outputTimes )
	{
		console.assert( outputs.length >= outputTimes.length )

		if( startTime <= 0. ) //because first frame
			startTime = .04

		function trigger()
		{
			if( !wantedOnScreen )
			{
				wantedOnScreen = true
				videoDomElement.currentTime = startTime
				videoDomElement.paused = true
			}
		}
		video.onClick = trigger
		trigger()

		videoDomElement.src = "data/videos/" + filename + ".mp4"
		videoDomElement.load()
		videoDomElement.onloadeddata = function()
		{
			scene.add(video)
			video.scale.y = videoDomElement.videoHeight / videoDomElement.videoWidth
			video.scale.multiplyScalar(camera.rightAtZZero * .98)
			offscreenX = camera.rightAtZZero + .5 * video.scale.x - .4
			video.material.map.minFilter = THREE.LinearFilter
			video.material.map.image = videoDomElement

			let intendedPosition = new THREE.Vector3()
			function update()
			{
				onscreenness += frameDelta * .75 * (wantedOnScreen?1.:-1.)
				onscreenness = clamp(onscreenness,0.,1.)
				video.position.x = (.5+.5*-Math.cos(onscreenness*Math.PI)) * (onscreenX-offscreenX) + offscreenX

				if( wantedOnScreen && onscreenness === 1.)
				{
					if( videoDomElement.currentTime === startTime )
						videoDomElement.play()

					if( videoDomElement.currentTime >= endTime )
						videoDomElement.pause()

					if( videoDomElement.paused ) //if there's no endTime
						wantedOnScreen = false
				}

				intendedOutputScale.copy(video.scale)
				intendedOutputScale.multiplyScalar(Math.abs(goalOutputGroup.things[1].position.y - goalOutputGroup.things[0].position.y) * .95 / intendedOutputScale.y)

				for(let i = 0; i < outputTimes.length; i++)
				{
					if( videoDomElement.currentTime > outputTimes[i] )
					{
						if(outputs[i].parent === null)
						{
							outputs[i].material.map.image = videoDomElement
							outputs[i].material.map.needsUpdate = true
							outputs[i].scale.copy(video.scale)
							outputs[i].position.copy(video.position)
							scene.add(outputs[i])
						}

						intendedPosition.copy(goalOutputGroup.things[i].position).add(goalOutputGroup.position)
						outputs[i].position.lerp(intendedPosition,.1)
						let t = outputs[i].position.distanceTo(intendedPosition)
							/video.position.distanceTo(intendedPosition)
						outputs[i].scale.lerpVectors(intendedOutputScale,video.scale,t)
					}
					else
					{
						scene.remove(outputs[i])
					}
				}
			}
			if(notAlreadyUpdating)
				updateFunctions.push(update)
			notAlreadyUpdating = false
		}
	}
}

async function initWheelScene()
{
	let littleScene = new THREE.Group()
	littleScene.scale.setScalar(4.4)
	// littleScene.position.y += 3.88
	scene.add(littleScene)

	let background = new THREE.Mesh(new THREE.PlaneGeometry(1.7,.9), new THREE.MeshBasicMaterial({color:0x00AAAA}))
	background.position.z -= .01
	littleScene.add(background)

	let muddyTrail = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(),new THREE.MeshBasicMaterial({color:0x65370E}))
	muddyTrail.scale.y = .035
	muddyTrail.scale.x = .001
	littleScene.add(muddyTrail)
	muddyTrail.position.x -= .53
	muddyTrail.position.y -= .37

	// littleScene.visible = false

	// bestowConnectionPotential(muddyTrail,function(multivec)
	// {
	// 	multivec.setScalar(muddyTrail.scale.x)
	// } )

	let wheelRadius = .11
	let wheel = new THREE.Mesh(new THREE.PlaneGeometry(wheelRadius*6*2.,wheelRadius*6*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/wheel.png",function(texture){
		wheel.material.map = texture
		wheel.material.needsUpdate = true
	})
	wheel.position.copy(muddyTrail.position)
	wheel.position.y += wheelRadius
	littleScene.add(wheel)

	//https://imgbin.com/png/gNnWnJyC/clown-unicycle-png
	let clown = new THREE.Mesh(new THREE.PlaneGeometry(wheelRadius*6*2.,wheelRadius*6*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/clown.png",function(texture){
		clown.material.map = texture
		clown.material.needsUpdate = true
	})
	littleScene.add(clown)

	let flowerRadius = wheelRadius * .5
	let flower = new THREE.Mesh(new THREE.PlaneGeometry(flowerRadius*2.,flowerRadius*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/flower.png",function(texture){
		flower.material.map = texture
		flower.material.needsUpdate = true
	})
	littleScene.add(flower)

	// {
	//	let s = new THREE.Scene()
	
	// 	var texture = new THREE.DataTexture( data, renderer.domElement.width, renderer.domElement.height, THREE.RGBFormat );
	// 	texture.minFilter = THREE.LinearFilter;
	// 	texture.magFilter = THREE.LinearFilter;

	// 	let displayPlane = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture}))
	// 	displayPlane.scale.y = .4;
	// 	displayPlane.scale.x = camera.aspect * displayPlane.scale.y;
	// 	scene.add(displayPlane)

	//	renderer.render( s, camera );
	// }

	let placeStuckOnWheel = new THREE.Vector3(wheelRadius,0.,0.)

	let playing = true

	clickables.push(background)
	background.onClick = function()
	{
		if(playing === false)
		{
			playing = true
			wheel.position.x = muddyTrail.position.x
		}
	}

	{	
		let signSize = .14

		var winSign = makeTextSign("Yum!",false,false,true)
		winSign.scale.multiplyScalar(signSize)
		littleScene.add(winSign)
		winSign.depthTest
		winSign.visible = false

		var loseSign = makeTextSign("I'm thirsty!",false,false,true)
		loseSign.scale.multiplyScalar(signSize)
		littleScene.add(loseSign)
		loseSign.depthTest
		loseSign.visible = false
	}

	let goalMultivector = MultivectorAppearance(function(){})
	let placeForEndToBe = new THREE.Vector3()
	let timerMultivector = MultivectorAppearance(function(){})
	//p = (1.,0.,0.) * -i^t + (t.,1.,0.)
	//can say radius = 1 because we choose the units
	let bases = Array(2)
	bases[0] = MultivectorAppearance(function(){},new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]))
	bases[1] = MultivectorAppearance(function(){},new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]))
	bases[0].position.x -= 3.5
	bases[1].position.x -= 3.5
	bases[0].position.y -= 1.8
	bases[1].position.y -= 1.8
	bases[0].position.x += .5
	bases[1].position.y += .5
	timerMultivector.position.set(bases[0].position.x,bases[0].position.y,0.)

	updateFunctions.push( function()
	{
		if(wheel.position.x > -muddyTrail.position.x)
		{
			playing = false
		}

		let rotationAmount = playing?.04:0.;
		wheel.rotation.z -= rotationAmount
		let arcLength = rotationAmount * wheelRadius
		wheel.position.x += arcLength
		wheel.updateMatrix()

		flower.position.copy(placeStuckOnWheel)
		flower.rotation.copy(wheel.rotation)
		flower.position.applyMatrix4(wheel.matrix)

		muddyTrail.scale.x = wheel.position.x - muddyTrail.position.x
		muddyTrail.visible = muddyTrail.scale.x !== 0.

		{
			goalMultivector.position.copy(muddyTrail.position)
			littleScene.localToWorld(goalMultivector.position)
			
			placeForEndToBe.copy(flower.position)
			littleScene.localToWorld(placeForEndToBe)
			placeForEndToBe.sub(goalMultivector.position)

			copyMultivector(placeForEndToBe, goalMultivector.elements)
			goalMultivector.updateAppearance();
			placeForEndToBe.multiplyScalar(.5)
			goalMultivector.position.add(placeForEndToBe)

			timerMultivector.elements[0] = -wheel.rotation.z / TAU
			timerMultivector.updateAppearance()
		}

		clown.position.copy(wheel.position)
	})

	return littleScene
}

async function initTankScene()
{
	let littleScene = new THREE.Group()
	littleScene.scale.setScalar(4.4)
	// littleScene.position.y += 3.88
	scene.add(littleScene)

	let background = new THREE.Mesh(new THREE.PlaneGeometry(1.7,.9), new THREE.MeshBasicMaterial({color:0x00AAAA}))
	background.position.z -= .01
	littleScene.add(background)

	let tankRadius = .11
	let tank = new THREE.Mesh(new THREE.PlaneGeometry(tankRadius*6*2.,tankRadius*6*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/tank.png",function(texture){
		tank.material.map = texture
		tank.material.needsUpdate = true
	})
	tank.position.x -= .53
	tank.position.y -= .37
	littleScene.add(tank)

	let shell = new THREE.Mesh(new THREE.SphereBufferGeometry(.1))
	littleScene.add(shell)

	let playing = true

	clickables.push(background)
	background.onClick = function()
	{
		if(playing === false)
		{
			playing = true
			shell.position.x = tank.position.x
		}
	}

	let goalMultivector = MultivectorAppearance(function(){})
	let placeForEndToBe = new THREE.Vector3()
	let timerMultivector = MultivectorAppearance(function(){})
	let bases = Array(2)
	bases[0] = MultivectorAppearance(function(){},new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]))
	bases[1] = MultivectorAppearance(function(){},new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]))
	bases[0].position.x -= 3.5
	bases[1].position.x -= 3.5
	bases[0].position.y -= 1.8
	bases[1].position.y -= 1.8
	bases[0].position.x += .5
	bases[1].position.y += .5
	timerMultivector.position.set(bases[0].position.x,bases[0].position.y,0.)

	updateFunctions.push( function()
	{
		// if(wheel.position.x > -muddyTrail.position.x)
		// {
		// 	playing = false
		// }

		{
			goalMultivector.position.copy(tank.position)
			littleScene.localToWorld(goalMultivector.position)
			
			placeForEndToBe.copy(shell.position)

			copyMultivector(placeForEndToBe, goalMultivector.elements)
			goalMultivector.updateAppearance();
			placeForEndToBe.multiplyScalar(.5)
			goalMultivector.position.add(placeForEndToBe)

			timerMultivector.elements[0] = frameCount * frameDelta
			timerMultivector.updateAppearance()
		}
	})

	return littleScene
}