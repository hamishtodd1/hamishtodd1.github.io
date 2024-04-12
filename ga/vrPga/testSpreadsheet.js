/*
    Functions in spreadsheets:
        Your goal is to make it so you can write foo(x,y)
        You have an extra spreadsheet column, you give the column the name foo
        You just have the arguments override the first lines of foo
        And it gives back the last line of foo
        When foo is called in a cell and you select that cell
            a copy of foo is made and brought over
            it sits next to that cell

    Maybe the spreadsheet somehow summarizes plane and point as 0.8*plane+0.6*point
        and then when you have those on their own you see the reality

    Spreadsheet: comma, not +. You're not really giving people +!
        Midpoint is rarely needed. And gettable by other means?
 */

function initTestSpreadsheet() {
    let ss = new Spreadsheet()
    selectedSpreadsheet = ss
    selectCell(ss, 0)
    ss.quaternion.copy(camera.quaternion)
    comfortableLookPos(fl0, 0.).pointToGibbsVec(ss.position)
    // ss.makeExtraCell(`A ∧ B * · ∨`)
    // ss.makeExtraCell(`⟨C⟩ |C| A/B √`)
    
    // `plane`,
    // `rotation`,
    // `A1*A2`,
    // ` `,
    // `point`,
    // `point`,
    // `√ (A5 / A6)`,
    
    let unadvancedCells = [
        `point`,      //eye position
        `direction`,  //eye direction
        `point`,      //fish initial position
        `A1 join A2`, //L1
        `A1 join A3`, //L2
        `A4 transform_to A5`, //eye transform / eye
        `transform`, //fish transform
        `A3 transformed_by A7`, //fish current position
    ]
    unadvancedCells.forEach(cell => ss.makeExtraCell(cell))

    let advancedCells = [
        `1.9e013, 1.1e023, e123`,
        `e012`, 
        `3.6e012, 2.1e023, e123`,
        `A1 V A2`, //Dual of duals?
        `A1 V A3`,
        `√ (A4 / A5)`,
        `0.8, 0.6e12`,
        `A7 * A3 / A7`,
    ]
    // advancedCells.forEach(cell => ss.makeExtraCell(cell))

    addRotationToSpreadsheetMaybe = () => {
        if(!ss.visible || ss.cells.length > unadvancedCells.length)
            return
        ss.makeExtraCell(`rotation`)
    }
    
    let advancedness = 0
    ss.visible = false
    advanceSpreadsheet = () => {

        advancedness = (advancedness + 1) % 3
        if (advancedness === 0)
            ++advancedness

        if (advancedness === 0)
            ss.visible = false
        else {
            ss.visible = true

            let oneToUse = advancedness === 1 ? unadvancedCells : advancedCells
            oneToUse.forEach((newContents, i) => {
                ss.cells[i].setText(newContents)
            })
        }
    }
}