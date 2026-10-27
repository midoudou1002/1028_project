const canvas = document.querySelector("#gameCan");
const c = canvas.getContext("2d");

// 設定畫布大小
canvas.width = 1024;
canvas.height = 576;

// 設定重力和地面位置
const gravity = 0.7;
const ground = canvas.height - 100;

// 背景音樂
const bgm = new Audio("../bgm/8bit Bossa.mp3");
bgm.loop = true;
bgm.volume = 0.5;
const targetFrameDuration = 1000 / 60;

// 定義 Sprite 類別
const background = new Sprite(
    { x: 0, y: 0 }, 
    "../BACKGROUND FIELD/Layer PNG/01_BG_SKY.png");

const grassland = new Sprite(
    { x: 0, y: 0 }, 
    "../BACKGROUND FIELD/Layer PNG/07_GROUND.png");

const mountain = new Sprite(
    { x: 0, y: 0 }, 
    "../BACKGROUND FIELD/Layer PNG/02_BG_HILL.png");
const mountain2 = new Sprite(
    { x: 1024, y: 0 }, 
    "../BACKGROUND FIELD/Layer PNG/02_BG_HILL.png");

const scenery = new Sprite(
    { x: 0, y: 0 }, 
    "../BACKGROUND FIELD/06_TREE.png");
const scenery2 = new Sprite(
    { x: 1024, y: 0 }, 
    "../BACKGROUND FIELD/06_TREE.png");

// 設定背景移動速度
const mountainSpeed = 1;
const scenerySpeed = 1.5;

// 定義玩家物件
const player = {
    position: { x:150, y: 0 },
    width: 80,
    height: 80,
    speed: { x: 0, y: 0 }
}
    // 碰撞箱縮小
    const playerHitbox = {
        offsetX: 16,
        offsetY: 16,
        width: player.width - 32,
        height: player.height -16
    }

// 遊戲分數
let score = 0;

// 初始生命值
let heart = 3;
const heartImage = new Sprite(
    { x: 0 , y: 0},
    "../award/corazon.png"
)

// 設定遊戲速度
let gameSpeed = 5;
let gameTime = 0;

// 遊戲是否結束
let gameOver = false;
const gameOverImage = new Sprite(
    { x: 0, y: 0 },
    "../button/GameOver.png"
)
const restartImage = new Sprite (
    { x: 0, y: 0 },
    "../button/RESTART.png"
)
// 遊戲是否已開始
let gameStarted = false;
const startImage = new Sprite(
    { x: 0, y: 0 },
    "../button/START.png"
)

// 定義 AnimatedDog 類別
const playerImage = new AnimatedDog(
    { x: player.position.x, y: player.position.y },
    [
        "../brown_dog_by_Brysia/walk1.png",
        "../brown_dog_by_Brysia/walk2.png",
        "../brown_dog_by_Brysia/walk3.png",

    ],
    10
)

// 定義障礙物和獎勵物件
const meat = {
    position: { x: 500, y: ground - 60 },
    width: 80,
    height: 80,
    speed: { x: -5, y: 0 },
    image: new Sprite(
        { x: 0, y: 0 },
        "../award/TM_Meat13.png"
    ).image
};
const meatHitbox = {
    offsetX: 16,
    offsetY: 16,
    width: 48,
    height: 48
}
const stoneA = {
    position: { x: 700, y: ground - 60 },
    width: 80,
    height: 80,
    speed: { x: -5, y: 0 },
    image: new Sprite(
        { x: 0, y: 0 },
        "../obstacle/stone2_21.png"
    ).image
}
const stoneAHitbox = {
    offsetX: 16,
    offsetY: 16,
    width: 48,
    height: 48
}
const stoneB = {
    position: { x: 1100, y: ground - 60 },
    width: 80,
    height: 80,
    speed: { x: -5, y: 0 },
    image: new Sprite(
        { x: 0, y: 0 },
        "../obstacle/stone2_25.png"
    ).image
}
const stoneBHitbox = {
    offsetX: 16,
    offsetY: 16,
    width: 48,
    height: 48
}

const minObjectGap = 200;
const maxObjectGap = 700;

function randomObjectGap() {
    return minObjectGap + Math.random() * (maxObjectGap - minObjectGap);
}

