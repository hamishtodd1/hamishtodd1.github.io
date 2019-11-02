/*

	You are holding a rectangle on which you see a duplicate of the whole video
	But then you can grab the frame and connect it to the frame of your real video
	(and the copy of you does it to the one it is holding, etc)

	Hah, move it all the way towards the camera and it looks normal. And if you move it off screen?

	The picture frame is a funny thing, it is a portal into another world.
	It's funny that our minds buy it, but we don't appreciate that when we walk around and look at pictures
	I think escher wanted to heighten that appreciation 

	Philosophy
		Omission of the singularity
		Look closely at the area around the singularity. It's not so hard to see what's going on if you do that
		The size of the scaling is what makes escher's version weirder than most
		If the loop is tightened, it becomes completely undefined to ask "am I in the real world or the picture?"
		The inclusion of the window is a good idea
		I, possibly because I am a westerner, look at the top left first and my eyes go right
			As you walk around you can ask "am I looking at the picture or the real world, which contains the picture?"


	Hofstadter stuff?
		Would make it harder to make this silent

	Take some object out of the frame, give some object to yourself, tug of war over it

	Pick up the image and adjust parameters for stuff like this?
		http://escherdroste.math.leidenuniv.nl/index.php?menu=im&sub=escher&show=-1x1
		Hey, maybe it's just the droste effect, not that clever? Or maybe it is more clever?

	You scale it with your hands, while keeping or not keeping camera in place
		It gets scaled around the vanishing point
		Your hands define a line segment that stays the same size on the screen

	You deffo have to render the real world once
	Then, yeah, put it in a texture in the scene you see

	do you 

	He's cheating really, pretending that the picture contains the person when really it contains another, smaller, person

	Script
		Pick up TV, "turn it on"

	If you save all the frames -without the image on top- you can generate many layers down and no resolution loss
*/

async function initEscher()
{
	var data = new Uint8Array( renderer.domElement.width * renderer.domElement.height * 3 );
	var texture = new THREE.DataTexture( data, renderer.domElement.width, renderer.domElement.height, THREE.RGBFormat );
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	var bottomLeft = new THREE.Vector2(0,0)

	let loader = new THREE.OBJLoader()

	let material = new THREE.ShaderMaterial( {
		uniforms:
		{
			"lastFrame":	{ value: texture }, //can you just put the framebuffer straight in there?
			"framePosition": { value: new THREE.Vector2() },
			"bottomUnit": { value: new THREE.Vector2(1,0) },
			"sideUnit": { value: new THREE.Vector2(0,1) },
		},
		fragmentShader: [
			'uniform sampler2D lastFrame;',
			'varying vec2 vUV;',

			// 'varying vec2 ndcV;',

			'void main()',
			'{',
				// 'if(gl_FragCoord.z > .98)', //something like this?
				// '{',
				// 	'discard;',
				// '}',

				// ndcV.x = 

				'vec4 rgba = texture2D(lastFrame, vUV);',
				'gl_FragColor = rgba;',
			'}'
		].join( '\n' ),
		depthTest: false
	} );
	await assignShader("escher", material, "vertex");

	let screen = new THREE.Mesh(new THREE.PlaneGeometry(renderer.domElement.width / renderer.domElement.height,1),material)
	screen.position.copy(rightHand.position)
	// scene.add(screen)
	screen.scale.multiplyScalar(.1)

	// can switch to using this. May need to get viewport size?
	let height = centerToFrameDistance(camera.fov, camera.near);
	let width = height * camera.aspect
	let displayPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry(width,height), material )
	camera.add( displayPlane )
	displayPlane.position.z = -camera.near;

	assert(camera.parent == scene)

	let framePosition3d = new THREE.Vector3() //ideally attached to a real thing

	if(0)
	{
		let tv = null
		await new Promise(resolve => {
			loader.load("data/hdtv.obj",function(obj)
			{
				tv = new THREE.Mesh(obj.children[1].geometry,new THREE.MeshStandardMaterial({color:0x0F0F0F})) //0 appears to contain nothing
				tv.geometry.applyMatrix(new THREE.Matrix4().scale(new THREE.Vector3(.08,.08,.08)).setPosition(0.,1.2905-1.6,-0.036))

				// scene.add(tv)
				// tv.position.copy(rightHand.position)

				rightHand.visible = false

				resolve();
			})
		})
		screen.add(tv)
		tv.scale.multiplyScalar(5.7)
	}

	updateFunctions.push(function()
	{
		framePosition3d.copy(rightHand.position)
		framePosition3d.project(camera)
		material.uniforms.framePosition.value.copy(framePosition3d)

		displayPlane.scale.y = displayPlane.scale.x / camera.aspect
	})

	function ourRender()
	{
		renderer.render( scene, camera );
		renderer.copyFramebufferToTexture( bottomLeft, texture, 0 )
	}

	return ourRender
}