'use strict'





var gLevel = {
    SIZE: 4,
    MINES: 2
}



var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isTimerOn: false
}


//model
var gBoard
var gMinesCount = 0
var gUserLives
//var isFirstClick = true
var isHint = false
var gTimerIntervalId
var gSafeClicks
var gHintsLeft
var gLastMoves = []
var gMinesToDestroy
var gMinesOnBoard = []

//dom
const elMinesCount = document.querySelector('.mines span')
const elTimer = document.querySelector('.timer span')
const elSafe = document.querySelector('.safetext span')
const elShown = document.querySelector('.shown span')
const elEmoji = document.querySelector('.emoji span')
const elLive = document.querySelector('.lives span')
const elHint = document.querySelector('.hint')
const elHintText = document.querySelector('.hinttext span')
const MINE = '💥'
const FLAG = '🚩'


function onInit() {
    gBoard = createBoard()
    //console.table('gBoard:', gBoard)
    setMinesNegsCount()
    renderBoard(gBoard)
    getAllMines()
    gGame.isOn = true
    gMinesCount = gLevel.MINES
    elMinesCount.innerText = gMinesCount
    clearInterval(gTimerIntervalId)
    gGame.isTimerOn = false
    elTimer.innerText = '00:00'
    gLevel.SIZE = 4
    gUserLives = 3
    gGame.shownCount = 0
    gSafeClicks = 3
    gHintsLeft = 3
    gMinesToDestroy = 3

    elHintText.innerText = gHintsLeft
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

    const elCells = document.querySelector('.board-cells')
    elCells.innerHTML = strHTML
}




function onCellClicked(elBtn) {
    if (!gGame.isOn) return
    const i = +elBtn.dataset.i
    const j = +elBtn.dataset.j
    //console.log(i, j)
    console.log('isHint:', isHint)
    const cell = gBoard[i][j]
    gLastMoves.push({ i, j })
    console.log('gLastMoves:', gLastMoves)
    if (cell.isMarked) return
    if (cell.isShown) return
    console.log('cell.isShown:', cell.isShown)
    if (cell.isShown === false && !isHint) {

        cell.isShown = true
        console.log('cell.isShown:', cell.isShown)
        elBtn.classList.remove('hidden')
        if (!gGame.isTimerOn) {
            console.log('gGame.isTimerOn:', gGame.isTimerOn)
            startTimer()
            gGame.isTimerOn = true
            console.log('gGame.isTimerOn:', gGame.isTimerOn)
        }
        if (cell.isShown && !cell.isMine) {

            gGame.shownCount++
            elShown.innerText = gGame.shownCount
        }
        //checkGameOver()
        if (cell.isMine) {
            elBtn.classList.remove('hidden')
            cell.isShown = true
            gUserLives--
            if (gMinesCount > 0) {
                gMinesCount--
            }
            elLive.innerText = gUserLives
            elMinesCount.innerText = gMinesCount
            if (gUserLives === 0) {
                gGame.isOn = false
                //alert('you lost!')
                elEmoji.innerText = '😭\n YOU LOST!'
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
    } else if (isHint) {
        console.log('hint activated!');
        revealHintCells(i, j)
        gHintsLeft--
        elHintText.innerText = gHintsLeft
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



//rightclick - marked = flagged 
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
        if (gMinesCount > 0) {
            gMinesCount--
        }

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



function getAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (cell.isMine && !cell.isShown) {
                gMinesOnBoard.push(elCell)
                //console.log('gMinesOnBoard:', gMinesOnBoard)
            }
        }
    }
    //console.log('gMinesOnBoard:', gMinesOnBoard)

}

//work!!
function exterminatorMines() {
    if (gMinesToDestroy === 0) return
    // console.log('gMinesOnBoard:', gMinesOnBoard)
    while (gMinesToDestroy > 0) {
        var randMineIdx = getRandomInt(0, gMinesOnBoard.length - 1)
        //console.log('im inside');
        var currMine = gMinesOnBoard[randMineIdx]
        //console.log(gMinesOnBoard[randMineIdx])
        var i = currMine.dataset.i
        var j = currMine.dataset.j
        const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
        elCell.classList.remove('hidden')
        if (gMinesCount > 0) gMinesCount--
        elMinesCount.innerText = gMinesCount
        gMinesToDestroy--
    }
}


//work!!!!
function getUndo() {
    if (!gGame.isOn) return
    if (gLastMoves.length === 0) return
    var lastMove = gLastMoves.pop()
    console.log('lastMove:', gLastMoves)
    for (var i = lastMove.i - 1; i <= lastMove.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = lastMove.j - 1; j <= lastMove.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            const cell = gBoard[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (cell.isShown && !cell.isMine) {
                cell.isShown = false
                gGame.shownCount--
                elCell.classList.add('hidden')
                var elShown = document.querySelector('.shown span')
                elShown.innerText = gGame.shownCount
            } else if (cell.isShown && cell.isMine) {
                cell.isShown = false
                gMinesCount++
                elCell.classList.add('hidden')
                elMinesCount.innerText = gMinesCount
                gUserLives++
                elLive.innerText = gUserLives
            }
        }
    }
}




function getHint() {
    if (gHintsLeft === 0) return
    isHint = true
    elHint.classList.add('light')
}



//work!!!
function revealHintCells(rowIdx, colIdx) {
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            const currCell = gBoard[i][j]
            if (!currCell.isShown) {
                let elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                console.log('elCell:', elCell)
                elCell.classList.remove('hidden')
                setTimeout(() => {
                    console.log('entered!!');
                    elCell.classList.add('hidden')
                    isHint = false
                    elHint.classList.remove('light')
                    console.log('elCell:', elCell)
                }, 2000);
            }
        }
    }


}


//done!
function getSafeCell() {
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
            //if (i === rowIdx && j === colIdx) continue
            //catching in the modal
            const cell = gBoard[i][j]
            //catching the currCell in dom
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            if (cell.isShown === false && !cell.isMine) {
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
        gLastMoves = []
        gMinesOnBoard = []
        onInit()
    }
    else if (num === 8) {
        gLevel.SIZE = num
        gLevel.MINES = 14
        gLastMoves = []
        gMinesOnBoard = []
        onInit()
    }
    else if (num === 12) {
        gLevel.SIZE = num
        gLevel.MINES = 32
        gLastMoves = []
        gMinesOnBoard = []
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
    if (revealedMines <= 3 && flaggedMines === gLevel.MINES - revealedMines &&
        gBoard.length * gBoard[0].length - gLevel.MINES === revealedNums) {
        //alert('u won')
        const elEmoji = document.querySelector('.emoji span')
        elEmoji.innerText = '😎\n YOU WON!'
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