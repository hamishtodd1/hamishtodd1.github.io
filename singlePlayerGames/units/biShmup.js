function initBiShmup()
{
	var speed = 0.01
	bindButton("w", function(){avatars[0].position.y += speed}, "" )
	bindButton("a", function(){avatars[0].position.x -= speed}, "" )
	bindButton("s", function(){avatars[0].position.y -= speed}, "" )
	bindButton("d", function(){avatars[0].position.x += speed}, "" )

	bindButton("up", function(){avatars[1].position.y += speed}, "" )
	bindButton("left", function(){avatars[1].position.x -= speed}, "" )
	bindButton("down", function(){avatars[1].position.y -= speed}, "" )
	bindButton("right", function(){avatars[1].position.x += speed}, "" )

	//the right way to do it is a shader

	var avatars = Array(2)
	avatars[0] = new THREE.Mesh(new THREE.SphereGeometry(0.01))
	avatars[1] = new THREE.Mesh(new THREE.SphereGeometry(0.01))
	avatars[1].position.x += 0.5
	scene.add(avatars[0],avatars[1])
}