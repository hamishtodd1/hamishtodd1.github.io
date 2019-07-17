//you've got it with your trigger, you're laying it with your thumb, as usual
initNewAtomRoster = function()
{
	let atomGeometry = new THREE.EfficientSphereBufferGeometry()

	let menu = [
		{string:"New Atoms"}
	];
	for(atomName in standardAtomColors)
	{
		let newLine = {}
		let capitalizedAtomName = atomName[0].toUpperCase() + atomName.substr(1,atomName.length-1)
		newLine.string = "	" + capitalizedAtomName
		newLine.tool = new THREE.Mesh(atomGeometry,new THREE.MeshPhongMaterial({color:standardAtomColors[atomName]}) )
		menu.push( newLine )
	}

	MenuOnPanel(menu,6.14,6.24)
}