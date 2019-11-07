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

	Pick up the image and adjust parameters for stuff like this?
		http://escherdroste.math.leidenuniv.nl/index.php?menu=im&sub=escher&show=-1x1

	You scale it with your hands, while keeping or not keeping camera in place
		It gets scaled around the vanishing point
		Your hands define a line segment that stays the same size on the screen

	Rendering current real world = drawing everything except the smaller thing.
	Then, yeah, put it in a texture in the scene you see

	Script
		Pick up TV, "turn it on"
		Take head off to bow to audience

		Take some object out of the frame, give some object to yourself, tug of war over it

		Make inflation pretty large before doing "cut"
		Then make it super small, almost vanishing
	Epilogue
		He's cheating really, pretending that the picture contains the person when really it contains another, smaller, person

	If you save all the frames -without the image on top- you can generate many layers down and no resolution loss

	Consciousness is never one persistent thing, that is an illusion. It's 

	You might be walking along and have a thought hit you, let's say the thought is "shoe X is better than shoe Y"
	You might then say "I wonder why I thought that?" And you might then investigate your own thoughts, question their origin.
	GEB points out that it is remarkable that we can do this, that we can think about our own motives
	The reason it's remarkable is that we are the thing that is thinking, but we think about how we think
	And this picture gets used as an analogy in the book.
	If you want to think of your self as a single persisting thing, this is what it is, it is a thing which is modelling itself
*/

async function initEscher()
{
	var data = new Uint8Array( renderer.domElement.width * renderer.domElement.height * 3 );
	var texture = new THREE.DataTexture( data, renderer.domElement.width, renderer.domElement.height, THREE.RGBFormat );
	texture.minFilter = THREE.NearestFilter; //?
	texture.magFilter = THREE.NearestFilter;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	var bottomLeft = new THREE.Vector2(0,0)

	let loader = new THREE.OBJLoader()

	let material = new THREE.ShaderMaterial( {
		uniforms:
		{
			lastFrame:	{ value: texture }, //can you just put the framebuffer straight in there?
			framePosition: { value: new THREE.Vector2() },
			bottom: { value: new THREE.Vector2(1.3,0.) },
			side: { value: new THREE.Vector2() },

			logScaleFactor: { value: new THREE.Vector2(Math.log(256.),0.) }
		},
		depthTest: false
	} );
	await assignShader("escherFragment", material, "fragment");
	await assignShader("escherVertex", material, "vertex");

	let screen = new THREE.Mesh(new THREE.PlaneGeometry(renderer.domElement.width / renderer.domElement.height,1),material)
	screen.position.copy(rightHand.position)
	// scene.add(screen)
	screen.scale.multiplyScalar(.1)

	// can switch to using this. May need to get viewport size?
	let displayPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry(1.,1.), material )
	camera.add( displayPlane )
	displayPlane.position.z = -camera.near;

	console.assert(camera.parent == scene)

	let framePositionReal = new THREE.Vector3() //ideally attached to a real thing
	let bottomReal = new THREE.Vector3(.13,0.)
	let sideReal = new THREE.Vector3(.13,0.)

	if(0)
	{
		let tv = null
		await new Promise( resolve => {
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

	function projectOnDisplayMesh(p, target)
	{
		let cameraSpaceP = p.clone()
		camera.worldToLocal(cameraSpaceP)

		cameraSpaceP.multiplyScalar( displayPlane.position.z / cameraSpaceP.z );
		target.set(cameraSpaceP.x,cameraSpaceP.y);

		return target
	}

	updateFunctions.push( function()
	{
		framePositionReal.copy(rightHand.position)
		projectOnDisplayMesh(framePositionReal, material.uniforms.framePosition.value)

		{
			bottomReal.set(.15,0.,0.) //because you don't understand coordinate systems, weirdness
			bottomReal.applyAxisAngle(zUnit,frameCount * .01);

			sideReal.copy(bottomReal)
			sideReal.applyAxisAngle(zUnit,TAU/4.);
			sideReal.multiplyScalar(1./camera.aspect)

			bottomReal.add(framePositionReal)
			sideReal.add(framePositionReal)
		}

		projectOnDisplayMesh(bottomReal, material.uniforms.bottom.value)
		material.uniforms.bottom.value.sub(material.uniforms.framePosition.value)
		projectOnDisplayMesh(sideReal, material.uniforms.side.value)
		material.uniforms.side.value.sub(material.uniforms.framePosition.value)
	})

	ourRender = function()
	{
		renderer.render( scene, camera );
		renderer.copyFramebufferToTexture( bottomLeft, texture, 0 )
	}

	return ourRender
}