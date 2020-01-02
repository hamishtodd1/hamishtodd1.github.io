/*
you have two normals coming from two points. Bezier

Grab spike and stretch or squash it

It's that you want to make a general scheme
*/

function initMarkovChains() {
	let node = new THREE.Mesh(new THREE.CircleGeometry(.1, 32));

	node.outs = Array(nodes.length);
	node.outs[0] = 1.;

	let spike = new THREE.Mesh(new THREE.PlaneGeometry(1,1,1,10));

}