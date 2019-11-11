/*
	Rendering current real world = drawing everything except the smaller thing.
	Then, yeah, put it in a texture in the scene you see
	If you save all the frames -without the image on top- you can generate many layers down and no resolution loss

	Could just use geese, since your mouth is saying nothing

	Pick up the image and adjust parameters for stuff like this?
		http://escherdroste.math.leidenuniv.nl/index.php?menu=im&sub=escher&show=-1x1
		And the exponential map thing? Roll it into a tube

	Script
		Pick up TV, "turn it on"
		Take head off to bow to audience

		Take some object out of the frame, give some object to yourself, tug of war over it

		Make inflation pretty large before doing "cut"
		Then make it super small, almost vanishing

		Move it all the way towards the camera and it looks normal.
	Epilogue
		He's cheating really, pretending that the picture contains the person when really it contains another, smaller, person

		Omission of the singularity
		Look closely at the area around the singularity. It's not so hard to see what's going on if you do that
		The size of the scaling is what makes escher's version weirder than most
		If the loop is tightened, it becomes completely undefined to ask "am I in the real world or the picture?"
		The inclusion of the window is a good idea
		I, possibly because I am a westerner, look at the top left first and my eyes go right
			As you walk around you can ask "am I looking at the picture or the real world, which contains the picture?"

		I first encountered this picture in this book, which is if nothing else a very entertaining book
		The main thing it is about is self-reference or self-reflection.
		A big part of it is about how self-reflection is one of the main things that human minds do that computers and AI still don't do
		You can have a thought, like "Liverpool will probably beat Tottenham today"
		And then having had a thought, you have thoughts about that thought.
		You might then say "I wonder why I thought that?" And you might then investigate your own thoughts, question their origin.
		You think "Maybe the reason I believe that is because Liverpool have done well recently"
		In a way, it is kind of weird that we humans can think about our own thoughts
		The reason it's remarkable is that we are the thing that is thinking, but we think about how we think
		AIs don't do that. In order for an AI to be improved on, its outputs have to be inspected by a human
		And this picture gets used as an analogy in the book. Like the thoughts are the pictures and each layer is a bunch of thoughts about that thought
		If you want to think of your self as a single persisting thing, this is what it is, it is a thing which is modelling itself

	You scale it with your hands, while keeping or not keeping camera in place
		It gets scaled around the vanishing point
		Your hands define a line segment that stays the same size on the screen
*/

