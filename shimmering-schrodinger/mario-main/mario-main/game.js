//IMPORTANT: Make sure to use Kaboom version 0.5.0 for this game by adding the correct script tag in the HTML file.

kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
})

// Speed identifiers
const MOVE_SPEED = 120
const JUMP_FORCE = 414
const BIG_JUMP_FORCE = 633
let CURRENT_JUMP_FORCE = JUMP_FORCE
const FALL_DEATH = 600
const ENEMY_SPEED = 20

// Game logic

let isJumping = true

// Load custom sprites
loadSprite('mario', 'assets/images/mario.png')
loadSprite('evil-shroom', 'assets/images/enemy.png')
loadSprite('blue-evil-shroom', 'assets/images/enemy.png')
loadSprite('bg', 'assets/images/background.png')

// Load custom sounds
loadSound('enemy-death', 'assets/sounds/enemy_death.m4a')
loadSound('level-end', 'assets/sounds/bolum_sonu.m4a')

// Load original sprites from imgur
loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')

loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

// Global Constants & Elements
const popupVideo = document.getElementById('popup-video')
const victoryVideo = document.getElementById('victory-video')
let lastPopupTime = 0
const POPUP_INTERVAL = 15000 // 15 saniyede bir popup göster

function showRandomPopup() {
  const currentTime = Date.now()
  if (currentTime - lastPopupTime > POPUP_INTERVAL) {
    // Animasyonlu göster
    popupVideo.classList.remove('hide')
    popupVideo.classList.add('show')
    popupVideo.currentTime = 0
    popupVideo.play()

    setTimeout(() => {
      // Animasyonlu gizle
      popupVideo.classList.remove('show')
      popupVideo.classList.add('hide')

      setTimeout(() => {
        popupVideo.pause()
        popupVideo.classList.remove('hide')
      }, 400) // slideOut animasyonu süresi
    }, 3000) // 3 saniye göster

    lastPopupTime = currentTime
  }
}

const dialogues = {
  jump: ['anana zipliyorum'],
  coin: ['godumun cocuguuu'],
  enemy: ['kariyi bi goster'],
  mushroom: ['NE DIYON LAN SENNNN!'],
  start: ['YILANOGLUUUU', 'YARRAAAMIN OGLUUUU']
}

function showDialogue(type, target) {
  const messages = dialogues[type]
  if (!messages) return

  const message = messages[Math.floor(Math.random() * messages.length)]

  // Ekran üzerinde yazı göster
  const log = add([
    text(message, 8),
    pos(target.pos.sub(0, 30)),
    layer('ui'),
    { time: 1 }
  ])

  log.action(() => {
    log.pos = target.pos.sub(0, 30) // Mario'yu takip et
    log.time -= dt()
    if (log.time <= 0) {
      destroy(log)
    }
  })
}

