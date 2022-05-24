// root是acgame

class AcGameMenu{
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings-mode">
            退出
        </div>
        <div class="ac-game-menu-field-warning ac-game-menu-field-warning-nopermission></div>

    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings-mode');
        this.$warning_nopermission = this.$menu.find('.ac-game-menu-field-warning-nopermission')
        this.start();
    }
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi.click(function() {
            outer.$menu.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            let result = outer.root.settings.logout_on_remote();
            outer.$warning_nopermission.html(result);
        });
    }
    show() {
        this.$menu.show();
    }
    hide() {
        this.$menu.hide();
    }
}
