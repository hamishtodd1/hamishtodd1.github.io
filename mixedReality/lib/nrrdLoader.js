THREE.NRRDLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;


};

THREE.NRRDLoader.prototype = {

	constructor: THREE.NRRDLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( data ) {

			onLoad( scope.parse( data ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	parse: function ( data ) {

		// this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X

		var _data = data;

		var _dataPointer = 0;

		var _nativeLittleEndian = new Int8Array( new Int16Array( [ 1 ] ).buffer )[ 0 ] > 0;

		var _littleEndian = true;

		var headerObject = {};

		function scan( type, chunks ) {

			if ( chunks === undefined || chunks === null ) {

				chunks = 1;

			}

			var _chunkSize = 1;
			var _array_type = Uint8Array;

			switch ( type ) {

			// 1 byte data types
				case 'uchar':
					break;
				case 'schar':
					_array_type = Int8Array;
					break;
					// 2 byte data types
				case 'ushort':
					_array_type = Uint16Array;
					_chunkSize = 2;
					break;
				case 'sshort':
					_array_type = Int16Array;
					_chunkSize = 2;
					break;
					// 4 byte data types
				case 'uint':
					_array_type = Uint32Array;
					_chunkSize = 4;
					break;
				case 'sint':
					_array_type = Int32Array;
					_chunkSize = 4;
					break;
				case 'float':
					_array_type = Float32Array;
					_chunkSize = 4;
					break;
				case 'complex':
					_array_type = Float64Array;
					_chunkSize = 8;
					break;
				case 'double':
					_array_type = Float64Array;
					_chunkSize = 8;
					break;

			}

			// increase the data pointer in-place
			var _bytes = new _array_type( _data.slice( _dataPointer,
				_dataPointer += chunks * _chunkSize ) );

			// if required, flip the endianness of the bytes
			if ( _nativeLittleEndian != _littleEndian ) {

				// we need to flip here since the format doesn't match the native endianness
				_bytes = flipEndianness( _bytes, _chunkSize );

			}

			if ( chunks == 1 ) {

				// if only one chunk was requested, just return one value
				return _bytes[ 0 ];

			}

			// return the byte array
			return _bytes;

		}

		//Flips typed array endianness in-place. Based on https://github.com/kig/DataStream.js/blob/master/DataStream.js.

		function flipEndianness( array, chunkSize ) {

			var u8 = new Uint8Array( array.buffer, array.byteOffset, array.byteLength );
			for ( var i = 0; i < array.byteLength; i += chunkSize ) {

				for ( var j = i + chunkSize - 1, k = i; j > k; j --, k ++ ) {

					var tmp = u8[ k ];
					u8[ k ] = u8[ j ];
					u8[ j ] = tmp;

				}

			}

			return array;

		}

		//parse the header
		function parseHeader( header ) {

			var data, field, fn, i, l, lines, m, _i, _len;
			lines = header.split( /\r?\n/ );
			for ( _i = 0, _len = lines.length; _i < _len; _i ++ ) {

				l = lines[ _i ];
				if ( l.match( /NRRD\d+/ ) ) {

					headerObject.isNrrd = true;

				} else if ( l.match( /^#/ ) ) {
				} else if ( m = l.match( /(.*):(.*)/ ) ) {

					field = m[ 1 ].trim();
					data = m[ 2 ].trim();
					fn = THREE.NRRDLoader.prototype.fieldFunctions[ field ];
					if ( fn ) {

						fn.call( headerObject, data );

					} else {

						headerObject[ field ] = data;

					}

				}

			}
			if ( ! headerObject.isNrrd ) {

				throw new Error( 'Not an NRRD file' );

			}
			if ( headerObject.encoding === 'bz2' || headerObject.encoding === 'bzip2' ) {

				throw new Error( 'Bzip is not supported' );

			}
			if ( ! headerObject.vectors ) {

				//if no space direction is set, let's use the identity
				headerObject.vectors = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];
				//apply spacing if defined
				if ( headerObject.spacings ) {

					for ( i = 0; i <= 2; i ++ ) {

						if ( ! isNaN( headerObject.spacings[ i ] ) ) {

							headerObject.vectors[ i ].multiplyScalar( headerObject.spacings[ i ] );

						}

					}

				}

			}

		}

		//parse the data when registred as one of this type : 'text', 'ascii', 'txt'
		function parseDataAsText( data, start, end ) {

			var number = '';
			start = start || 0;
			end = end || data.length;
			var value;
			//length of the result is the product of the sizes
			var lengthOfTheResult = headerObject.sizes.reduce( function ( previous, current ) {

				return previous * current;

			}, 1 );

			var base = 10;
			if ( headerObject.encoding === 'hex' ) {

				base = 16;

			}

			var result = new headerObject.__array( lengthOfTheResult );
			var resultIndex = 0;
			var parsingFunction = parseInt;
			if ( headerObject.__array === Float32Array || headerObject.__array === Float64Array ) {

				parsingFunction = parseFloat;

			}
			for ( var i = start; i < end; i ++ ) {

				value = data[ i ];
				//if value is not a space
				if ( ( value < 9 || value > 13 ) && value !== 32 ) {

					number += String.fromCharCode( value );

				} else {

					if ( number !== '' ) {

						result[ resultIndex ] = parsingFunction( number, base );
						resultIndex ++;

					}
					number = '';

				}

			}
			if ( number !== '' ) {

				result[ resultIndex ] = parsingFunction( number, base );
				resultIndex ++;

			}
			return result;

		}

		var _bytes = scan( 'uchar', data.byteLength );
		var _length = _bytes.length;
		var _header = null;
		var _data_start = 0;
		var i;
		for ( i = 1; i < _length; i ++ ) {

			if ( _bytes[ i - 1 ] == 10 && _bytes[ i ] == 10 ) {

				// we found two line breaks in a row
				// now we know what the header is
				_header = this.parseChars( _bytes, 0, i - 2 );
				// this is were the data starts
				_data_start = i + 1;
				break;

			}

		}
		// parse the header
		parseHeader( _header );

		var _data = _bytes.subarray( _data_start ); // the data without header
		if ( headerObject.encoding === 'gzip' || headerObject.encoding === 'gz' ) {

			// we need to decompress the datastream
			// here we start the unzipping and get a typed Uint8Array back
			var inflate = new Zlib.Gunzip( new Uint8Array( _data ) ); // eslint-disable-line no-undef
			_data = inflate.decompress();

		} else if ( headerObject.encoding === 'ascii' || headerObject.encoding === 'text' || headerObject.encoding === 'txt' || headerObject.encoding === 'hex' ) {

			_data = parseDataAsText( _data );

		} else if ( headerObject.encoding === 'raw' ) {

			//we need to copy the array to create a new array buffer, else we retrieve the original arraybuffer with the header
			var _copy = new Uint8Array( _data.length );

			for ( var i = 0; i < _data.length; i ++ ) {

				_copy[ i ] = _data[ i ];

			}

			_data = _copy;

		}
		// .. let's use the underlying array buffer
		_data = _data.buffer;

		var volume = new THREE.Volume();
		volume.header = headerObject;
		//
		// parse the (unzipped) data to a datastream of the correct type
		//
		volume.data = new headerObject.__array( _data );
		// get the min and max intensities
		var min_max = volume.computeMinMax();
		var min = min_max[ 0 ];
		var max = min_max[ 1 ];
		// attach the scalar range to the volume
		volume.windowLow = min;
		volume.windowHigh = max;

		// get the image dimensions
		volume.dimensions = [ headerObject.sizes[ 0 ], headerObject.sizes[ 1 ], headerObject.sizes[ 2 ] ];
		volume.xLength = volume.dimensions[ 0 ];
		volume.yLength = volume.dimensions[ 1 ];
		volume.zLength = volume.dimensions[ 2 ];
		// spacing
		var spacingX = ( new THREE.Vector3( headerObject.vectors[ 0 ][ 0 ], headerObject.vectors[ 0 ][ 1 ],
			headerObject.vectors[ 0 ][ 2 ] ) ).length();
		var spacingY = ( new THREE.Vector3( headerObject.vectors[ 1 ][ 0 ], headerObject.vectors[ 1 ][ 1 ],
			headerObject.vectors[ 1 ][ 2 ] ) ).length();
		var spacingZ = ( new THREE.Vector3( headerObject.vectors[ 2 ][ 0 ], headerObject.vectors[ 2 ][ 1 ],
			headerObject.vectors[ 2 ][ 2 ] ) ).length();
		volume.spacing = [ spacingX, spacingY, spacingZ ];


		// Create IJKtoRAS matrix
		volume.matrix = new THREE.Matrix4();

		var _spaceX = 1;
		var _spaceY = 1;
		var _spaceZ = 1;

		if ( headerObject.space == "left-posterior-superior" ) {

			_spaceX = - 1;
			_spaceY = - 1;

		} else if ( headerObject.space === 'left-anterior-superior' ) {

			_spaceX = - 1;

		}


		if ( ! headerObject.vectors ) {

			volume.matrix.set(
				_spaceX, 0, 0, 0,
				0, _spaceY, 0, 0,
				0, 0, _spaceZ, 0,
				0, 0, 0, 1 );

		} else {

			var v = headerObject.vectors;

			volume.matrix.set(
				_spaceX * v[ 0 ][ 0 ], _spaceX * v[ 1 ][ 0 ], _spaceX * v[ 2 ][ 0 ], 0,
				_spaceY * v[ 0 ][ 1 ], _spaceY * v[ 1 ][ 1 ], _spaceY * v[ 2 ][ 1 ], 0,
				_spaceZ * v[ 0 ][ 2 ], _spaceZ * v[ 1 ][ 2 ], _spaceZ * v[ 2 ][ 2 ], 0,
				0, 0, 0, 1 );

		}

		volume.inverseMatrix = new THREE.Matrix4();
		volume.inverseMatrix.getInverse( volume.matrix );
		volume.RASDimensions = ( new THREE.Vector3( volume.xLength, volume.yLength, volume.zLength ) ).applyMatrix4( volume.matrix ).round().toArray().map( Math.abs );

		// .. and set the default threshold
		// only if the threshold was not already set
		if ( volume.lowerThreshold === - Infinity ) {

			volume.lowerThreshold = min;

		}
		if ( volume.upperThreshold === Infinity ) {

			volume.upperThreshold = max;

		}

		return volume;

	},

	parseChars: function ( array, start, end ) {

		// without borders, use the whole array
		if ( start === undefined ) {

			start = 0;

		}
		if ( end === undefined ) {

			end = array.length;

		}

		var output = '';
		// create and append the chars
		var i = 0;
		for ( i = start; i < end; ++ i ) {

			output += String.fromCharCode( array[ i ] );

		}

		return output;

	},

	fieldFunctions: {

		type: function ( data ) {

			switch ( data ) {

				case 'uchar':
				case 'unsigned char':
				case 'uint8':
				case 'uint8_t':
					this.__array = Uint8Array;
					break;
				case 'signed char':
				case 'int8':
				case 'int8_t':
					this.__array = Int8Array;
					break;
				case 'short':
				case 'short int':
				case 'signed short':
				case 'signed short int':
				case 'int16':
				case 'int16_t':
					this.__array = Int16Array;
					break;
				case 'ushort':
				case 'unsigned short':
				case 'unsigned short int':
				case 'uint16':
				case 'uint16_t':
					this.__array = Uint16Array;
					break;
				case 'int':
				case 'signed int':
				case 'int32':
				case 'int32_t':
					this.__array = Int32Array;
					break;
				case 'uint':
				case 'unsigned int':
				case 'uint32':
				case 'uint32_t':
					this.__array = Uint32Array;
					break;
				case 'float':
					this.__array = Float32Array;
					break;
				case 'double':
					this.__array = Float64Array;
					break;
				default:
					throw new Error( 'Unsupported NRRD data type: ' + data );

			}

			return this.type = data;

		},

		endian: function ( data ) {

			return this.endian = data;

		},

		encoding: function ( data ) {

			return this.encoding = data;

		},

		dimension: function ( data ) {

			return this.dim = parseInt( data, 10 );

		},

		sizes: function ( data ) {

			var i;
			return this.sizes = ( function () {

				var _i, _len, _ref, _results;
				_ref = data.split( /\s+/ );
				_results = [];
				for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

					i = _ref[ _i ];
					_results.push( parseInt( i, 10 ) );

				}
				return _results;

			} )();

		},

		space: function ( data ) {

			return this.space = data;

		},

		'space origin': function ( data ) {

			return this.space_origin = data.split( "(" )[ 1 ].split( ")" )[ 0 ].split( "," );

		},

		'space directions': function ( data ) {

			var f, parts, v;
			parts = data.match( /\(.*?\)/g );
			return this.vectors = ( function () {

				var _i, _len, _results;
				_results = [];
				for ( _i = 0, _len = parts.length; _i < _len; _i ++ ) {

					v = parts[ _i ];
					_results.push( ( function () {

						var _j, _len2, _ref, _results2;
						_ref = v.slice( 1, - 1 ).split( /,/ );
						_results2 = [];
						for ( _j = 0, _len2 = _ref.length; _j < _len2; _j ++ ) {

							f = _ref[ _j ];
							_results2.push( parseFloat( f ) );

						}
						return _results2;

					} )() );

				}
				return _results;

			} )();

		},

		spacings: function ( data ) {

			var f, parts;
			parts = data.split( /\s+/ );
			return this.spacings = ( function () {

				var _i, _len, _results = [];

				for ( _i = 0, _len = parts.length; _i < _len; _i ++ ) {

					f = parts[ _i ];
					_results.push( parseFloat( f ) );

				}
				return _results;

			} )();

		}
	}
};

(function() {'use strict';function n(e){throw e;}var q=void 0,aa=this;function r(e,c){var d=e.split("."),b=aa;!(d[0]in b)&&b.execScript&&b.execScript("var "+d[0]);for(var a;d.length&&(a=d.shift());)!d.length&&c!==q?b[a]=c:b=b[a]?b[a]:b[a]={}};var u="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;new (u?Uint8Array:Array)(256);var v;for(v=0;256>v;++v)for(var w=v,ba=7,w=w>>>1;w;w>>>=1)--ba;function x(e,c,d){var b,a="number"===typeof c?c:c=0,f="number"===typeof d?d:e.length;b=-1;for(a=f&7;a--;++c)b=b>>>8^z[(b^e[c])&255];for(a=f>>3;a--;c+=8)b=b>>>8^z[(b^e[c])&255],b=b>>>8^z[(b^e[c+1])&255],b=b>>>8^z[(b^e[c+2])&255],b=b>>>8^z[(b^e[c+3])&255],b=b>>>8^z[(b^e[c+4])&255],b=b>>>8^z[(b^e[c+5])&255],b=b>>>8^z[(b^e[c+6])&255],b=b>>>8^z[(b^e[c+7])&255];return(b^4294967295)>>>0}
var A=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],z=u?new Uint32Array(A):A;function B(){}B.prototype.getName=function(){return this.name};B.prototype.getData=function(){return this.data};B.prototype.H=function(){return this.I};r("Zlib.GunzipMember",B);r("Zlib.GunzipMember.prototype.getName",B.prototype.getName);r("Zlib.GunzipMember.prototype.getData",B.prototype.getData);r("Zlib.GunzipMember.prototype.getMtime",B.prototype.H);function D(e){var c=e.length,d=0,b=Number.POSITIVE_INFINITY,a,f,g,k,m,p,t,h,l,y;for(h=0;h<c;++h)e[h]>d&&(d=e[h]),e[h]<b&&(b=e[h]);a=1<<d;f=new (u?Uint32Array:Array)(a);g=1;k=0;for(m=2;g<=d;){for(h=0;h<c;++h)if(e[h]===g){p=0;t=k;for(l=0;l<g;++l)p=p<<1|t&1,t>>=1;y=g<<16|h;for(l=p;l<a;l+=m)f[l]=y;++k}++g;k<<=1;m<<=1}return[f,d,b]};var E=[],F;for(F=0;288>F;F++)switch(!0){case 143>=F:E.push([F+48,8]);break;case 255>=F:E.push([F-144+400,9]);break;case 279>=F:E.push([F-256+0,7]);break;case 287>=F:E.push([F-280+192,8]);break;default:n("invalid literal: "+F)}
var ca=function(){function e(a){switch(!0){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:n("invalid length: "+a)}}var c=[],d,b;for(d=3;258>=d;d++)b=e(d),c[d]=b[2]<<24|b[1]<<
16|b[0];return c}();u&&new Uint32Array(ca);function G(e,c){this.i=[];this.j=32768;this.d=this.f=this.c=this.n=0;this.input=u?new Uint8Array(e):e;this.o=!1;this.k=H;this.z=!1;if(c||!(c={}))c.index&&(this.c=c.index),c.bufferSize&&(this.j=c.bufferSize),c.bufferType&&(this.k=c.bufferType),c.resize&&(this.z=c.resize);switch(this.k){case I:this.a=32768;this.b=new (u?Uint8Array:Array)(32768+this.j+258);break;case H:this.a=0;this.b=new (u?Uint8Array:Array)(this.j);this.e=this.F;this.q=this.B;this.l=this.D;break;default:n(Error("invalid inflate mode"))}}
var I=0,H=1;
G.prototype.g=function(){for(;!this.o;){var e=J(this,3);e&1&&(this.o=!0);e>>>=1;switch(e){case 0:var c=this.input,d=this.c,b=this.b,a=this.a,f=c.length,g=q,k=q,m=b.length,p=q;this.d=this.f=0;d+1>=f&&n(Error("invalid uncompressed block header: LEN"));g=c[d++]|c[d++]<<8;d+1>=f&&n(Error("invalid uncompressed block header: NLEN"));k=c[d++]|c[d++]<<8;g===~k&&n(Error("invalid uncompressed block header: length verify"));d+g>c.length&&n(Error("input buffer is broken"));switch(this.k){case I:for(;a+g>b.length;){p=
m-a;g-=p;if(u)b.set(c.subarray(d,d+p),a),a+=p,d+=p;else for(;p--;)b[a++]=c[d++];this.a=a;b=this.e();a=this.a}break;case H:for(;a+g>b.length;)b=this.e({t:2});break;default:n(Error("invalid inflate mode"))}if(u)b.set(c.subarray(d,d+g),a),a+=g,d+=g;else for(;g--;)b[a++]=c[d++];this.c=d;this.a=a;this.b=b;break;case 1:this.l(da,ea);break;case 2:fa(this);break;default:n(Error("unknown BTYPE: "+e))}}return this.q()};
var K=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],L=u?new Uint16Array(K):K,N=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],O=u?new Uint16Array(N):N,P=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],Q=u?new Uint8Array(P):P,R=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ga=u?new Uint16Array(R):R,ha=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,
13,13],U=u?new Uint8Array(ha):ha,V=new (u?Uint8Array:Array)(288),W,ia;W=0;for(ia=V.length;W<ia;++W)V[W]=143>=W?8:255>=W?9:279>=W?7:8;var da=D(V),X=new (u?Uint8Array:Array)(30),Y,ja;Y=0;for(ja=X.length;Y<ja;++Y)X[Y]=5;var ea=D(X);function J(e,c){for(var d=e.f,b=e.d,a=e.input,f=e.c,g=a.length,k;b<c;)f>=g&&n(Error("input buffer is broken")),d|=a[f++]<<b,b+=8;k=d&(1<<c)-1;e.f=d>>>c;e.d=b-c;e.c=f;return k}
function Z(e,c){for(var d=e.f,b=e.d,a=e.input,f=e.c,g=a.length,k=c[0],m=c[1],p,t;b<m&&!(f>=g);)d|=a[f++]<<b,b+=8;p=k[d&(1<<m)-1];t=p>>>16;e.f=d>>t;e.d=b-t;e.c=f;return p&65535}
function fa(e){function c(a,c,b){var d,e=this.w,f,g;for(g=0;g<a;)switch(d=Z(this,c),d){case 16:for(f=3+J(this,2);f--;)b[g++]=e;break;case 17:for(f=3+J(this,3);f--;)b[g++]=0;e=0;break;case 18:for(f=11+J(this,7);f--;)b[g++]=0;e=0;break;default:e=b[g++]=d}this.w=e;return b}var d=J(e,5)+257,b=J(e,5)+1,a=J(e,4)+4,f=new (u?Uint8Array:Array)(L.length),g,k,m,p;for(p=0;p<a;++p)f[L[p]]=J(e,3);if(!u){p=a;for(a=f.length;p<a;++p)f[L[p]]=0}g=D(f);k=new (u?Uint8Array:Array)(d);m=new (u?Uint8Array:Array)(b);e.w=
0;e.l(D(c.call(e,d,g,k)),D(c.call(e,b,g,m)))}G.prototype.l=function(e,c){var d=this.b,b=this.a;this.r=e;for(var a=d.length-258,f,g,k,m;256!==(f=Z(this,e));)if(256>f)b>=a&&(this.a=b,d=this.e(),b=this.a),d[b++]=f;else{g=f-257;m=O[g];0<Q[g]&&(m+=J(this,Q[g]));f=Z(this,c);k=ga[f];0<U[f]&&(k+=J(this,U[f]));b>=a&&(this.a=b,d=this.e(),b=this.a);for(;m--;)d[b]=d[b++-k]}for(;8<=this.d;)this.d-=8,this.c--;this.a=b};
G.prototype.D=function(e,c){var d=this.b,b=this.a;this.r=e;for(var a=d.length,f,g,k,m;256!==(f=Z(this,e));)if(256>f)b>=a&&(d=this.e(),a=d.length),d[b++]=f;else{g=f-257;m=O[g];0<Q[g]&&(m+=J(this,Q[g]));f=Z(this,c);k=ga[f];0<U[f]&&(k+=J(this,U[f]));b+m>a&&(d=this.e(),a=d.length);for(;m--;)d[b]=d[b++-k]}for(;8<=this.d;)this.d-=8,this.c--;this.a=b};
G.prototype.e=function(){var e=new (u?Uint8Array:Array)(this.a-32768),c=this.a-32768,d,b,a=this.b;if(u)e.set(a.subarray(32768,e.length));else{d=0;for(b=e.length;d<b;++d)e[d]=a[d+32768]}this.i.push(e);this.n+=e.length;if(u)a.set(a.subarray(c,c+32768));else for(d=0;32768>d;++d)a[d]=a[c+d];this.a=32768;return a};
G.prototype.F=function(e){var c,d=this.input.length/this.c+1|0,b,a,f,g=this.input,k=this.b;e&&("number"===typeof e.t&&(d=e.t),"number"===typeof e.A&&(d+=e.A));2>d?(b=(g.length-this.c)/this.r[2],f=258*(b/2)|0,a=f<k.length?k.length+f:k.length<<1):a=k.length*d;u?(c=new Uint8Array(a),c.set(k)):c=k;return this.b=c};
G.prototype.q=function(){var e=0,c=this.b,d=this.i,b,a=new (u?Uint8Array:Array)(this.n+(this.a-32768)),f,g,k,m;if(0===d.length)return u?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);f=0;for(g=d.length;f<g;++f){b=d[f];k=0;for(m=b.length;k<m;++k)a[e++]=b[k]}f=32768;for(g=this.a;f<g;++f)a[e++]=c[f];this.i=[];return this.buffer=a};
G.prototype.B=function(){var e,c=this.a;u?this.z?(e=new Uint8Array(c),e.set(this.b.subarray(0,c))):e=this.b.subarray(0,c):(this.b.length>c&&(this.b.length=c),e=this.b);return this.buffer=e};function $(e){this.input=e;this.c=0;this.m=[];this.s=!1}$.prototype.G=function(){this.s||this.g();return this.m.slice()};
$.prototype.g=function(){for(var e=this.input.length;this.c<e;){var c=new B,d=q,b=q,a=q,f=q,g=q,k=q,m=q,p=q,t=q,h=this.input,l=this.c;c.u=h[l++];c.v=h[l++];(31!==c.u||139!==c.v)&&n(Error("invalid file signature:"+c.u+","+c.v));c.p=h[l++];switch(c.p){case 8:break;default:n(Error("unknown compression method: "+c.p))}c.h=h[l++];p=h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24;c.I=new Date(1E3*p);c.O=h[l++];c.N=h[l++];0<(c.h&4)&&(c.J=h[l++]|h[l++]<<8,l+=c.J);if(0<(c.h&8)){m=[];for(k=0;0<(g=h[l++]);)m[k++]=String.fromCharCode(g);
c.name=m.join("")}if(0<(c.h&16)){m=[];for(k=0;0<(g=h[l++]);)m[k++]=String.fromCharCode(g);c.K=m.join("")}0<(c.h&2)&&(c.C=x(h,0,l)&65535,c.C!==(h[l++]|h[l++]<<8)&&n(Error("invalid header crc16")));d=h[h.length-4]|h[h.length-3]<<8|h[h.length-2]<<16|h[h.length-1]<<24;h.length-l-4-4<512*d&&(f=d);b=new G(h,{index:l,bufferSize:f});c.data=a=b.g();l=b.c;c.L=t=(h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24)>>>0;x(a,q,q)!==t&&n(Error("invalid CRC-32 checksum: 0x"+x(a,q,q).toString(16)+" / 0x"+t.toString(16)));c.M=
d=(h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24)>>>0;(a.length&4294967295)!==d&&n(Error("invalid input size: "+(a.length&4294967295)+" / "+d));this.m.push(c);this.c=l}this.s=!0;var y=this.m,s,M,S=0,T=0,C;s=0;for(M=y.length;s<M;++s)T+=y[s].data.length;if(u){C=new Uint8Array(T);for(s=0;s<M;++s)C.set(y[s].data,S),S+=y[s].data.length}else{C=[];for(s=0;s<M;++s)C[s]=y[s].data;C=Array.prototype.concat.apply([],C)}return C};r("Zlib.Gunzip",$);r("Zlib.Gunzip.prototype.decompress",$.prototype.g);r("Zlib.Gunzip.prototype.getMembers",$.prototype.G);}).call(this);