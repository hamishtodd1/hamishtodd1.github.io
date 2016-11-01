//Alternatively, call the entire thing and get it to output something, and then strip stuff away
//Even more alternatively, this is the kind of thing that a master's student could do. Or you should learn about surfaces yourself


/* From here http://3dmol.csb.pitt.edu/build/3Dmol-nojquery.js
 * 
 * atomlist appears to only need x,y,z, and element
 * 
 */
function 3Dmol_addSurface(type, style, atomsel, allsel) {
    // type 1: VDW 3: SAS 4: MS 2: SES
    // if sync is true, does all work in main thread, otherwise uses
    // workers
    // with workers, must ensure group is the actual modelgroup since
    // surface
    // will get added asynchronously
    // all atoms in atomlist are used to compute surfaces, but only the
    // surfaces
    // of atomsToShow are displayed (e.g., for showing cavities)
    var atomlist = null, focusSele = null;
    //TODO: currently generating a shallow copy to avoid problems when atoms are chagned
    //during surface generation - come up with a better solution
    var atomsToShow = shallowCopy(getAtomsFromSel(atomsel));
    if(!allsel) {
        atomlist = atomsToShow;
    }
    else {
        atomlist = shallowCopy(getAtomsFromSel(allsel));
    }
    
    var symmetries = false;
    var n;
    for (n = 0; n < models.length; n++) { 
        if(models[n]) {
            var symMatrices = models[n].getSymmetries();
            if (symMatrices.length > 1 || (symMatrices.length == 1 && !(symMatrices[0].isIdentity()))) {
                symmetries = true;
                break;
            }
        }
    }

    var addSurfaceHelper = function addSurfaceHelper(surfobj, atomlist, atomsToShow) {
    
        focusSele = atomsToShow;
            
        var atom;
        var time = new Date();
        var extent = 3Dmol_getExtent(atomsToShow, true);

        var i, il;
        if (style['map'] && style['map']['prop']) {
            // map color space using already set atom properties
            /** @type {AtomSpec} */
            var prop = style['map']['prop'];
            /** @type {Gradient} */
            var scheme = style['map']['scheme'] || style['map']['gradient'] || new 3Dmol_Gradient_RWB();
            var range = scheme.range();
            if (!range) {
                range = 3Dmol_getPropertyRange(atomsToShow, prop);
            }
            style.colorscheme = {prop: prop, gradient: scheme};

        }
        
        //cache surface color on each atom
        for (i = 0, il = atomlist.length; i < il; i++) {
            atom = atomlist[i];
            atom.surfaceColor = 3Dmol_getColorFromStyle(atom, style);
        }                

        var totalVol = volume(extent); // used to scale resolution
        var extents = carveUpExtent(extent, atomlist, atomsToShow);

        if (focusSele && focusSele.length && focusSele.length > 0) {
            var seleExtent = 3Dmol_getExtent(focusSele, true);
            // sort by how close to center of seleExtent
            var sortFunc = function(a, b) {
                var distSq = function(ex, sele) {
                    // distance from e (which has no center of mass) and
                    // sele which does
                    var e = ex.extent;
                    var x = e[1][0] - e[0][0];
                    var y = e[1][1] - e[0][1];
                    var z = e[1][2] - e[0][2];
                    var dx = (x - sele[2][0]);
                    dx *= dx;
                    var dy = (y - sele[2][1]);
                    dy *= dy;
                    var dz = (z - sele[2][2]);
                    dz *= dz;

                    return dx + dy + dz;
                };
                var d1 = distSq(a, seleExtent);
                var d2 = distSq(b, seleExtent);
                return d1 - d2;
            };
            extents.sort(sortFunc);
        }

        //console.log("Extents " + extents.length + "  "+ (+new Date() - time) + "ms");


        var reducedAtoms = [];
        // to reduce amount data transfered, just pass x,y,z,serial and elem
        for (i = 0, il = atomlist.length; i < il; i++) {
            atom = atomlist[i];
            reducedAtoms[i] = {
                x : atom.x,
                y : atom.y,
                z : atom.z,
                serial : i,
                elem : atom.elem
            };
        }

        //there was the possibility of multithreading here - maybe for another time
        {
            // to keep the browser from locking up, call through setTimeout
            var callSyncHelper = function callSyncHelper(i) {
                if (i >= extents.length)
                    return;

                var VandF = generateMeshSyncHelper(type, extents[i].extent,
                        extents[i].atoms, extents[i].toshow, reducedAtoms,
                        totalVol);
                var mesh = generateSurfaceMesh(atomlist, VandF, mat);
                3Dmol_mergeGeos(surfobj.geo, mesh);
                _viewer.render();

                setTimeout(callSyncHelper, 1, i + 1);
            }

            setTimeout(callSyncHelper, 1, 0);

        }

        // NOTE: This is misleading if 'async' mesh generation - returns immediately
    }
    
    style = style || {};
    var mat = getMatWithStyle(style);
    var surfobj = [];
    
    if (symmetries) { //do preprocessing
        var modelsAtomList = {};
        var modelsAtomsToShow = {};
        for (n = 0; n < models.length; n++) {
            modelsAtomList[n] = [];
            modelsAtomsToShow[n] = [];
        }
        for (n = 0; n < atomlist.length; n++) {
            modelsAtomList[atomlist[n].model].push(atomlist[n]);
        }
        for (n = 0; n < atomsToShow.length; n++) {
            modelsAtomsToShow[atomsToShow[n].model].push(atomsToShow[n]);
        }
        for (n = 0; n < models.length; n++) {
            surfobj.push({
                geo : new $3Dmol.Geometry(true),
                mat : mat,
                done : false,
                finished : false,
                symmetries : models[n].getSymmetries()
            // also webgl initialized
            });
            addSurfaceHelper(surfobj[n], modelsAtomList[n], modelsAtomsToShow[n]);
        }
    }
    else {
        surfobj.push({
            geo : new $3Dmol.Geometry(true),
            mat : mat,
            done : false,
            finished : false,
            symmetries : [new $3Dmol.Matrix4()]
        });
        addSurfaceHelper(surfobj[surfobj.length-1], atomlist, atomsToShow);
    } 
    var surfid = nextSurfID();
    surfaces[surfid] = surfobj;
    
    return surfid;

}

