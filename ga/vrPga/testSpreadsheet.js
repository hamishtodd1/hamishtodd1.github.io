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
    // ss.makeExtraCell(`A ∧ B * · ∨`)
    // ss.makeExtraCell(`⟨C⟩ |C| A/B √`)
    
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
}