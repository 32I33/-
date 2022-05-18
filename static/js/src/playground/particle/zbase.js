// 这个是被打击之后产生的小颗粒

class Particle extends AcGameObject {
    constructor(playground, x, y, radius, speed, vx, vy, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = this.get_random_color();
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;

        this.eps = 0.01;
    }


    get_random_color() {
        let colors = ["blue", "grey", "red", "pink", "green", "yellow"];
        return colors[Math.floor(Math.random() * 6)];
    }

    start(){
        console.log("particle create");
    };
    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }else {
            let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.speed *= this.friction;
        }

        this.render();
    }
    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }


}