async function initEscher()
{
	var data = new Uint8Array( renderer.domElement.width * renderer.domElement.height * 3 );
	var texture = new THREE.DataTexture( data, renderer.domElement.width, renderer.domElement.height, THREE.RGBFormat );
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	var bottomLeft = new THREE.Vector2(0,0)

	let framePositionReal = new THREE.Vector3() //ideally attached to a real thing
	let bottomReal = new THREE.Vector3(.13,0.)
	let sideReal = new THREE.Vector3(.13,0.)
	let material = new THREE.ShaderMaterial( {
		uniforms:
		{
			lastFrame:	{ value: texture },

			//positions on the camera near plane
			framePosition: { value: new THREE.Vector2() },
			bottom: { value: new THREE.Vector2() },
			side: 	{ value: new THREE.Vector2() },

			exponent: { value: new THREE.Vector2(Math.log(256.),0.) }
		},
		depthTest: false
	} );
	await assignShader("escherFragment", material, "fragment");
	await assignShader("escherVertex", material, "vertex");

	let ourScene = new THREE.Scene()
	let ourCamera = new THREE.OrthographicCamera()
	ourCamera.position.z = 1;
	let displayPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2.,2.),material);
	ourScene.add(displayPlane)

	// ourCamera.add( displayPlane )

	ourRender = function()
	{
		renderer.render( scene, camera );
		renderer.copyFramebufferToTexture( bottomLeft, texture, 0 )

		renderer.render( ourScene, ourCamera );
	}

	if(0)
	{
		let tv = null
		await new Promise( resolve => {
			new THREE.OBJLoader().load("data/hdtv.obj",function(obj)
			{
				tv = new THREE.Mesh(obj.children[1].geometry,new THREE.MeshStandardMaterial({color:0x0F0F0F})) //0 appears to contain nothing
				tv.geometry.applyMatrix(new THREE.Matrix4().scale(new THREE.Vector3(.08,.08,.08)).setPosition(0.,1.2905-1.6,-0.036))

				scene.add(tv)
				tv.position.copy(rightHand.position)
				tv.scale.multiplyScalar(.06)

				let rect = new THREE.Mesh(new THREE.PlaneBufferGeometry(.55,.4))
				tv.add(rect)

				rightHand.visible = false

				resolve();
			})
		})
		tv.scale.multiplyScalar(5.7)
	}

	function getTexturePosition(p, target)
	{
		let cameraSpaceP = p.clone()
		camera.worldToLocal(cameraSpaceP)

		cameraSpaceP.multiplyScalar( -camera.near / cameraSpaceP.z );

		let sideLength = centerToFrameDistance(camera.fov, camera.near)

		target.set(
			cameraSpaceP.x / sideLength / 2 + .5,
			cameraSpaceP.y / sideLength / 2 + .5);

		return target
	}

	let pointInHand = new THREE.Vector3(1,0,0)
	let designatedHand = rightHand
	let angle = 0.;

	let worldishPointInHand = new THREE.Vector3()
	let worldishPointInHandOnPlane = new THREE.Vector2()
	let oldWorldishPointInHand = new THREE.Vector3()
	let oldWorldishPointInHandOnPlane = new THREE.Vector2()

	let width = .16

	function divideComplex(a, b)
	{
		return new THREE.Vector2(
			a.x * b.x + a.y * b.y,
			a.y * b.x - a.x * b.y).multiplyScalar(1./b.lengthSq());
	}

	updateFunctions.push( function()
	{
		/*
			so what we want is that the hands get closer and further
				and the screen gets closer and further...
				such that they are in the same place on the screen
				hmm is this actually related to self reference?
		*/

		if(camera.aspect > 1.)
			log("taller")
		else if(camera.aspect < 1. )
			log("shorter")

		{
			//"Worldish" because only orientation, not position. hand is origin.
			worldishPointInHand.copy( pointInHand ).applyQuaternion(designatedHand.quaternion)
			worldishPointInHandOnPlane.copy(worldishPointInHand).normalize()

			oldWorldishPointInHand.copy( pointInHand ).applyQuaternion(designatedHand.quaternionOld)
			oldWorldishPointInHandOnPlane.copy(oldWorldishPointInHand).normalize()

			angle += worldishPointInHandOnPlane.angle() - oldWorldishPointInHandOnPlane.angle();
			while(angle > TAU) angle -= TAU

			pointInHand.set(worldishPointInHandOnPlane.x,worldishPointInHandOnPlane.y,0.)
			pointInHand.applyQuaternion(designatedHand.quaternion.clone().inverse())
		}

		rightHand.position.x -= width / 2;
		rightHand.position.y -= width / camera.aspect / 2;
		framePositionReal.copy(rightHand.position) //or possibly just the diff
		getTexturePosition(framePositionReal, material.uniforms.framePosition.value)

		{
			bottomReal.set(width,0.,0.)
			bottomReal.applyAxisAngle(zUnit,angle);

			sideReal.copy(bottomReal)
			sideReal.applyAxisAngle(zUnit,TAU/4.);
			sideReal.multiplyScalar(1./camera.aspect)

			bottomReal.add(framePositionReal)
			sideReal.add(framePositionReal)
		}

		getTexturePosition(bottomReal, material.uniforms.bottom.value)
		material.uniforms.bottom.value.sub(material.uniforms.framePosition.value)
		getTexturePosition(sideReal, material.uniforms.side.value)
		material.uniforms.side.value.sub(material.uniforms.framePosition.value)

		// log(material.uniforms.framePosition.value);

		let ourAngle = Math.pow(2,(8-frameCount*.007) )
		ourAngle = TAU
		material.uniforms.exponent.value.copy(divideComplex(
			new THREE.Vector2(Math.log(256.), ourAngle),
			new THREE.Vector2(0.,ourAngle) ) );
	})
}