function Sprite (position,src){
    this.position = position;
    this.image = new Image();
    this.image.src = src;

} 

function AnimatedDog (position, imagePaths, frameInterval = 8){
    this.position = position;

    // 載入三張動畫圖片
    this.images = imagePaths.map((path) => {
        const image = new Image();
        image.src = path;
        return image;
    })

    // 動畫控制
    this.frame = 0;
    this.frameTimer = 0;
    this.frameInterval = frameInterval;
};

    // 切換到下一張圖片
AnimatedDog.prototype.update = function() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % this.images.length;
        this.frameTimer = 0;
    }
};

    // 畫出小狗圖片
AnimatedDog.prototype.draw = function(c, width, height) {
    const image = this.images[this.frame];
    if (image.complete && image.naturalWidth > 0) {
        c.save();
        
    // 移動畫布座標原點
        c.translate (
            this.position.x + width, 
            this.position.y
        );
    // 將畫布水平翻轉
        c.scale(-1, 1); 

    // 繪製小狗圖片，因為畫布已經翻轉，所以要將 x 座標設為 0
        c.drawImage(image, 0, 0, width, height);

    // 還原畫布設定
        c.restore();
    }}

    // function AnimatedDog (position, imagePaths, frameInterval = 8){
    // this.position = position;

    // // 載入三張動畫圖片
    // this.images = imagePaths.map((path) => {
    //     const image = new Image();
    //     image.src = path;
    //     return image;
    // })

    // // 動畫控制
    // this.frame = 0;
    // this.frameTimer = 0;
    // this.frameInterval = frameInterval;
// };

    // 切換到下一張圖片
// AnimatedDog.prototype.update = function() {
//     this.frameTimer++;
//     if (this.frameTimer >= this.frameInterval) {
//         this.frame = (this.frame + 1) % this.images.length;
//         this.frameTimer = 0;
//     }
// };

    // 畫出小狗圖片
// AnimatedDog.prototype.draw = function(c, width, height) {
//     const image = this.images[this.frame];

//     if (image.complete && image.naturalWidth > 0) {
//         c.drawImage(
//             image,
//             this.position.x,
//             this.position.y,
//             width,
//             height
//         );
//     }
// };