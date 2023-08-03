'use strict'





var gLevel = {
    SIZE: 4,
    MINES: 2
}

//console.log(gLevel.SIZE);

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isTimerOn: false
}

const elMinesCount = document.querySelector('.mines span')
const elTimer = document.querySelector('.timer span')
const elSafe = document.querySelector('.safetext span')
const elShown = document.querySelector('.shown span')
const elEmoji = document.querySelector('.emoji span')
const elLive = document.querySelector('.lives span')
const MINE = '💥'
const FLAG = '🚩'

var gBoard
var gMinesCount = 0
var gUserLives
//var isFirstClick = true
var isHint = false
var gTimerIntervalId
var gSafeClicks




function onInit() {
    gBoard = createBoard()
    //console.table('gBoard:', gBoard)
    setMinesNegsCount()
    renderBoard(gBoard)
    gMinesCount = gLevel.MINES
    elMinesCount.innerText = gMinesCount
    clearInterval(gTimerIntervalId)
    gGame.isTimerOn = false
    elTimer.innerText = '00:00'
    gLevel.SIZE = 4
    gUserLives = 3
    gGame.shownCount = 0
    gSafeClicks = 3
    elShown.innerText = gGame.shownCount
    elEmoji.innerText = '😀'
    elLive.innerText = gUserLives
    elSafe.innerText = gSafeClicks
}




function createBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                lastContent: ''
            }
        }
    }

    randMine(board)

    //board[2][3].isMine = true
    //board[1][1].isMine = true
    return board
}



//looking for a random place on the board to put my mines in. 

function randMine(board) {
    var minesToPlace = 0;
    gMinesCount = 0
    while (minesToPlace < gLevel.MINES) {
        //console.log('gLevel.MINES:', gLevel.MINES)
        //console.log('gLevel.SIZE:', gLevel.SIZE)
        var rowIdx = getRandomInt(0, gLevel.SIZE)
        var colIdx = getRandomInt(0, gLevel.SIZE)
        var currCell = board[rowIdx][colIdx]
        //console.log('currCell:', currCell)
        //if (rowIdx === firstClickCol || colIdx === firstClickCol) continue
        if (currCell.isMine === false) {
            currCell.isMine = true
            minesToPlace++
            gMinesCount++

            //console.log('minesToPlace:', minesToPlace)
            //console.log('row:', rowIdx)
            //console.log('colIdx:', colIdx)
        }
        continue
    }


}





function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            var content = ''
            if (cell.isShown === false) {
                if (cell.isMine) {
                    content = MINE
                    cell.lastContent = content
                } else if (cell.minesAroundCount > 0) {
                    content = cell.minesAroundCount
                    cell.lastContent = content
                }
            }
            strHTML += `\t<td class="cell hidden" 
             data-i="${i}" data-j="${j}"
             onclick="onCellClicked(this)"
             oncontextmenu="onCellMarked(event, this)"> ${content}
                         </td>\n`

        }
        strHTML += `</tr>\n`
    }
    // console.log(strHTML)

    const elCells = document.querySelector('.board-cells')
    elCells.innerHTML = strHTML
}




function onCellClicked(elBtn) {
    const i = +elBtn.dataset.i
    const j = +elBtn.dataset.j
    //console.log(i, j)
    /*if (isHint === true) {
        console.log('im here')
        setTimeout(expandShown(i, j), 2000)
        isHint = false
    }*/




    const cell = gBoard[i][j]
    if (cell.isMarked) return
    if (cell.isShown) return
    console.log('cell.isShown:', cell.isShown)
    if (cell.isShown === false) {

        cell.isShown = true
        console.log('cell.isShown:', cell.isShown)
        elBtn.classList.remove('hidden')
        if (!gGame.isTimerOn) {
            console.log('gGame.isTimerOn:', gGame.isTimerOn)
            startTimer()
            gGame.isTimerOn = true
            console.log('gGame.isTimerOn:', gGame.isTimerOn)
        }
        gGame.shownCount++
        elShown.innerText = gGame.shownCount
        //checkGameOver()
        if (cell.isMine) {
            elBtn.classList.remove('hidden')
            cell.isShown = true
            gUserLives--
            gMinesCount--
            elLive.innerText = gUserLives
            elMinesCount.innerText = gMinesCount
            if (gUserLives === 0) {
                alert('you lost!')
                elEmoji.innerText = '😭'
                clearInterval(gTimerIntervalId)
                gGame.isTimerOn = false
                showMinesAfterLose()
                //elTimer.innerText = '00:00'
            }
            //onInit()
        }
        else if (cell.minesAroundCount > 0) {
            //calling my reveal function if my curr cell mines around is bigger or equal to 0
            expandShown(i, j)
            checkGameOver()
        }
        checkGameOver()
    }

}

