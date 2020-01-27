/*
	General
		Remember, want to make it so you can doodle! Don't be too a priori!
		the basis vectors should be inside the scene
		is there an elegant way to feed back into the scene?
			the "real" ones are frozen in place, when you click them they're cloned
		The thinking is: you are trying to go from t = a to t = a + epsilon
			This tries to avoid numerical analysis. That might be impossible / foolish

	Properties of ideas
		Should be "satisfying" stuff. Look at "most satisfying video"
		Juicey
		Look to Rhythm Paradise for inspiration
		you want to put random things in the littlescene. That's how you make cool demoscene stuff
		It should mostly be about mechanics to be a fun easy thing for people to do in their lives with AR
			Look through mechanics textbooks for examples

	General ideas / mario-esque "areas"/islands
		Quantum mechanics
			/Electromagnetism/Optics
				Reflections
			/Electrical engineering
			a vector of complex numbers can separate into a vector and bivector (i*vector) parts?
			3 states are used in this thing on bell https://freelanceastro.github.io/bell/
		Planetary motion
		Mechanical engineering
			Cogs
				funky mechanical leg https://youtu.be/wFqnH2iemIc?t=46
				Another nice cog https://youtu.be/SwVWfrZ3Q50?t=306
			Wave stairs that make marbles go up https://youtu.be/SwVWfrZ3Q50?t=353
			car engine like? https://youtu.be/SwVWfrZ3Q50?t=443
			moire patterns?
			trammel of archimedes https://youtu.be/SwVWfrZ3Q50?t=102
			conservation of angular momentum https://youtu.be/SwVWfrZ3Q50?t=242
			Some nice gears like one that gets pushed forward and does a figure of 8 or whatever
			Henry Segerman's weird gears
			Dice with constant angular momentum spinning in zero gravity
			Bicycle chain
			The machinery you have on the wheels of trains
			What's an example of adding torques?
			fireworks
			ink coming out of spinning pens https://www.youtube.com/watch?v=FOJ7JAUK6EU
			Coat hanger maker https://youtu.be/uuj6NLCG0vM?t=441
			Whip
			Constraint solving https://zalo.github.io/blog/constraints/
			Basketball bounce
			taco folding https://youtu.be/xWG5Jx66VzQ?t=400
			cog thing https://youtu.be/IjeKw0B8PG8
			pizza https://twitter.com/Rainmaker1973/status/1084064448690774016
		Special relativity?
		Condensed matter / "spatially extended" / the input is a big rectangle of values
			mandelbrot set
		Toys
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
			someone going down a helter skelter
			Someone is about to set of a spinning top
				you can change the amount of angular momentum they put into it by changing the size of their bicep

	Is there some kind of ink you could mark stuff with that only appears in infared?
*/

async function initVideo()
{
	let chrome = false
	for (var i=0; i < navigator.plugins.length; i++)
	{
		if (navigator.plugins[i].name == 'Chrome PDF Viewer')
			chrome = true
	}
	if(!chrome)
		console.error("Video can only be played on chromium!")

	//details
	let name = "hoberman.mp4"
	let startTime = .1
	let finishTime = 7.7

	let videoDomElement = document.createElement( 'video' )
	videoDomElement.style = "display:none"
	videoDomElement.crossOrigin = 'anonymous'
	videoDomElement.src = "data/" + name
	videoDomElement.loop = false
	videoDomElement.muted = true
	videoDomElement.currentTime = startTime
	// videoDomElement.playbackRate = .3

	await videoDomElement.load()
	await videoDomElement.play()
	videoDomElement.pause()
	let aspect = videoDomElement.videoWidth/videoDomElement.videoHeight //can't get these til you've done the above!

	let videoTexture = new THREE.VideoTexture( videoDomElement )
	videoTexture.minFilter = THREE.LinearFilter
	let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.,1./aspect), new THREE.MeshBasicMaterial({
		map: videoTexture
	}))
	mesh.scale.multiplyScalar(camera.rightAtZZero * 2. - .1)
	scene.add(mesh)

	updateFunctions.push(function()
	{	
		if(videoDomElement.currentTime > finishTime)
			videoDomElement.pause()
	})
}

async function initWheelScene()
{
	await initVideo()
	return

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

	let placeStuckOnWheel = new THREE.Vector3(0.,-wheelRadius*0.5,0.)

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

	updateFunctions.push( function()
	{
		{
			if(wheel.position.x > -muddyTrail.position.x)
			{
				playing = false
			}

			let rotationAmount = 0.;
			if(playing)
			{
				rotationAmount += .04
			}
			wheel.rotation.z -= rotationAmount
			let arcLength = rotationAmount * wheelRadius
			wheel.position.x += arcLength
			wheel.updateMatrix()

			flower.position.copy(placeStuckOnWheel)
			flower.rotation.copy(wheel.rotation)
			flower.position.applyMatrix4(wheel.matrix)

			muddyTrail.scale.x = wheel.position.x - muddyTrail.position.x
			muddyTrail.visible = muddyTrail.scale.x !== 0.

			clown.position.copy(wheel.position)
		}
	})

	return littleScene
}