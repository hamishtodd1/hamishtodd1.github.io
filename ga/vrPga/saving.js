function initSaving(builtInVizes) {
    
    save = ()=> {
        let arr = []
        snappables.forEach((sn, snIndex) => {

            //TODO not the ones that the user didn't create
            if(sn === null || builtInVizes.includes(sn) ) {
                arr.push(null)
                return
            }

            // debugger
            let s = {
                type: sn.constructor === DqViz ? 'dq' : 'fl',
                values: sn.mv.toArray([]).toString(),
                affecters: Array(3),
                color: sn.constructor === DqViz ? 
                    sn.rotAxisMesh.material.color.getHex():
                    sn.pointMesh.material.color.getHex(),
                cses: sn.sclptable === null ? null : Array(sn.sclptable.children.length),
                csCounts: sn.sclptable === null ? null : Array(sn.sclptable.children.length)
            }
            arr.push(s)

            //affecters
            s.affecters[0] = sn.affecters[0] === null ? -1 : snappables.indexOf(sn.affecters[0])
            s.affecters[1] = sn.affecters[1] === null ? -1 : snappables.indexOf(sn.affecters[1])
            s.affecters[2] = sn.affecters[2]

            //sclptable
            if(sn.sclptable !== null) {
                sn.sclptable.children.forEach((cs, csIndex) => {

                    if (cs.geometry.drawRange.count === 0) {
                        s.csCounts[csIndex] = 0
                        s.cses[csIndex] = ``
                    }
                    else {
                        s.csCounts[csIndex] = cs.geometry.drawRange.count
                        s.cses[csIndex] = cs.geometry.attributes.position.array.toString()
                    }
                })
                log(sn.sclptable.boundingBox)
            }
        })

        return JSON.stringify(arr)
    }

    load = (saveStr) => {

        let parsed = JSON.parse(saveStr)
        parsed.forEach((snObj, snIndex) => {

            
            if( snObj === null ) {
                if( snappables[snIndex] !== null )
                    snappables[snIndex] = null
                return
            }
            // debugger

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
                if(snObj.cses === null) 
                    sn.sclptable = null
                else {
                    sn.sclptable = new Sclptable( sn )
    
                    snObj.cses.forEach((csArrStr, csIndex) => {
                        let cs = sn.sclptable.children[csIndex]
                        cs.geometry.drawRange.count = snObj.csCounts[csIndex]
                        if( snObj.csCounts[csIndex] !== 0) {
                            sn.sclptable.boundingBox.makeEmpty()

                            let arr = csArrStr.split(`,`)
                            // for (let i = 0, il = snObj.csCounts[csIndex]; i < il; ++i) {
                            //     let c3 = cs.lowestUnusedCube * 3
                            //     cs.vAttr.array[c3 + 0] = rounded[0]
                            //     cs.vAttr.array[c3 + 1] = rounded[1]
                            //     cs.vAttr.array[c3 + 2] = rounded[2]
                            // }
                            // debugger
                            for (let i = 0, il = snObj.csCounts[csIndex]; i < il; ++i)
                                cs.fillCubePositionIfEmpty(v1.set(parseFloat(arr[i * 3 + 0]), parseFloat(arr[i * 3 + 1]), parseFloat(arr[i * 3 + 2])))

                            // debugger
                        }
                    })
                    log(sn.sclptable.boundingBox)
                    updateBoxHelper(sn.sclptable.boxHelper, sn.sclptable.boundingBox)
                }
            }
        })
    }
}