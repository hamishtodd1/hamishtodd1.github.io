function initFileNavigator()
{
	MenuOnPanel([{
		string:"load tutorial model and data",
		buttonFunction: function()
		{
			new THREE.FileLoader().load( "modelsAndMaps/example.pdb", putPdbStringIntoAssemblage )
			loadMap("example.map")

			assemblage.position.set(-1.0477028787328,-0.047054959081454045,0.11804759682559962)
			assemblage.scale.setScalar(0.038411028573256525,0.038411028573256525,0.038411028573256525)
			assemblage.quaternion.set(0.7598603867892302,-0.3828906405443754,0.5012112587360823,-0.1574618178326543).normalize()
		}
	}]);
}