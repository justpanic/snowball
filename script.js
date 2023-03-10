const canvas = document.getElementsByTagName('canvas')[0]
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')
const keyboardState = {}

function renderAvatar(player) {
    ctx.save()
    ctx.translate(player.x, player.y)

    // draw body
    ctx.beginPath()
    ctx.arc(0,0,20,0,2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = player.color
    ctx.fill()  
    
    // draw username
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(player.username,0,34)

    // draw eyes
    // rotate here prior to drawing the eyes,
    // to make the eeyes face that the avatar should have
    
    switch (player.rotation) {
        case FACING_DOWN :
            ctx.rotate(0)
            break
        case FACING_UP :
            ctx.rotate(Math.PI)
            break
        case FACING_LEFT :
            ctx.rotate(Math.PI /2)
            break
        case FACING_RIGHT :
            ctx.rotate(Math.PI * 1.5)
            break 
    }

    ctx.beginPath()
    ctx.moveTo(-5,5)
    ctx.lineTo(-5,17)
    ctx.moveTo(5,5)
    ctx.lineTo(5,17)
    ctx.stroke()

    ctx.restore()
}

function renderSnowball(snowball) {
    ctx.save()
    ctx.translate(snowball.x, snowball.y)

    ctx.beginPath()
    ctx.arc(0,0,8,0,2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = 'lightblue'
    ctx.fill()

    ctx.restore()
}

const SNOWBALL_SPEED = 5
const PLAYER_SPEED = 3
const FACING_UP = 2
const FACING_DOWN = 0
const FACING_LEFT = 1
const FACING_RIGHT = 3


const gameState = {
    players : [
        {
            username:'justpanic',
            x:50, y:50,
            color : '#ae83c3',
            rotation : FACING_DOWN,
            snowballs : [
                {
                    x:50, y:150,
                    vx:0, vy:SNOWBALL_SPEED
                },
                {
                    x:50, y:300,
                    vx:SNOWBALL_SPEED, vy:0
                }
            ]
        },
        {
            username:'tweektweak',
            x:200, y:100,
            color : '#e29546',
            rotation : FACING_RIGHT,
            snowballs : []
        }
    ]
}

function render(state) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width, canvas.height)

    state.players.forEach(function (player) {
        renderAvatar(player)

        player.snowballs.forEach(function(snowball) {
            renderSnowball(snowball)
        })
    });
}

const PLAYER_RADIUS = 20
const SNOWBALL_RADIUS = 8
function hitTestPlayerVsPlayer (playerA, playerB){
    return Math.sqrt(
        Math.pow(playerA.x - playerB.x,2) +
        Math.pow(playerA.y - playerB.y,2)
    ) < (PLAYER_RADIUS * 2)
}
function hitTestPlayerVsSnowball (player, snowball){
    return Math.sqrt(
        Math.pow(player.x - snowball.x,2) +
        Math.pow(player.y - snowball.y,2)
    ) < (PLAYER_RADIUS + SNOWBALL_RADIUS)
}

function logicStep(state) {
    state.players.forEach(player => {
        player.snowballs.forEach(snowball => {
            snowball.x += snowball.vx
            snowball.y += snowball.vy

            if (snowball.x < 0 || snowball.x > window.innerWidth ||
                snowball.y < 0 || snowball.y > window.innerHeight) {
                snowball.remove = true    
                console.log('marked snowball to be removed')
            }
        })
        player.snowballs = player.snowballs.filter(snowball =>{
            const shouldBeKept = (snowball.remove !== true)
            return shouldBeKept
        })
    })

    // only moving player one now
    const myPlayer = state.players[0]
    if (keyboardState.w) {
        myPlayer.y -= PLAYER_SPEED
        myPlayer.rotation = FACING_UP
    }
    if (keyboardState.s) {
        myPlayer.y += PLAYER_SPEED
        myPlayer.rotation = FACING_DOWN
    }
    if (keyboardState.d) {
        state.players[0].x += PLAYER_SPEED
        myPlayer.rotation = FACING_RIGHT
    }
    if (keyboardState.a) {
        state.players[0].x -= PLAYER_SPEED
        myPlayer.rotation = FACING_LEFT
    }

    // collision algorithm
    state.players.forEach(playerA => {
        playerA.snowballs.forEach(snowball => {
            state.players.forEach(playerB => {
                if(playerA===playerB){
                    // don't hit yourself
                    return
                }

                if(hitTestPlayerVsSnowball(playerB, snowball)) {
                    snowball.remove = true
                    playerB.eliminated = true
                }
            })
        })        
    })

    // remove eliminated players
    state.players = state.players.filter(player => !player.eliminated)

    
}

function gameLoop() {
    requestAnimationFrame(gameLoop)
    logicStep(gameState)
    render(gameState)    
}

gameLoop()



document.addEventListener('keydown', function(e) {
    keyboardState[e.key] = true    
    if (e.key===' ') { // spacebar

        const myPlayer = gameState.players[0]
        const snowball = {
            x : myPlayer.x, y : myPlayer.y,
            vx:0, vy:0
        }
 
        switch (myPlayer.rotation) {
            case FACING_DOWN :
                snowball.vy = SNOWBALL_SPEED
                break
            case FACING_UP :
                snowball.vy = -SNOWBALL_SPEED
                break
            case FACING_LEFT :
                snowball.vx = -SNOWBALL_SPEED
                break
            case FACING_RIGHT :
                snowball.vx = SNOWBALL_SPEED
                break 
        }
        myPlayer.snowballs.push(snowball)
    }
})
document.addEventListener('keyup', function(e) {
    keyboardState[e.key] = false    
})

const socket = io()