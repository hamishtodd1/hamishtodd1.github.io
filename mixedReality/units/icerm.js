/*
	need to check rift still works! Ideally spectation too

	console output indicating head direction? And other things?

	want fish

	glue elliptic curve thing to left hand

	video on the computer screen on a loop

	Could do your elliptic curve slicing thing

	Hey, imagine a square with an orientation field on it
		Map that square (likey with the same point going to same place twice in many places) to RP3
*/

async function initIcerm() {
	//"local maximum of interestingness" liouville's thm
	//S1 x S2?

	//did not work in small steps!

	//short term goal: useful visualization + interface for making video games / investigating dynamical systems
	//movement wants to feel pleasant / can be understood well enough

	//later intention: give way of navigating / remapping 3-manifolds

	// initThreeSphereExploration( 1.6 );
	// return;

	let ellipticCurveSpace = await scalarFieldVisualization({});

	updateFunctions.push(function()
	{
		ellipticCurveSpace.quaternion.copy(rightHand.quaternion)
		ellipticCurveSpace.position.copy(rightHand.position)
	})

	new THREE.TextureLoader().load("data/fish.png",function(texture) {
		let height = 1;
		let slide = new THREE.Mesh(new THREE.PlaneBufferGeometry(16/9*height,height), new THREE.MeshBasicMaterial({map:texture}));
		scene.add(slide)
		slide.position.y = 1.6;
		slide.position.z = -1;
	})

	let chapters = [
		{name:"nothing"},
		{name:"scalar field"},
		{name:"fish"},
		{name:"S3"}
	]

	let currentChapterIndex = 0;
	bindButton("right",function() {
		currentChapterIndex++;
		if( currentChapterIndex >= chapters.length ) {
			currentChapterIndex = 0;
		}

		console.warn("changing to: ",chapters[currentChapterIndex].name);

		camera.scalarFieldDisplayPlane.visible = (chapters[currentChapterIndex].name === "scalar field")
	})
}