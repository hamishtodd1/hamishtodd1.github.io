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

	let $video = document.createElement( 'video' )
	$video.style = "display:none"
	$video.crossOrigin = 'anonymous'
	$video.loop = false
	$video.muted = true
	// $video.playbackRate = .5

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
				$video.currentTime = startTime
				$video.paused = true
			}
		}
		video.onClick = trigger
		trigger()

		$video.src = "../common/data/videos/" + filename + ".mp4"
		$video.load()
		$video.onloadeddata = function()
		{
			scene.add(video)
			video.scale.y = $video.videoHeight / $video.videoWidth
			video.scale.multiplyScalar(camera.rightAtZZero * .98)
			offscreenX = camera.rightAtZZero + .5 * video.scale.x - .4
			video.material.map.minFilter = THREE.LinearFilter
			video.material.map.image = $video

			let intendedPosition = new THREE.Vector3()
			function update()
			{
				onscreenness += frameDelta * .75 * (wantedOnScreen?1.:-1.)
				onscreenness = clamp(onscreenness,0.,1.)
				video.position.x = (.5+.5*-Math.cos(onscreenness*Math.PI)) * (onscreenX-offscreenX) + offscreenX

				if( wantedOnScreen && onscreenness === 1.)
				{
					if( $video.currentTime === startTime )
						$video.play()

					if( $video.currentTime >= endTime )
						$video.pause()

					if( $video.paused ) //if there's no endTime
						wantedOnScreen = false
				}

				intendedOutputScale.copy(video.scale)
				intendedOutputScale.multiplyScalar(Math.abs(goalOutputGroup.things[1].position.y - goalOutputGroup.things[0].position.y) * .95 / intendedOutputScale.y)

				for(let i = 0; i < outputTimes.length; i++)
				{
					if( $video.currentTime > outputTimes[i] )
					{
						if(outputs[i].parent === null)
						{
							outputs[i].material.map.image = $video
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
	littleScene.scale.setScalar(14.)
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
	new THREE.TextureLoader().load("../common/data/wheel.png",function(texture){
		wheel.material.map = texture
		wheel.material.needsUpdate = true
	})
	wheel.position.copy(muddyTrail.position)
	wheel.position.y += wheelRadius
	littleScene.add(wheel)

	//https://imgbin.com/png/gNnWnJyC/clown-unicycle-png
	let clown = new THREE.Mesh(new THREE.PlaneGeometry(wheelRadius*6*2.,wheelRadius*6*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("../common/data/clown.png",function(texture){
		clown.material.map = texture
		clown.material.needsUpdate = true
	})
	littleScene.add(clown)

	let flowerRadius = wheelRadius * .5
	let flower = new THREE.Mesh(new THREE.PlaneGeometry(flowerRadius*2.,flowerRadius*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("../common/data/flower.png",function(texture){
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

		console.error("Warning: these two signs were meant to be origin cornered")

		var winSign = text("Yum!")
		winSign.scale.multiplyScalar(signSize)
		littleScene.add(winSign)
		winSign.depthTest
		winSign.visible = false

		var loseSign = text("I'm thirsty!")
		loseSign.scale.multiplyScalar(signSize)
		littleScene.add(loseSign)
		loseSign.depthTest
		loseSign.visible = false
	}

	let goalMultivector = MultivectorAppearance(function(){})
	scene.add(goalMultivector)
	let placeForEndToBe = new THREE.Vector3()
	let timerMultivector = MultivectorAppearance(function(){})
	//p = (1.,0.,0.) * -i^t + (t.,1.,0.)
	//can say radius = 1 because we choose the units
	let bases = Array(2)
	bases[0] = MultivectorAppearance(function(){},new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]))
	bases[1] = MultivectorAppearance(function(){},new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]))
	updateFunctions.push(()=>
	{
		bases[0].position.copy(background.geometry.vertices[2])
		bases[1].position.copy(background.geometry.vertices[2])

		background.updateMatrixWorld()
		background.localToWorld(bases[0].position)
		background.localToWorld(bases[1].position)

		bases[0].position.x += .5
		bases[1].position.y += .5

		timerMultivector.position.set(bases[0].position.x, bases[0].position.y, 0.)
	})

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
			goalMultivector.position.copy(background.geometry.vertices[2])
			background.localToWorld(goalMultivector.position)
			
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
	new THREE.TextureLoader().load("../common/data/tank.png",function(texture){
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