3Dmol_getExtent = function(atomlist, ignoreSymmetries) {
    var xmin, ymin, zmin, xmax, ymax, zmax, xsum, ysum, zsum, cnt;
    var includeSym = !ignoreSymmetries;

    xmin = ymin = zmin = 9999;
    xmax = ymax = zmax = -9999;
    xsum = ysum = zsum = cnt = 0;
    
    if (atomlist.length === 0)
        return [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ];
    for (var i = 0; i < atomlist.length; i++) {
        var atom = atomlist[i];
        if (typeof atom === 'undefined' || !isFinite(atom.x) ||
                !isFinite(atom.y) || !isFinite(atom.z))
            continue;
        cnt++;
        xsum += atom.x;
        ysum += atom.y;
        zsum += atom.z;
        
        xmin = (xmin < atom.x) ? xmin : atom.x;
        ymin = (ymin < atom.y) ? ymin : atom.y;
        zmin = (zmin < atom.z) ? zmin : atom.z;
        xmax = (xmax > atom.x) ? xmax : atom.x;
        ymax = (ymax > atom.y) ? ymax : atom.y;
        zmax = (zmax > atom.z) ? zmax : atom.z;
        
        if (atom.symmetries && includeSym) {
            for (var n = 0; n < atom.symmetries.length; n++) {
                cnt++;
                xsum += atom.symmetries[n].x;
                ysum += atom.symmetries[n].y;
                zsum += atom.symmetries[n].z;
                xmin = (xmin < atom.symmetries[n].x) ? xmin : atom.symmetries[n].x;
                ymin = (ymin < atom.symmetries[n].y) ? ymin : atom.symmetries[n].y;
                zmin = (zmin < atom.symmetries[n].z) ? zmin : atom.symmetries[n].z;
                xmax = (xmax > atom.symmetries[n].x) ? xmax : atom.symmetries[n].x;
                ymax = (ymax > atom.symmetries[n].y) ? ymax : atom.symmetries[n].y;
                zmax = (zmax > atom.symmetries[n].z) ? zmax : atom.symmetries[n].z; 
            }
        }  
    }

    return [ [ xmin, ymin, zmin ], [ xmax, ymax, zmax ],
            [ xsum / cnt, ysum / cnt, zsum / cnt ] ];
};

