/**
 * @author alteredq / http://alteredqualia.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

function initPdbLoader()
{
	var loader = new THREE.FileLoader();

	let pdbOpening = ""

	loadPdbAndMakeSillyModel = function ( url, onLoad, onProgress, onError )
	{
		loader.load( url, function ( text )
		{
			var atomsAndBonds = parsePdb( text );
			createModel( atomsAndBonds, onLoad );

		}, onProgress, onError );
	}
	
	parsePdb = function ( text )
	{
		function trim( text ) 
		{
			return text.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
		}

		function capitalize( text )
		{
			return text.charAt( 0 ).toUpperCase() + text.substr( 1 ).toLowerCase();
		}

		function hash( s, e )
		{
			return "s" + Math.min( s, e ) + "e" + Math.max( s, e );
		}

		function parseBond( start, length )
		{
			var eatom = parseInt( lines[ i ].substr( start, length ) );

			if ( eatom )
			{
				var h = hash( satom, eatom );

				if ( bondHash[ h ] === undefined )
				{
					bonds.push( [ satom - 1, eatom - 1, 1 ] );
					bondHash[ h ] = bonds.length - 1;
				}
				else
				{

					// bonds[bondHash[h]][2] += 1;

					// doesn't really work as almost all PDBs
					// have just normal bonds appearing multiple
					// times instead of being double/triple bonds

				}
			}
		}

		var atoms = [];
		// var bonds = [];
		var terminations = [];

		let atomNumber = 0;

		var bondHash = {};

		let imol = models.length

		var lines = text.split( "\n" );

		var x, y, z, element

		let isCA, residueType, occupancyAndTemperatureFactor, name, chainId, resNo;

		let altloc = null
		let insertionCode = null

		let writePdbOpening = pdbOpening === ""

		let residues = []

		for ( var i = 0, l = lines.length; i < l; ++ i )
		{
			if ( lines[ i ].substr( 0, 4 ) == "ATOM" || lines[ i ].substr( 0, 6 ) == "HETATM" )
				// lines[ i ].substr( 0, 6 ) == "ANISOU" //anisotropic temperature factors, not necessary
			{
				writePdbOpening = false

				x = parseFloat( lines[ i ].substr( 30, 8 ) );
				y = parseFloat( lines[ i ].substr( 38, 8 ) );
				z = parseFloat( lines[ i ].substr( 46, 8 ) );

				occupancyAndTemperatureFactor = lines[ i ].substr( 54, 23 )
				
				name = lines[ i ].substr( 12, 4 )

				chainId = trim( lines[ i ].substr( 21, 1 ) )

				resNo = parseInt( lines[ i ].substr( 22, 5 ) )
				residues[resNo] = lines[ i ].substr( 17, 3 )

				element = trim( lines[ i ].substr( 76, 2 ) )
				if( element === "" )
				{
					element = trim( lines[ i ].substr( 12, 1 ) )
				}

				atoms[atomNumber] = new Atom( element, new THREE.Vector3(x,y,z),imol,chainId,resNo,insertionCode,name,altloc, occupancyAndTemperatureFactor, residueType)
				atomNumber++
			}
			//	could absolutely use this, but many PDBs don't list bonds so why bother introducing the complexity?
			// else if ( lines[ i ].substr( 0, 6 ) == "CONECT" )
			// {
			// 	var satom = parseInt( lines[ i ].substr( 6, 5 ) );

			// 	parseBond( 11, 5 );
			// 	parseBond( 16, 5 );
			// 	parseBond( 21, 5 );
			// 	parseBond( 26, 5 );

			// }
			else if ( lines[ i ].substr( 0, 3 ) === "TER" )
			{
				terminations.push(atoms.length)
			}

			if( writePdbOpening )
			{
				pdbOpening += lines[i]
			}
		}

		return {atoms,residues};
	}

	exportPdb = function()
	{
		/*
			You wanna import, export, diff

			Note no hydrogens

					atom name  chain resno					  						element
			ATOM      1  N   ALA A  43       8.858  12.487  42.895  1.00 30.00           N  
			ATOM      2  CA  ALA A  43       9.496  11.840  41.783  1.00 30.00           C  
			ATOM      3  C   ALA A  43       8.449  11.397  40.767  1.00 30.00           C  
			ATOM      4  O   ALA A  43       7.378  10.919  41.102  1.00 30.00           O  
			ATOM      5  CB  ALA A  43      10.303  10.639  42.312  1.00 30.00           C  


			ATOM   1259  OXT ASN A 159      -6.568  16.728  34.653  1.00 41.23           O  
			TER    1260      ASN A 159                                                      
			ATOM   1261  N   CYS B   1      -4.889   8.927  83.639  1.00 17.65           N  


			look at what chain IDs and residue numbers are already in there and make a new one
			(Or add to an existing chain if that's what the user has specified)

			and make sure residue numbers do not collide too
		*/

		let entryNo = 1;
		let prevChain = models[0].atoms[0].chainId
		let residueType = ""
		let pdbString = pdbOpening

		let chainResidueNames = ["ALA", "CYS", "ASP", "GLU", "PHE", "GLY", "HIS", "ILE", "LYS", "LEU", "MET", "ASN", "PRO", "GLN", "ARG", "SER", "THR", "VAL", "TRP", "TYR",
		"DA", "DC", "DG", "DT", "DI",
		"A", "C", "G", "U", "I"]

		function addTerminus(atom)
		{
			pdbString += "TER"
			+ padLeft(entryNo.toString(),8)
			+ padLeft(residueType,9)
			+ padLeft(atom.chainId,2)
			+ padLeft(atom.resNo,4)
			+ "                                                      \n"

			entryNo++
		}

		let atom = null
		let isHetAtm = null
		for(let i = 0; i < models.length; i++)
		{
			for(let j = 0, jl = models[i].atoms.length; j < jl; j++)
			{
				atom = models[i].atoms[j]

				let oldIsHetAtm = isHetAtm
				isHetAtm = chainResidueNames.indexOf( models[i].residues[atom.resNo] ) === -1

				if( atom.chainId !== prevChain || (isHetAtm && !oldIsHetAtm) )
				{
					addTerminus(atom)
					prevChain = atom.chainId
				}

				residueType = models[i].residues[atom.resNo]

				pdbString +=
				(isHetAtm?"HETATM":"ATOM  ")
				+ padLeft(entryNo.toString(),5)
				+ padLeft(atom.name,5)
				+ padLeft(residueType,4)
				+ padLeft(atom.chainId,2)
				+ padLeft(atom.resNo.toString(),4)
				+ "    "
				+ padLeft(atom.position.x.toFixed(3),8)
				+ padLeft(atom.position.y.toFixed(3),8)
				+ padLeft(atom.position.z.toFixed(3),8)
				+ atom.occupancyAndTemperatureFactor
				+ numberToElement[atom.element] + "  \n"

				entryNo++;
			}
		}
		if(!isHetAtm)
		{
			addTerminus(atom)
		}
		pdbString += "END"

		let data = new Blob([pdbString], {type: 'text/plain'});
		let textFile = window.URL.createObjectURL(data);
		let downloadObject = document.createElement("a");
		document.body.appendChild(downloadObject);
		downloadObject.style = "display: none";
		downloadObject.href = textFile;
		downloadObject.download = "ModelMadeInCootVR.pdb";
		downloadObject.click();
	}
}