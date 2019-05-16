function initFaceMaker()
{
	var mouthMaterial = new THREE.MeshBasicMaterial({color:0x000000})

	let pupilAngle = TAU / 17;
	let eyeWhiteGeometry = new THREE.SphereBufferGeometry(1, 32, 32, 0, TAU, pupilAngle, TAU/2-pupilAngle)
	let pupilGeometry = new THREE.SphereBufferGeometry(1, 32, 32, 0, TAU, 0, pupilAngle)
	let m = new THREE.Matrix4().makeRotationX(TAU/4)
	eyeWhiteGeometry.applyMatrix(m)
	pupilGeometry.applyMatrix(m)
	Eyeball = function(radius)
	{
		var eyeWhite = new THREE.Mesh(eyeWhiteGeometry, new THREE.MeshPhongMaterial({color:0xFFFFFF}) );
		var pupil = new THREE.Mesh(pupilGeometry, new THREE.MeshPhongMaterial({color:0x000000}) );
		eyeWhite.scale.setScalar(radius)
		pupil.scale.setScalar(radius)
		let eyeball = new THREE.Group().add(eyeWhite,pupil)

		// let eyebrow = new THREE.
		return eyeball;
	}

	Face = function(radius,mood,group)
	{
		if(group === undefined)
		{
			group = new THREE.Group()
		}

		{
			var neutralPain = 0.2;
			if( mood < neutralPain )
			{
				var thetaLength = TAU / 2;
				var thetaStart = TAU / 2;
			}
			else
			{
				var thetaLength = TAU / 2 * (mood - neutralPain)/(1-neutralPain);
				var thetaStart = TAU / 4 - thetaLength / 2;
			}

			var mouthScalar = Math.sin(thetaLength / 2);
			var mouthRadius = radius * 0.66;

			let mouth = new THREE.Mesh(
				new THREE.RingGeometry(
					mouthRadius,
					mouthRadius + mouthScalar / 80,
					31,1,
					thetaStart,
					thetaLength),
				mouthMaterial)
			mouth.geometry.applyMatrix(new THREE.Matrix4().scale(new THREE.Vector3().setScalar(1/mouthScalar)))

			mouth.geometry.computeBoundingBox();
			var mouthCenter = mouth.geometry.boundingBox.max.clone().lerp(mouth.geometry.boundingBox.min,0.5)
			mouth.position.sub(mouthCenter)
			mouth.position.y -= radius / 4;
			mouth.position.z = 0.01;
			// group.add(mouth)
		}

		function crescentGeometry()
		{
			//01234
			//56789
			let segmentsWide = 20
			let mouth = new THREE.Mesh(new THREE.PlaneGeometry(1,1,segmentsWide))
			mouth.position.z = 0.01;
			let topLipCenter = new THREE.Vector2(0,1000)
			let bottomLipCenter = new THREE.Vector2(0,1)

			let top = new THREE.Vector2(-1,0)
			let bottom = new THREE.Vector2(-1,0)

			let topLipAngle = Math.abs( top.clone().sub(topLipCenter).angle() - top.clone().negate().sub(topLipCenter).angle() )
			let bottomLipAngle = Math.abs( top.clone().sub(topLipCenter).angle() - top.clone().negate().sub(topLipCenter).angle() )

			for(let i = 0, il = segmentsWide; i < il; i++)
			{
				top.rotateAround(topLipCenter, i / (segmentsWide-1) * topLipAngle)
				mouth.geometry.vertices[i].x = top.x
				mouth.geometry.vertices[i].y = top.y

				bottom.rotateAround(bottomLipCenter, i / (segmentsWide-1) * bottomLipAngle)
				mouth.geometry.vertices[i+segmentsWide].x = bottom.x
				mouth.geometry.vertices[i+segmentsWide].y = bottom.y

				// if(i === segmentsWide-1)
					log(top)
			}
			log( mouth.geometry.verticesNeedUpdate )
			mouth.geometry.verticesNeedUpdate = true

			mouth.scale.multiplyScalar(0.06)
			group.add(mouth)
		}


		let eyeRadius = radius * 0.2
		for(let i = 0; i < 2; i++)
		{
			let eyeball = Eyeball(eyeRadius)
			eyeball.position.y = eyeRadius * 2
			eyeball.position.x = eyeRadius * 2
			if(i)
			{
				eyeball.position.x *= -1
			}
			group.add( eyeball )
		}

		return group
	}
}