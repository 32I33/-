class Player extends AcGameObject {
    // speed 表示每秒移动的百分比是多少（长度和高度）, is_me判断一下是不是自己
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;     // eps表示小于0.1就算0，因为会涉及浮点运算
    }

    start(){

    }
    update(){
        // 每一次都要画一便，不画就会消失
        this.render();
    }

    // 这里是渲染一个新的玩家，也就是一个圆形
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
