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
        this.eps = 0.01;

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
        this.update_attack();
        this.update_move();

        this.render();
    }
    update_attack() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }
    }

    update_move() {
        let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    is_collision(player) {
        return(this.radius + player.radius > this.get_dist(player.x, player.y));
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // 被攻击的角度跟伤害

        player.attacked(angle, this.damage);

        this.destroy();
    }

    get_dist(tx, ty){
        let dx = this.x - tx;
        let dy = this.y - ty;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2 ,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    };
    // 其属于是在destroy之前执行
    on_destroy(uuid) {
        let fireballs = this.players.fireball;
        for (let i = 0; i < fireballs.length; i ++ ) {
            let fireball = fireballs[i];
            if (fireball[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
