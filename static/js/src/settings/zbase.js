class Settings {
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-login-title">
            登录                                                                                                                                                                                                   
        </div>
        <div class="ac-game-settings-login-username">
            <div class="ac-game-settings-login-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-login-password">
            <div class="ac-game-settings-login-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-login-btn">
            <div class="ac-game-settings-login-item">
                <button>登录</button>
            </div>
        </div>
        <!-- <div class="ac-game-settings-login-error-message">用户名不存在</div> -->
        <div class="ac-game-settings-login-register">注册</div>
        <br>
        <div class="ac-game-settings-login-acwing">
            <img src="https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png">
            <div>acwing一键登录</div>
        </div>
    </div>
</div>
            `)

        this.root.$ac_game.append(this.$settings);

        this.photo = "";
        this.username = "";

        this.start();
    }
    start(){
        this.getinfo();
    }


    register(){         // 打开注册界面
    }
    login(){            // 打开登录界面
    }

    getinfo(){
        let outer = this;
        $.ajax({
            url: "https://app1495.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
                outer.root.menu.show();
                if (resp.result === "success"){

                   // outer.photo = resp.photo;
                   // outer.username = resp.username;

                   // outer.hide();
                   // outer.root.menu.show();
                   outer.login();
                }else{
                    outer.login();
                }
            }
        })
    }
    hide(){

    }

    show(){

    }
}
