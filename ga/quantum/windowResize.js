/*
	every part of this goes out the window in VR
	It should be the case that if you turn the whole thing upside down it should feel ok
	so fretting about whether up, down, left, right is positive and negative(except relatively) is silly
*/

function initWindowResizeSystemAndSurroundings()
{
	camera.topAtZZero = 1.6 //all derives from this. Tweaked to make 100% look ok on our little preview
	{
		camera.position.z = camera.topAtZZero * 2.; //subjective, how much depth do you want?
		camera.near = .1
		camera.far  = camera.position.z * 16.
	}

	// window.devicePixelRatio, prior to resizing, seems to come from the device. Don't consider it, just changes to it
	//the effect of the below is to make it so that the only change is to the viewport, not to the scene itself
	function respondToResize(event) {
		if (event !== undefined)
			event.preventDefault()

		renderer.setPixelRatio(window.devicePixelRatio)

		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;

		camera.fov = fovGivenCenterToFrameDistance(camera.topAtZZero, camera.position.z)
		camera.rightAtZZero = camera.topAtZZero * camera.aspect

		camera.updateProjectionMatrix();
	}
	window.addEventListener('resize', respondToResize, false);
	respondToResize();
}

function centerToFrameDistance(fov, cameraDistance) {
	return Math.tan( fov / 2. * (TAU/360.) ) * cameraDistance;
}
function fovGivenCenterToFrameDistance(centerToFrame, cameraDistance) {
	return 2 * Math.atan(centerToFrame / cameraDistance) * (360./TAU);
}

function otherFov(inputFov,aspectRatio,inputIsVertical)
{
	var centerToFrameInput = centerToFrameDistance(inputFov,1)
	var centerToFrameOutput = centerToFrameInput;
	if(inputIsVertical)
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput,1);
	return outputFov;
}

async function initLights(shadowCaster) {
	// camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2500);
	// camera.position.set(0.0, 4, 4 * 3.5);

	// scene.fog = new THREE.Fog(0x333333, 4., 9.)
	// scene.background = new THREE.Color(0x333333)

	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(3.7, 3.7),
		new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
	)
	ground.rotation.x = - Math.PI / 2
	ground.position.y = -1.
	ground.receiveShadow = true
	scene.add(ground)

	const spotLight = new THREE.SpotLight()
	spotLight.target = shadowCaster
	spotLight.angle = Math.PI / 14.
	spotLight.penumbra = 0.5
	spotLight.castShadow = true
	spotLight.position.set(-3, 7., 3.)
	scene.add(spotLight)

	scene.add(new THREE.AmbientLight(0x222222))

	// const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
	// scene.add(helper);

	renderer.outputEncoding = THREE.sRGBEncoding
	// renderer.toneMapping = THREE.ACESFilmicToneMapping
	// renderer.toneMappingExposure = 0.75

	await new Promise(resolve => {
		new RGBELoader().load('data/pedestrian_overpass_1k.hdr', function (texture) {

			texture.mapping = THREE.EquirectangularReflectionMapping;

			niceMat = (hue) => {
				const diffuseColor = new THREE.Color().setHSL(hue, 0.5, 0.25)

				// let beta = .4 // https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_variations_phong.html
				// let mat = new THREE.MeshPhongMaterial({
				// 	shininess: 90.,
				// 	reflectivity: beta,
				// 	specular: new THREE.Color(beta * 0.2, beta * 0.2, beta * 0.2),
				// 	color: diffuseColor,

				// 	envMap: texture,
					
				// 	side: THREE.DoubleSide
				// })

				let mat = new THREE.MeshPhysicalMaterial({
					color: diffuseColor,
					metalness: 0,
					roughness: 0.5,
					clearcoat: 1.,
					clearcoatRoughness: 0.,
					reflectivity: 1.,
					envMap: texture,

					side:THREE.DoubleSide
				})

				return mat
			}

			resolve()
		})
	})
}