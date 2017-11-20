/**
 * Altered by @hamish_todd to give carbon alphas in callback
 https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/tutorials/pdbintro.html
 * 
 * @author alteredq / http://alteredqualia.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.PDBLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.PDBLoader.prototype = {

	constructor: THREE.PDBLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.load( url, function ( text ) {

			function trim( text ) {

				return text.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );

			}

			function capitalize( text ) {

				return text.charAt( 0 ).toUpperCase() + text.substr( 1 ).toLowerCase();

			}

			var atoms = [];
			var bonds = [];

			var lines = text.split( "\n" );

			var x, y, z, e;
			var backbones = Array();
			var backbone = 0;
			var atomType = "";

			for ( var i = 0, l = lines.length; i < l; ++ i ) {
				if ( lines[ i ].substr( 0, 4 ) == "ATOM" || lines[ i ].substr( 0, 6 ) == "HETATM" ) {

					atomType = lines[ i ].substr( 13, 2 );
					if( atomType === "CA")
					{
						if(!backbones[backbone])
							backbones[backbone] = [];
						backbones[backbone].push( new THREE.Vector3(x,y,z) );
					}
					
					x = parseFloat( lines[ i ].substr( 30, 7 ) );
					y = parseFloat( lines[ i ].substr( 38, 7 ) );
					z = parseFloat( lines[ i ].substr( 46, 7 ) );

					e = trim( lines[ i ].substr( 76, 2 ) ).toLowerCase();

					if ( e === "" )
						e = trim( lines[ i ].substr( 12, 2 ) ).toLowerCase();
					atoms.push( [ x, y, z, e ] );

				} else if ( lines[ i ].substr( 0, 3 ) === "TER" )
				{
					if( backbones[backbone] && backbones[backbone].length > 0)
						backbone++;
				}

			}

			onLoad( backbones, atoms );

		}, onProgress, onError );

	},

	// Based on CanvasMol PDB parser

};
