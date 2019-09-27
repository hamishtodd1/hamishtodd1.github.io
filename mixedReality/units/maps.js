/*
	Script
		It so much feels like you ought to be able to do this, because when you look close up the world is flat

	Slice plane for showing circles/great circles
	Slice plane for great circles only

	Can drag points (latitude lines) and:
		they stay the same distance in 3 space from the azimuth ("equal area")
		they stay the same distance on the globe from the azimuth
		They stay on a straight line from a projection point (eh, bulb works)
		aaaaand the others all follow in an axially symmetric way
	Projection bulb

	Ability to duplicate the things
		Duplicate
		Cut stuff, literally

	Greenland
	Your little flying saucer with cone beam and cross

	Have their names at the bottom

	To do
		Polyhedral
			Tet
			Oct
			Dymaxion
			Pierce cuinical
				aka cassini
				aka hemisphere in a square
				the two circular hemispheres?
		azimuthal - choose a point
			equidistant = rolling pin!
			gnomic = central
			orthographic
			equal area - "tunnel distance" - surprisingly!
			Retroazimuthal
				These seem weird! Think!
				NEED the mecca one
		Cylindrical
			Mercator
				underrated, talk about directions (first! and then tell them it's mercator!)
				Buuuut pick up greenland too
				Gall peters!
				equirectangular
			Compare: central cylindrical. This is not mercator
			Loximuthal
				Looks like world has let itself go
			conical
				Boring but easily done probably. Need the obvious ones
				And the love heart (pseudoconical)
			pseudocylindrical
				The fucking pill ones
				Orange peel - different distortion in different places, yuck
				Mollweide. Ellipses, that's nice
		Globe
			But look, you do want to see the whole thing at once. And do you ever really look at it from all angles?
		Two point equidistant

	Live performance todo
		Server
		That actually serves to another computer
		Need webcam in background
		Urgh how to "connect". You almost certainly can't have it come off your own laptop because no HDMI!
		Yeah, test! Have it come through server
		Check it at the venue, VR and all
		Facial control
			Eyeroll
*/

async function initMaps() {

	let loader = new THREE.OBJLoader();

	let globe = null
	let globeRadius = .1;

	await new Promise(resolve => {
		loader.load("data/worldmap.obj",function(obj)
		{
			let transform = new THREE.Matrix4().makeRotationX(-TAU/4)
			let geo = obj.children[0].geometry
			geo.applyMatrix(transform)

			let v = new THREE.Vector3()
			for(let i = 0, il = obj.children[0].geometry.attributes.position.count; i < il; i++) {
				obj.children[0].geometry.attributes.position.getXYZ(i,v)
				v.setLength(globeRadius)
				obj.children[0].geometry.attributes.position.setXYZ(i,v.x,v.y,v.z)
			}

			globe = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color:0x00FF00}));
			globe.rotation.y += TAU/4
			globe.rotation.x += TAU / 8

			let indicator = new THREE.Mesh(new THREE.SphereGeometry(.01));
			indicator.position.x = globeRadius;
			globe.add(indicator)

			scene.add(globe)
			globe.position.copy(rightHand.position)
			updateFunctions.push(function()
			{
				// globe.quaternion.copy(rightHand.quaternion)

			})

			bindButton()

			resolve();
		})
	})

	await new Promise(resolve => {
		loader.load("data/ufo.obj",function(obj)
		{
			let geo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
			geo.mergeVertices()
			geo.computeVertexNormals()
			geo.computeFaceNormals()
			geo.applyMatrix(new THREE.Matrix4().scale(new THREE.Vector3(.001,.001,.001)));
			geo.applyMatrix(new THREE.Matrix4().makeTranslation(0,-.03,0));

			let ufo = new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:0x808080}));

			let coneHeight = .1;
			let cone = new THREE.Mesh(new THREE.ConeGeometry(.07,coneHeight,32,1,true),new THREE.MeshBasicMaterial({transparent:true,opacity:0.4,color:0xFF0000}));
			cone.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-coneHeight*.5,0));
			ufo.add(cone)

			scene.add(ufo)

			ufo.up.set(1,0,0);

			// {
			// 	let angularThickness = .04
			// 	let beamedShapeMaterial = new THREE.MeshBasicMaterial()
			// 	let centerToPerimeterAngle = .7;
			// 	let beamedShape = new THREE.Mesh( new THREE.SphereBufferGeometry(globeRadius*1.01,32,2,
			// 		0,TAU,  centerToPerimeterAngle,angularThickness), beamedShapeMaterial )
			// 	// beamedShape.add(  new THREE.Mesh( new THREE.SphereBufferGeometry(globeRadius*1.01,32,2,
			// 	// 	-centerToPerimeterAngle/2,centerToPerimeterAngle/2,TAU/4-angularThickness/2,TAU/4+angularThickness/2), beamedShapeMaterial ) )

			// 	beamedShape.position.copy(globe.position)
			// 	scene.add(beamedShape)
			// }

			updateFunctions.push(function()
			{
				ufo.position.copy(rightHand.position)

				ufo.lookAt(globe.position)
			})

			resolve();
		})
	})
}