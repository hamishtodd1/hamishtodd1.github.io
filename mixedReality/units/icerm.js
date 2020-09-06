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

async function initIcerm(gl) {
	//"local maximum of interestingness" liouville's thm
	//S1 x S2?

	//did not work in small steps!

	//short term goal: useful visualization + interface for making video games / teaching about dynamical systems
	//movement wants to feel pleasant + be understood

	let ellipticCurveSpace = await scalarFieldVisualization({source:2});
	updateFunctions.push(function()
	{
		ellipticCurveSpace.quaternion.copy(rightHand.quaternion)
		ellipticCurveSpace.position.copy(rightHand.position)
	})

	let slideHeight = 1.5
	let slide = new THREE.Mesh(new THREE.PlaneBufferGeometry(16/9*slideHeight,slideHeight), new THREE.MeshBasicMaterial());
	new THREE.TextureLoader().load("data/icermSlide.png",function(texture) {
		slide.material.map = texture;
		scene.add(slide)
		slide.position.y = 1.6;
		slide.position.z = -3;
	})

	let chapters = [
		{name:"nothing"},
		{name:"scalar field"},
		{name:"fish"},
		{name:"S3"}
	]
	
	let currentChapterIndex = {value:-1};

	function nextChapter() {
		currentChapterIndex.value++;
		if( currentChapterIndex.value >= chapters.length ) {
			currentChapterIndex.value = 0;
		}

		console.warn("changing to: ",chapters[currentChapterIndex.value].name);

		camera.scalarFieldDisplayPlane.visible = (chapters[currentChapterIndex.value].name === "scalar field")

		//visible, 
	}
	bindButton("right",nextChapter)

	{
		let height = 0.2
		
		let twoSphereVisiBox = VisiBox()
		for(let i = 0; i < 8; i++)
		{
			twoSphereVisiBox.corners[i].visible = false
		}
		let fish = initFish( twoSphereVisiBox )
		initTwoSphereExploration( fish, twoSphereVisiBox, height, currentChapterIndex )

		initThreeSphereExploration( height, currentChapterIndex )
	}

	nextChapter();
}