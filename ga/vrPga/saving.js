function initSaving() {
    
    save = ()=> {
        let saveObj = {
            snappables: [],
        }
        snappables.forEach((sn, snIndex) => {

            //TODO not the ones that the user didn't create
            if(sn === null) {
                saveObj.snappables[snIndex] = null
                return
            }

            let snObj = {
                type: sn.constructor === Dq ? 'dq' : 'fl',
                values: sn.mv.toArray([]).toString()
                affecters = Array(3)
                color: sn.constructor === Dq ? 
                    sn.pointMesh.material.color.toHex() : 
                    sn.rotAxisMesh.material.color.toHex(),
                sclptableChildren: null,
            }
            saveObj.snappables[snIndex] = snObj

            //affecters
            snObj.affecters[0] = sn.affecters[0] === null ? -1 : snappables.indexOf(sn.affecters[0]),
            snObj.affecters[1] = sn.affecters[1] === null ? -1 : snappables.indexOf(sn.affecters[1]),
            snObj.affecters[2] = sn.affecters[2]

            //sclptable
            if(sn.sclptable !== null) {
                snObj.sclptableChildren = Array(sn.sclptable.children.length)
                sn.sclptable.children.forEach((child, childIndex) => {
                    snObj.sclptableChildren[childIndex] = child.geometry.position.array.toString()
                })
            }
        })
    }

    load = () => {
        saveObj.snappables.forEach((snObj, snIndex) => {

            if( snObj === null ) {
                if( snappables[snIndex] !== null )
                    snappables[snIndex] = null
                return
            }

            snappables[snIndex] = snObj.type === 'dq' ?
                new DqViz(snObj.color) : 
                new FlViz(snObj.color)
            let sn = snappables[snIndex]
            sn.mv.fromArray(snObj.values.split(`,`))

            //affecters
            sn.affecters[0] = snObj.affecters[0] === -1 ? null : snappables[snObj.affecters[0]]
            sn.affecters[1] = snObj.affecters[1] === -1 ? null : snappables[snObj.affecters[1]]
            sn.affecters[2] = snObj.affecters[2]

            //sclptable
            if(snObj.type === 'dq') {
                if(snObj.sclptableChildren === null) 
                    sn.sclptable = null
                else {
                    sn.sclptable = new Sclptable( sn )
    
                    snObj.sclptableChildren.forEach((childArr, childIndex) => {
                        let arr = childArr.split(`,`)
                        let cs = sn.sclptable.children[childIndex]
                        for (let i = 0, il = parseInt(msg.count); i < il; ++i)
                            cs.fillCubePositionIfEmpty(v1.set(arr[i * 3 + 0], arr[i * 3 + 1], arr[i * 3 + 2]))
                    })
                    
                }
            }
        })
    }
}