function placeAfterOthers(object, others) {
    const rightmost = Math.max(
        canvas.width,
        ...others.map(other => other.position.x + other.width)
    );

    object.position.x = rightmost + randomObjectGap();
}

function resetObjectPositions() {
    meat.position.x = 450 + Math.random() * 350;
    meat.position.y = ground - 60;

    placeAfterOthers(stoneA, [meat]);
    placeAfterOthers(stoneB, [meat, stoneA]);

    stoneA.position.y = ground - 60;
    stoneB.position.y = ground - 60;
}

resetObjectPositions();

// 撿到獎勵的音效
const meatSound = new Audio("../bgm/Coin01.mp3");

// 撞到石頭的音效
const hitSound = new Audio("../bgm/Downer01.mp3");

const gameImages = [
    background.image,
    grassland.image,
    mountain.image,
    mountain2.image,
    scenery.image,
    scenery2.image,
    heartImage.image,
    gameOverImage.image,
    restartImage.image,
    startImage.image,
    meat.image,
    stoneA.image,
    stoneB.image,
    ...playerImage.images
];

function waitForImage(image) {
    return new Promise((resolve, reject) => {
        const fail = () => {
            cleanup();
            reject(new Error(`Image failed to load: ${image.src}`));
        };
        const load = () => {
            cleanup();
            resolve(image);
        };
        const cleanup = () => {
            image.removeEventListener("load", load);
            image.removeEventListener("error", fail);
        };

        if (image.complete) {
            if (image.naturalWidth > 0) {
                resolve(image);
            } else {
                reject(new Error(`Image failed to load: ${image.src}`));
            }
            return;
        }

        image.addEventListener("load", load, { once: true });
        image.addEventListener("error", fail, { once: true });
    });
}

async function loadGameResources() {
    await Promise.all(gameImages.map(waitForImage));
    await document.fonts.load("16px 'Press Start 2P'");

    if (!document.fonts.check("16px 'Press Start 2P'")) {
        throw new Error("Press Start 2P font failed to load.");
    }
}

function showResourceLoadError(error) {
    console.error("Game resources could not be loaded.", error);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "white";
    c.font = "16px monospace";
    c.textAlign = "center";
    c.fillText(
        "Unable to load game resources. Check the console for details.",
        canvas.width / 2,
        canvas.height / 2
    );
}

// 判斷玩家是否在地面上
function isOnGround(player) {
    return player.position.y + player.height >= ground;
}

// 監聽鍵盤事件，控制玩家跳躍
window.addEventListener("keydown", (event) => {
    if (
        !gameStarted ||
        gameOver ||
        event.repeat ||
        event.key.toLowerCase() !== "w"
    ) {
        return;
    }

    if (isOnGround(player)) {
        player.speed.y -= 15;
    }
});

// 點擊 START 按鈕後開始遊戲

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();

    const mouseX =
        (event.clientX - rect.left) * (canvas.width / rect.width);

    const mouseY =
        (event.clientY - rect.top) * (canvas.height / rect.height);

    // RESTART 按鈕的位置和尺寸
    const restartWidth = 150;
    const restartHeight = 55;
    const restartX = canvas.width / 2 - restartWidth / 2;
    const restartY = canvas.height / 2 + 130;

    // 點擊 RESTART
    if (
        gameOver &&
        mouseX >= restartX &&
        mouseX <= restartX + restartWidth &&
        mouseY >= restartY &&
        mouseY <= restartY + restartHeight
    ) {
        // 重設分數和生命值
        score = 0;
        heart = 3;

        // 重設遊戲狀態
        gameOver = false;
        gameStarted = true;
        gameSpeed = 5;
        gameTime = 0;

        // 重設玩家的位置和速度
        player.position.x = 150;
        player.position.y = ground - player.height;
        player.speed.x = 0;
        player.speed.y = 0;

        // 重設獎勵和石頭的位置
        resetObjectPositions();

        // 重設背景的位置
        mountain.position.x = 0;
        mountain2.position.x = 1024;
        scenery.position.x = 0;
        scenery2.position.x = 1024;

        // 重新播放背景音樂
        bgm.currentTime = 0;
        bgm.play();

        return;
    }

    // 點擊 START
    const startWidth = 200;
    const startHeight =
        startWidth * startImage.image.height / startImage.image.width;

    const startX = (canvas.width - startWidth) / 2;
    const startY = (canvas.height - startHeight) / 2;

    if (
        !gameStarted &&
        !gameOver &&
        mouseX >= startX &&
        mouseX <= startX + startWidth &&
        mouseY >= startY &&
        mouseY <= startY + startHeight
    ) {
        gameStarted = true;

        bgm.currentTime = 0;
        bgm.play();
    }
});

