async function initSurroundingsAndMaterial() {

	// let rotating = false
	// bindButton("1", () => { rotating = true }, "rotate everything", () => {
	// 	rotating = false
	// },false)

	// updateFunctions.push(() => {
	// 	if (mouse.clicking) {
	// 		mouse.get2dDiff(v0)
	// 		thingsToRotate.forEach((thing) => {
	// 			thing.rotation.y -= v0.x
	// 			thing.rotation.x += v0.y
	// 		})

	// 		spotLight.position.applyAxisAngle(yUnit, -v0.x)
	// 		pedestal.rotation.y += -v0.x
	// 	}
	// })

	// camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2500);
	// camera.position.set(0.0, 4, 4 * 3.5);

	// scene.fog = new THREE.Fog(0x333333, 4., 9.)
	// scene.background = new THREE.Color(0x333333)

	let pedestalDimension =  3.7
	const pedestal = new THREE.Mesh(
		new THREE.BoxGeometry(pedestalDimension, pedestalDimension,pedestalDimension),
		new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
	)
	pedestal.position.y = -1. - pedestalDimension / 2.
	pedestal.receiveShadow = true
	scene.add(pedestal)

	const spotLight = new THREE.SpotLight()
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
        new RGBELoader().load('hamishtodd1.github.io/ga/quantum/data/pedestrian_overpass_1k.hdr', function (texture) {

			texture.mapping = THREE.EquirectangularReflectionMapping;

			niceMat = (hue,extraParams) => {
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

				// let mat = new THREE.MeshPhongMaterial({color:diffuseColor, side:THREE.DoubleSide})

				let params = {
					color: diffuseColor,
					metalness: 0,
					roughness: 0.5,
					clearcoat: 1.,
					clearcoatRoughness: 0.,
					reflectivity: 1.,
					envMap: texture,

					side: THREE.DoubleSide
				}
				Object.assign(params,extraParams)
				let mat = new THREE.MeshPhysicalMaterial(params)

				return mat
			}

			resolve()
		})
	})
}