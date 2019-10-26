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

	let material = new THREE.ShaderMaterial( {
		uniforms:
		{
			"lastFrame":	{ value: texture } //can you just put the framebuffer straight in there?
		},
		vertexShader: [
			'precision highp float;',
			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = uv;',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join( '\n' ),
		depthTest: false
	} );
	await assignShader("escher", material, "fragment");

	let plane = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(),material)
	scene.add(plane)
	plane.scale.x = renderer.domElement.width / renderer.domElement.height
	plane.scale.multiplyScalar(.1)
	plane.position.copy(rightHand.position)

	function ourRender()
	{
		renderer.render( scene, camera );
		renderer.copyFramebufferToTexture( bottomLeft, texture, 0 )
	}

	return ourRender
}