//work!!
function showMinesAfterLose() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine && !currCell.isShown) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.remove('hidden')
            }
        }
    }
}

function onCellMarked(ev, elBtn) {
    ev.preventDefault() //disabling rightclick content
    const i = +elBtn.dataset.i
    const j = +elBtn.dataset.j
    const cell = gBoard[i][j]

    cell.isMarked = !cell.isMarked
    if (cell.isShown) return
    if (cell.isMine === true) {
        gGame.shownCount++
        const elShown = document.querySelector('.shown span')
        elShown.innerText = gGame.shownCount
        gMinesCount--
    }
    elMinesCount.innerText = gMinesCount
    console.log('gMinesCount:', gMinesCount)
    var lastContent = cell.lastContent
    elBtn.classList.add('flag');

    if (cell.isMarked) {
        elBtn.innerText = FLAG;
        elBtn.classList.remove('hidden')
    } else {
        elBtn.innerText = lastContent;
        elBtn.classList.add('hidden')
    }

}


/*function getHint(){

}*/



//done!
function getSafeClick() {
    if (gSafeClicks === 0) return
    var safeClicksArr = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (!currCell.isShown && !currCell.isMine && !currCell.isMarked) {
                safeClicksArr.push(elCell)
            }
        }
    }
    var randCellIdx = getRandomInt(0, safeClicksArr.length - 1)
    //console.log('randCell:', randCell)
    const randCell = safeClicksArr[randCellIdx]
    console.log('randCell:', randCell)
    randCell.classList.add('safe-click')
    gSafeClicks--

    elSafe.innerText = gSafeClicks
    setTimeout(() => {
        randCell.classList.remove('safe-click')
    }, 2500);

}



//revealing my cells
function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            //catching in the modal
            const cell = gBoard[i][j]
            //catching the currCell in dom
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (cell.isShown === false && cell.isMine === false) {
                cell.isShown = true
                elCell.classList.remove('hidden')
                gGame.shownCount++
                console.log('gGame.shownCount:', gGame.shownCount)
                var elShown = document.querySelector('.shown span')
                elShown.innerText = gGame.shownCount
                checkGameOver()
            }
        }
    }
}



function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = countNegMines(i, j);
            }
        }
    }
}



function countNegMines(rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = gBoard[i][j]
            if (currCell.isMine) count++
        }
    }
    //console.log('count:', count)
    return count
}



function changeDifficult(num) {
    console.log('num:', num)
    const elCells = document.querySelector('.board-cells')
    console.log('elCells:', elCells)
    elCells.innerText = ''
    if (num === 4) {
        gLevel.SIZE = num
        gLevel.MINES = 2
        onInit()
    }
    else if (num === 8) {
        gLevel.SIZE = num
        gLevel.MINES = 14
        onInit()
    }
    else if (num === 12) {
        gLevel.SIZE = num
        gLevel.MINES = 32
        onInit()
    }
    return
}



//work!!!!
function checkGameOver() {
    console.log('checkover ACTIVATED');
    var revealedNums = 0
    var revealedMines = 0
    var flaggedMines = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine && currCell.isShown) revealedMines++
            if (currCell.isShown && !currCell.isMine) revealedNums++
            if (currCell.isMarked && currCell.isMine) flaggedMines++
            //console.log('flaggedMines:', flaggedMines)
            //console.log('revealedNums:', revealedNums)
            //console.log('revealedMines:', revealedMines)
        }
    }
    if (revealedMines <= 3 && flaggedMines === gLevel.MINES - revealedMines && gBoard.length * gBoard[0].length - gLevel.MINES === revealedNums) {
        alert('u won')
        const elEmoji = document.querySelector('.emoji span')
        elEmoji.innerText = '😎'
        clearInterval(gTimerIntervalId)
        gGame.isTimerOn = false
        return true
    }
    return false

}



function startTimer() {
    var start = Date.now()
    gTimerIntervalId =
        setInterval(function () {
            var delta = Date.now() - start;
            var elTimer = document.querySelector('.timer span')
            elTimer.innerText = `${(delta / 1000)}`
            //console.log((delta / 1000))
        }, 77)
}




function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
    // The maximum is exclusive and the minimum is inclusive
}