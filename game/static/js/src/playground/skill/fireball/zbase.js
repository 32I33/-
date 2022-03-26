class FireBall extends AcGameObject {
    // player表示是发出者
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1;

        this.damage = damage;
        this.cur_skill = null;              // 当前的技能为空
    }
    start(){
    }


    update(){

        let outer = this;

        if (this.move_length < this.eps) {
            this.destroy();
            return false;

        }
        let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    is_collision(player) {
        return(this.radius + player.radius > this.get_dist(player.x, player.y));
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // 被攻击的角度跟伤害
        console.log("Damage: ",this.damage);
        console.log("player.x.y: ", player.x, player.y);

        player.attacked(angle, this.damage);
        // console.log("return: ", t);

        this.destroy();
        
    }

    get_dist(tx, ty){
        let dx = this.x - tx;
        let dy = this.y - ty;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2 ,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