3Dmol_getPropertyRange = function (atomlist, prop) {
    var min = Number.POSITIVE_INFINITY;
    var max = Number.NEGATIVE_INFINITY;

    for (var i = 0, n = atomlist.length; i < n; i++) {
        var atom = atomlist[i];
        var val = 3Dmol_getAtomProperty(atom, prop);
        
        if(val != null) {
            if (val < min)
                min = val;
            if (val > max)
                max = val;                
        }
    }

    if (!isFinite(min) && !isFinite(max))
        min = max = 0;
    else if (!isFinite(min))
        min = max;
    else if (!isFinite(max))
        max = min;

    return [ min, max ];
}

3Dmol_Gradient_RWB = function(min, max,mid) {
    var mult = 1.0;
    if(typeof(max) == 'undefined' && $.isArray(min) && min.length >= 2) {
        //we were passed a single range
        max = min[1];
        min = min[0];
    }
    if(max < min) { //reverse the order
        mult = -1.0;
        min *= -1.0;
        max *= -1.0;
    }
        
    //map value to hex color, range is provided
    this.valueToHex = function(val, range) {
        var lo, hi;
        val = mult*val; //reverse if necessary
        if(range) {
            lo = range[0];
            hi = range[1];
        }
        else {
            lo = min;
            hi = max;
        }
    
        if(val === undefined)
            return 0xffffff;
        
        if(val < lo) val = lo;
        if(val > hi) val = hi;
        
        var middle = (hi+lo)/2;
        if(typeof(mid) != 'undefined')
            middle = mid; //allow user to specify midpoint
        var scale, color;
        
        //scale bottom from red to white
        if(val <= middle) {
            scale = Math.floor(255*Math.sqrt((val-lo)/(middle-lo)));
            color = 0xff0000 + 0x100*scale + scale;
            return color;
        }
        else { //form white to blue
            scale = Math.floor(255*Math.sqrt((1-(val-middle)/(hi-middle))));
            color =  0x10000*scale+0x100*scale+0xff;
            return color;
        }
    };
    

    //return range used for color mapping, null if none set
    this.range = function() {
        if(typeof(min) != "undefined" && typeof(max) != "undefined") {
            return [min,max];
        }
        return null;
    };

};

3Dmol_getColorFromStyle = function(atom, style) {
    var color = atom.color;
    if (typeof (style.color) != "undefined" && style.color != "spectrum")
        color = style.color;
    if(typeof(style.colorscheme) != "undefined") {
        if(typeof(3Dmol_elementColors[style.colorscheme]) != "undefined") {
            //name of builtin colorscheme
            var scheme = 3Dmol_elementColors[style.colorscheme];
            if(typeof(scheme[atom.elem]) != "undefined") {
                color = scheme[atom.elem];
            }
        } else if(typeof(style.colorscheme[atom.elem]) != 'undefined') {
            //actual color scheme provided
            color = style.colorscheme[atom.elem];
        } else if(typeof(style.colorscheme.prop) != 'undefined' &&
                typeof(style.colorscheme.gradient) != 'undefined') {         
            //apply a property mapping
            var prop = style.colorscheme.prop;
            var scheme = style.colorscheme.gradient;
            var range = scheme.range() || [-1,1]; //sensible default
            var val = 3Dmol_getAtomProperty(atom, prop);
            if(val != null) {
                color = scheme.valueToHex(val, range);
            }
        }
    } 
    else if(typeof(style.colorfunc) != "undefined") {
    	//this is a user provided function for turning an atom into a color
    	color = style.colorfunc(atom);
    }
    
    var C = 3Dmol_CC.color(color);
    return C;
}

