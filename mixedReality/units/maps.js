/*
	"The general interface"
		Do individual triangles
		"Have a handheld “projector” that snaps to certain positions. And a “canvas” to record projection on."
		Remember your first idea was cross section of the earth
		Goal
			People want to hear the PURPOSE of a given projection, what it achieves
			All your gestures should be connected to the thing
			Make it feel like you'd never imagine algebra would be necessary
			be able to make new ones with this interface!
		You have a (finite) plane (ruled surface) that you can bend into a cone or cylinder
			Don't think of it as a perfect cone/cylinder
			And introduce singularities that you can bend around
		Explosion from manifolds. Gesturally make them, then move hands to do projection from them
		Would be good to grab the undistorted parallels on cylindrical and vary between these https://en.wikipedia.org/wiki/Lambert_cylindrical_equal-area_projection#/media/File:Tissot_indicatrix_world_map_cyl_equal-area_proj_comparison.svg
		Unwrap cylindrical, then project onto exp for mercator
		Straight lines onto meshes works so far
		Rolling pin that you control. It's always going onto something flat.
		"General" picking shit up
			becomes irritating if you have to bear in mind hand's extra matrix
		It's interesting coz there's something fundamental that the function is, beyond its symbolic representation
		TODO
			Scale
			Morph ico to octa to tet
			The thing you're doing is grabbing one or another kind of 1-manifold from the globe
				Great circles
				Loxodromes / rhumb lines?
				Latitude lines
			Can drag points (latitude lines) and:
				they stay the same distance in 3 space from the azimuth ("equal area")
				they stay the same distance on the globe from the azimuth
				They stay on a straight line from a projection point (eh, bulb works)
				aaaaand the others all follow in an axially symmetric way
				And you press a button and all other lines do it
			Duplicate?
			Unfolding
				All angles are the same, for cylinder, polyhedron, and cone
			Cutting?
			Projection bulb
			Have their names at the bottom
			Reorient to a chosen orientation

	HOW FAR DOES PROJECTING ONTO MESHES GET YOU?
		Polyhedral, central cyl, mercator, equirect, conic, 
		Polyconic bit harder
*/

async function initMaps()
{
	let globeRadius = .09;

	let normalGlobeMaterial = new THREE.MeshStandardMaterial({color:0x00FF00})

	{
		let nextTriangleIndex = 0;
		function copyTriangle(vertexArray)
		{
			for(let i = 0; i < 3; i++)
			{
				projectionSurfaceCoords[nextTriangleIndex*9 + i*3 + 0] = vertexArray[i].x;
				projectionSurfaceCoords[nextTriangleIndex*9 + i*3 + 1] = vertexArray[i].y;
				projectionSurfaceCoords[nextTriangleIndex*9 + i*3 + 2] = vertexArray[i].z;
			}

			nextTriangleIndex++;
		}

		let numQuads = 500;
		let numTriangles = numQuads*2;
		let projectionSurfaceCoords = new Float32Array( 9 * numTriangles );
		let cylinderRadius = globeRadius * 1.3;
		let tl = new THREE.Vector3(), tr = new THREE.Vector3(), bl = new THREE.Vector3(), br = new THREE.Vector3();
		for(let i = 0; i < numQuads; i++)
		{
			tl.set(cylinderRadius,200,0);
			tl.applyAxisAngle(yUnit,i*TAU/numQuads)

			tr.copy(tl);
			tr.applyAxisAngle(yUnit,TAU/numQuads)

			bl.copy(tl)
			bl.y *= -1
			br.copy(tr)
			br.y *= -1

			copyTriangle([tr,tl,bl])
			copyTriangle([bl,br,tr])
		}

		let geo = new THREE.BufferGeometry()
		geo.addAttribute('position',new THREE.BufferAttribute( projectionSurfaceCoords, 3 ));
		var projectionSurfaceMesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial({wireframe:true}));
		// scene.add(projectionSurfaceMesh)
		projectionSurfaceMesh.position.copy(rightHand.position)

		// let numTriangles = 1;
		// let projectionSurfaceCoords = new Float32Array( 9 * numTriangles );
		// let a = new THREE.Vector3(0.,.17,1.4*globeRadius).applyAxisAngle(zUnit,TAU/3*0.5);
		// let b = new THREE.Vector3(0.,.17,1.4*globeRadius).applyAxisAngle(zUnit,TAU/3*1.5);
		// let c = new THREE.Vector3(0.,.17,1.4*globeRadius).applyAxisAngle(zUnit,TAU/3*2.5);
		// copyTriangle([a,b,c]);

		console.assert(nextTriangleIndex === numTriangles)

		let projectionSurfaceTexture = new THREE.DataTexture( 
			projectionSurfaceCoords, 3, numTriangles, THREE.RGBFormat, THREE.FloatType );
		projectionSurfaceTexture.wrapS = THREE.ClampToEdgeWrapping;
		projectionSurfaceTexture.wrapT = THREE.ClampToEdgeWrapping;
		projectionSurfaceTexture.minFilter = THREE.NearestFilter;
		projectionSurfaceTexture.magFilter = THREE.NearestFilter;
		projectionSurfaceTexture.needsUpdate = true;

		var projectableMaterial = new THREE.ShaderMaterial({
			side:THREE.DoubleSide,
			uniforms: {
				"projectionSurface":	{ value: projectionSurfaceTexture },
				"pixelHeight":			{ value: 1. / numTriangles }
			},
		});
		await assignShader("mapVertex", projectableMaterial, "vertex")
		await assignShader("mapFragment", projectableMaterial, "fragment")

		updateFunctions.push( function() 
		{
			//you don't have to send all the triangle vertices whenever you change the mesh, you could parameterize it
			//ok so the question becomes how to manipulate this mesh cleverly to get everything you want
		} )
	}

	let loader = new THREE.OBJLoader();
	async function processGlobeOrGreenland(filename)
	{
		let result = null
		await new Promise(resolve => {
			loader.load("data/"+filename+".obj",function(obj)
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

				result = new THREE.Mesh(geo, projectableMaterial);
				log(result)

				resolve();
			})
		})
		return result
	}

	let globe = await processGlobeOrGreenland("worldMap");
	scene.add(globe)
	globe.position.copy(rightHand.position)
	updateFunctions.push(function()
	{
		globe.quaternion.copy(rightHand.quaternion)
		projectionSurfaceMesh.quaternion.copy(rightHand.quaternion)
	})

	// let greenland = await processGlobeOrGreenland("greenland")
	// globe.add(greenland)
	// updateFunctions.push(function()
	// {
	// 	greenland.rotateOnAxis(yUnit,0.1)
	// })

	//don't want to cheat by changing some built-in crap :P
}

function initProps()
{
	if(0)
	{
		let sign = makeTextSign("Mercator", false, false, false);
		scene.add(sign)
		sign.scale.multiplyScalar(.1)
		sign.position.copy(rightHand.position)
	}

	if(0)
	{
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
}