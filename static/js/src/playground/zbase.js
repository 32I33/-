class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $('<div class="ac-game-playground"></div>');


        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.players = [];
        this.colors = ["blue", "red", "yellow", "green", "purple"];

        // default hide();
        this.hide();

        this.start();
    };


    start() {
        let outer = this;
        $(window).resize(function() {
            console.log("resize");
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }

    update(){
    }

    show(mode){         // 打开playground界面
        this.$playground.show();
        this.game_map = new GameMap(this);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.resize();
        if (mode == "single mode"){
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "blue", 0.15, "me"));

            for (let i = 0; i < 5; i ++ ) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.colors[Math.floor(Math.random() * 5)], 0.15, "robot"));
            }
        }
    }
    hide(){
        this.$playground.hide();
    }
}