let lastTimestamp = null;

// 遊戲主迴圈
function animate(timestamp) {
    window.requestAnimationFrame(animate);

    const elapsedMs = lastTimestamp === null
        ? targetFrameDuration
        : Math.min(timestamp - lastTimestamp, 50);
    const deltaFrames = elapsedMs / targetFrameDuration;
    lastTimestamp = timestamp;

    if (gameOver) {
        // 顯示 GAME OVER 圖片
        c.drawImage(
        gameOverImage.image,
        canvas.width / 2 - 200,
        canvas.height / 2 - 150,
        400,
        200
    );

        // 顯示最後分數
        c.fillStyle = "white";
        c.font = "24px 'Press Start 2P'";
        c.textAlign = "center";
        c.fillText(
        "Final Score: " + score,
        canvas.width / 2,
        canvas.height / 2 + 100
    );

        // 畫出RESTART
        const buttonWidth = 150;
        const buttonHeight = 55;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 + 130;
        c.drawImage (
            restartImage.image,
            buttonX,
            buttonY,
            buttonWidth,
            buttonHeight
        );
        return;
    }

    c.drawImage(background.image, 0, 0, 1024, 576);
    c.drawImage(mountain.image, mountain.position.x, 0, 1024, 576);
    c.drawImage(mountain2.image, mountain2.position.x, mountain2.position.y, 1024, 576);
    c.drawImage(scenery.image, scenery.position.x, 0, 1024, 576);
    c.drawImage(scenery2.image, scenery2.position.x, 0, 1024, 576);
    c.drawImage(grassland.image, 0, 0, 1024, 576);

    // 尚未開始遊戲時，顯示 START 按鈕
    if (!gameStarted) {
    const buttonWidth = 200;

    const buttonHeight =
        buttonWidth * startImage.image.height / startImage.image.width;

    c.drawImage(
        startImage.image,
        (canvas.width - buttonWidth) / 2,
        (canvas.height - buttonHeight) / 2,
        buttonWidth,
        buttonHeight
    );

    return;
    }
    // 累積遊戲時間
    // 每 10 秒加速一次，最高速度為 10
    if (gameSpeed < 10) {
        gameTime += elapsedMs;
        while (gameTime >= 10000 && gameSpeed < 10) {
            gameTime -= 10000;
            gameSpeed += 1;
        }
    }

    // 移動背景
    mountain.position.x -= gameSpeed * 0.2 * deltaFrames;
    mountain2.position.x -= gameSpeed * 0.2 * deltaFrames;
    scenery.position.x -= gameSpeed * 0.3 * deltaFrames;
    scenery2.position.x -= gameSpeed * 0.3 * deltaFrames;
    if (mountain.position.x <= -1024) {
        mountain.position.x = mountain2.position.x + 1024;}
    if (mountain2.position.x <= -1024) {
        mountain2.position.x = mountain.position.x + 1024;}
    if (scenery.position.x <= -1024) {
        scenery.position.x = scenery2.position.x + 1024;}
    if (scenery2.position.x <= -1024) {
        scenery2.position.x = scenery.position.x + 1024;}

    // 移動障礙物和獎勵物件
    meat.position.x -= gameSpeed * deltaFrames;
    stoneA.position.x -= gameSpeed * deltaFrames;
    stoneB.position.x -= gameSpeed * deltaFrames;

    // 如果障礙物或獎勵物件移出畫布，重新設定它們的位置
    if (meat.position.x + meat.width < 0) {
        placeAfterOthers(meat, [stoneA, stoneB]);
    }
    if (stoneA.position.x + stoneA.width < 0) {
        placeAfterOthers(stoneA, [meat, stoneB]);
    }
    if (stoneB.position.x + stoneB.width < 0) {
        placeAfterOthers(stoneB, [meat, stoneA]);
    }

    // 畫出障礙物和獎勵物件
    c.drawImage(meat.image, meat.position.x, meat.position.y, meat.width, meat.height);
    c.drawImage(stoneA.image, stoneA.position.x, stoneA.position.y, stoneA.width, stoneA.height);
    c.drawImage(stoneB.image, stoneB.position.x, stoneB.position.y, stoneB.width, stoneB.height);



    // 更新玩家位置和速度
    player.speed.y += gravity * deltaFrames;
    player.position.y += player.speed.y * deltaFrames;

    // 確保玩家不會掉出畫布
    if (isOnGround(player)) {
        player.speed.y = 0;
        player.position.y = ground - player.height;
    }

    // 判斷是否碰到獎勵物件
    if (
    player.position.x + playerHitbox.offsetX <
        meat.position.x + meatHitbox.offsetX + meatHitbox.width &&

    player.position.x + playerHitbox.offsetX + playerHitbox.width >
        meat.position.x + meatHitbox.offsetX &&

    player.position.y + playerHitbox.offsetY <
        meat.position.y + meatHitbox.offsetY + meatHitbox.height &&

    player.position.y + playerHitbox.offsetY + playerHitbox.height >
        meat.position.y + meatHitbox.offsetY
    ) {
    score += 20;
    meatSound.currentTime = 0;
    meatSound.play();

    // 將獎勵物件移到畫面右側，避免重複加分
    placeAfterOthers(meat, [stoneA, stoneB]);
    }

   
    // 判斷是否撞到石頭 A
    if (
    player.position.x + playerHitbox.offsetX <
        stoneA.position.x + stoneAHitbox.offsetX + stoneAHitbox.width &&

    player.position.x + playerHitbox.offsetX + playerHitbox.width >
        stoneA.position.x + stoneAHitbox.offsetX &&

    player.position.y + playerHitbox.offsetY <
        stoneA.position.y + stoneAHitbox.offsetY + stoneAHitbox.height &&

    player.position.y + playerHitbox.offsetY + playerHitbox.height >
        stoneA.position.y + stoneAHitbox.offsetY
    ) {
        score -= 10;
        heart -= 1;
        hitSound.currentTime = 0;
        hitSound.play();
        if (heart <= 0) {
            gameOver = true;
        }

        // 把石頭 A 移到畫面右側，避免重複扣分
        placeAfterOthers(stoneA, [meat, stoneB]);
    }

    // 判斷是否撞到石頭 B
    if (
    player.position.x + playerHitbox.offsetX <
        stoneB.position.x + stoneBHitbox.offsetX + stoneBHitbox.width &&

    player.position.x + playerHitbox.offsetX + playerHitbox.width >
        stoneB.position.x + stoneBHitbox.offsetX &&

    player.position.y + playerHitbox.offsetY <
        stoneB.position.y + stoneBHitbox.offsetY + stoneBHitbox.height &&

    player.position.y + playerHitbox.offsetY + playerHitbox.height >
        stoneB.position.y + stoneBHitbox.offsetY
    ) {
        score -= 10;
        heart -= 1;
        hitSound.currentTime = 0;
        hitSound.play();
        if (heart <= 0) {
            gameOver = true;
        }        

        // 把石頭 B 移到畫面右側，避免重複扣分
        placeAfterOthers(stoneB, [meat, stoneA]);
    }

    // 更新玩家動畫
    playerImage.position.x = player.position.x;
    playerImage.position.y = player.position.y;
    playerImage.update(deltaFrames)
    playerImage.draw(c, player.width, player.height);

    // 顯示分數
    c. fillStyle = "white";
    c.font = "16px 'Press Start 2P'";
    c.fillText("Score: " + score, 30,40)

    // 顯示生命值
    for (let i = 0 ; i < heart; i++) {
        c.drawImage(
            heartImage.image,
            30 + i * 40,
            60, 
            30,
            30
        )
    }

}

loadGameResources().then(() => {
    window.requestAnimationFrame(animate);
}).catch(showResourceLoadError);