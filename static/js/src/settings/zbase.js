class Settings {
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.start();
    }   
    start(){
        this.getinfo();
    }


    register(){
    }
    login(){
    }

    getinfo(){
        let outer = this;
        
        $.ajax({
            url: "https://120.79.151.96:8000/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
                console.log("create ac_game");
                if (resp.result === "success"){
                    outer.hide();
                    outer.root.menu.show();

                }else{
                    outer.login();
                }
            }
        })
    }
    hide(){}
    show(){}
}