scene("game", ({ level, score }) => {
  layers(['bg', 'obj', 'ui'], 'obj')

  // Reset states for each level start
  isJumping = true
  CURRENT_JUMP_FORCE = JUMP_FORCE
  victoryVideo.style.display = 'none'

  // Rainbow Title: YILANOGLU
  const yilanTitle = add([
    text("YILANOGLU", 20),
    pos(width() / 2, 30),
    origin("center"),
    layer("ui"),
    color(1, 1, 1),
    "yilan-opening"
  ])

  yilanTitle.action(() => {
    const t = time() * 5
    yilanTitle.color = rgb(
      Math.sin(t) * 0.5 + 0.5,
      Math.sin(t + 2) * 0.5 + 0.5,
      Math.sin(t + 4) * 0.5 + 0.5
    )
    yilanTitle.scale = vec2(Math.sin(time() * 3) * 0.2 + 1.2)
  })

  // Remove title after 4 seconds
  wait(4, () => {
    destroy(yilanTitle)
  })

  // Add Background
  const bg = add([
    sprite('bg'),
    layer('bg'),
    pos(camPos()),
    origin('center'),
    scale(2) // Scale it large enough to cover the screen
  ])

  bg.action(() => {
    bg.pos = camPos()
  })

  const maps = [
    [
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '                                      ',
      '     %   =*=%=                        ',
      '                                      ',
      '                            -+        ',
      '                    ^   ^   ()        ',
      '======================================',
    ],
    [
      '£                                       £',
      '£                                       £',
      '£                                       £',
      '£                                       £',
      '£                                       £',
      '£        @@@@@@              x x        £',
      '£                          x x x        £',
      '£                        x x x x      -+£',
      '£               z   z  x x x x x      ()£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ],
    // Level 3 - Platformlar ve Düşmanlar
    [
      '                                          ',
      '                                          ',
      '                                          ',
      '       *                                  ',
      '     ===         ^                        ',
      '                                          ',
      '           ===       ===      ^           ',
      '  ^                              -+       ',
      '                    ^   ^        ()       ',
      '==========================================',
    ],
    // Level 4 - Zor Parkur
    [
      '                                              ',
      '                                              ',
      '          %    %    %                         ',
      '        ===  ===  ===                         ',
      '                            ^    ^            ',
      '                          ======              ',
      '    ^                                    -+   ',
      '  ====         ===         ===           ()   ',
      '                                 ^   ^        ',
      '==============================================',
    ],
    // Level 5 - Final Boss Seviyesi
    [
      '£                                           £',
      '£                                           £',
      '£     @@@@                                  £',
      '£                                           £',
      '£                  *                        £',
      '£         z              z         x x x    £',
      '£                              x x x x x    £',
      '£    z         z    z      x x x x x x x -+£',
      '£         z         z  x x x x x x x x x ()£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ]
  ]

  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), scale(0.15), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), scale(0.15), solid(), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],

  }

  const gameLevel = addLevel(maps[level], levelCfg)

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: score,
    }
  ])

  add([text('level ' + parseInt(level + 1)), pos(40, 6)])

  function big() {
    let timer = 0
    let isBig = false
    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer -= dt()
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        this.scale = vec2(0.15) // Normal boyut
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0
        isBig = false
      },
      biggify(time) {
        this.scale = vec2(0.25) // Büyük boyut
        timer = time
        isBig = true
      }
    }
  }

  const player = add([
    sprite('mario'),
    scale(0.15), // Kafayı küçült
    solid(),
    pos(40, 100),
    body(),
    big(),
  ])

  action('mushroom', (m) => {
    m.move(20, 0)
  })

  player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
      gameLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }
    if (obj.is('mushroom-surprise')) {
      gameLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0, 0))
    }
  })

  player.collides('mushroom', (m) => {
    destroy(m)
    player.biggify(6)
    showDialogue('mushroom', player)
  })

  player.collides('coin', (c) => {
    destroy(c)
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
    showDialogue('coin', player)
  })

  action('dangerous', (d) => {
    d.move(-ENEMY_SPEED, 0)
  })

  player.collides('dangerous', (d) => {
    // Determine if player is jumping on top of the enemy
    if (player.pos.y < d.pos.y - 10) {
      destroy(d)
      play('enemy-death')
      showDialogue('enemy', player)
      player.jump(CURRENT_JUMP_FORCE / 2) // Bounce back slightly
    } else {
      go('lose', { score: scoreLabel.value })
    }
  })

  player.action(() => {
    camPos(player.pos)
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: scoreLabel.value })
    }
  })

  // Ultra-Robust Pipe Transition (Daha hassas kontrol)
  keyPress('down', () => {
    const pipes = get('pipe')
    for (const p of pipes) {
      if (player.pos.dist(p.pos) < 100 || player.overlaps(p)) {
        play('level-end')
        if (level < maps.length - 1) {
          go('game', {
            level: (level + 1),
            score: scoreLabel.value
          })
        } else {
          // Victory!
          victoryVideo.style.display = 'block'
          victoryVideo.play()
          victoryVideo.onended = () => {
            victoryVideo.style.display = 'none'
            go('lose', { score: scoreLabel.value })
          }
        }
        break
      }
    }
  })

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  player.action(() => {
    if (player.grounded()) {
      isJumping = false
    }
  })

  keyPress('space', () => {
    if (player.grounded()) {
      isJumping = true
      player.jump(CURRENT_JUMP_FORCE)
      showDialogue('jump', player)
      showRandomPopup()
    }
  })
})

scene('lose', ({ score }) => {
  // Reset all states
  victoryVideo.style.display = 'none'
  popupVideo.classList.remove('show', 'hide')

  add([
    text('GAME OVER', 24),
    origin('center'),
    pos(width() / 2, height() / 2 - 40)
  ])

  add([
    text('Score: ' + score, 16),
    origin('center'),
    pos(width() / 2, height() / 2)
  ])

  add([
    text('Press Space to Restart', 12),
    origin('center'),
    pos(width() / 2, height() / 2 + 40)
  ])

  keyPress('space', () => {
    go('game', { level: 0, score: 0 })
  })
})

start("game", { level: 0, score: 0 })
