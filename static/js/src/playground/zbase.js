class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $('<div class="ac-game-playground"></div>');


        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.colors = ["blue", "red", "yellow", "green", "purple"];

        // default hide();
        this.hide();

        this.start();
    };


    start(){
    }

    update(){
    }

    show(mode){         // 打开playground界面
        this.$playground.show();
        if (mode == "single mode"){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "blue", this.height * 0.15, true));

            for (let i = 0; i < 5; i ++ ) {
                this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.colors[Math.floor(Math.random() * 5)], this.height * 0.15, false));
            }
        }
    }
    hide(){
        this.$playground.hide();
    }
}