3Dmol_CC = {
	    cache : {0:new 3Dmol_Color(0)},
	    color : function color_(hex) {
	        // Undefined values default to black
	        if(!hex)
	            return this.cache[0];
	        // cache hits
	        if(typeof(this.cache[hex]) !== "undefined") {
	            return this.cache[hex];
	        }
	        // arrays
	        else if(hex && hex.constructor === Array) {
	            // parse elements recursively
	            return hex.map(color_,this);
	        }
	        // numbers and hex strings
	        hex = this.getHex(hex);
	        if(typeof hex === 'number') {
	            var c = new 3Dmol_Color(hex);
	            this.cache[hex] = c;
	            return c;
	        } else {
	            // pass through $3Dmol.Color & other objects
	            return hex;
	        }
	    },
	 
	    colorTab : {
	        'white' : 0xFFFFFF,
	        'silver' : 0xC0C0C0,
	        'gray' : 0x808080,
	        'grey' : 0x808080,
	        'black' : 0x000000,
	        'red' : 0xFF0000,
	        'maroon' : 0x800000,
	        'yellow' : 0xFFFF00,
	        'orange' : 0xFF6600,
	        'olive' : 0x808000,
	        'lime' : 0x00FF00,
	        'green' : 0x008000,
	        'aqua' : 0x00FFFF,
	        'cyan' : 0x00FFFF,
	        'teal' : 0x008080,
	        'blue' : 0x0000FF,
	        'navy' : 0x000080,
	        'fuchsia' : 0xFF00FF,
	        'magenta' : 0xFF00FF,
	        'purple' : 0x800080
	    },    
	    getHex : function(hex) {
	        if (!isNaN(parseInt(hex)))
	            return parseInt(hex);
	        
	        else if (typeof(hex) === 'string') {
	            
	            return this.colorTab[hex.trim().toLowerCase()] || 0x000000;
	        }
	        return hex;
	    }
	    
	};

//probably easy to replicate
3Dmol_mergeGeos = function(geometry, mesh) {
    
    var meshGeo = mesh.geometry;
    
    if (meshGeo === undefined) 
        return;
    
    geometry.geometryGroups.push( meshGeo.geometryGroups[0] );
    
};

3Dmol_getAtomProperty = function(atom, prop) {
    var val = null;
    if (atom.properties
            && typeof (atom.properties[prop]) != "undefined") {
        val = atom.properties[prop];
    } else if(typeof(atom[prop]) != 'undefined') {
        val = atom[prop];
    }
    return val;
};

var 3Dmol_elementColors = {};
3Dmol_elementColors.defaultColor = 0xff1493;

3Dmol_elementColors.greenCarbon['C'] = 0x00ff00;
3Dmol_elementColors.cyanCarbon['C'] = 0x00ffff;
3Dmol_elementColors.magentaCarbon['C'] = 0xff00ff;
3Dmol_elementColors.yellowCarbon['C'] = 0xffff00;
3Dmol_elementColors.whiteCarbon['C'] = 0xffffff;
3Dmol_elementColors.orangeCarbon['C'] = 0xff6600;
3Dmol_elementColors.purpleCarbon['C'] = 0x800080;
3Dmol_elementColors.blueCarbon['C'] = 0x0000ff;

3Dmol_Color = function( color ){
    
    if ( arguments.length > 1) {
            this.r = arguments[0] || 0.0;
            this.g = arguments[1] || 0.0;
            this.b = arguments[2] || 0.0;

            return this;
    }
    
    return this.set(color);
                
};