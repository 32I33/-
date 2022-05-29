class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.text = "已就绪:0人";
    }
    start() {

    }
    update() {
        this.render();
    }

    // 重写text内容
    write(text) {
        this.text = text;
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";              // 居中放置
        this.ctx.fillText(this.text, this.playground.width / 2, 40);
    }
}
