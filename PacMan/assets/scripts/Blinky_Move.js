cc.Class({
    extends: cc.Component,

    properties: {
        gameOverSm: {
            default: null,
            type: cc.AudioClip
        },
        deathAudio: {
            default: null,
            type: cc.AudioClip
        },
        canvas: {
            default: null,
            type: cc.Node
        },
        pacMan: {
            default: null,
            type: cc.Node
        },
        speed: cc.v2(0, 0),
        dir: cc.v2(0, 0),
        location: cc.v2(0, 0),
        size: cc.v2(7, 7),
        moveSpeed: 1,
        debuffSpeed: 0.5,
        status: 0,
        cnt: 0,
    },



    onLoad: function () {
        this.Init();
        this.location.x = this.node.x;
        this.location.y = this.node.y;
        this.accUp = true;
        this.status = 0;
        this.deathFlag = false;
        this.flagOfReset=0;
    },
    start() {

    },
    update: function (dt) {
        if (this.cnt == 2) {
            if (this.node.x == this.location.x && this.node.y == this.location.y) {
                this.Change_way();
            }
            this.cnt = 0;
            this.location.x = this.node.x;
            this.location.y = this.node.y;
        }
        // if(this.cnt == 5){
        //     this.cnt = 0;
        //     console.log(parseInt(this.node.x),parseInt(this.node.y));
        // }
        // this.accRight = true;
        // if(this.accUp){
        //     cc.director.pause();
        // }
       
        if (this.deathFlag == true) {
            cc.audioEngine.play(this.deathAudio, false, 0.5);
            this.deathFlag = false;
            this.canvas.getComponent("Game").gainScore(100);
        }
        if(this.flagOfReset==1){
            this.node.x = 0;
            this.node.y = 0;
            this.flagOfReset=0;
        }
        this.Move();

        this.cnt += 1;
        this.status = 0;
        // console.log();
    },

    getDebuff: function () {
        //this.moveSpeed = this.node.properties.moveSpeed;
        this.moveSpeed = this.debuffSpeed;
        var action = cc.fadeTo(0, 100);
        this.node.runAction(action);

        this.unschedule(this.debuffDuration);
        this.scheduleOnce(this.debuffDuration=function () {
            this.recover();
        }.bind(this), 5)
    },

    recover: function () {
        this.moveSpeed = 1;
        var action1 = cc.fadeIn(0);
        this.node.runAction(action1);
    },

    Move() {
        var anim = this.node.getComponent(cc.Animation);
        if (this.accLeft) {
            this.dir.x = -1;
            this.dir.y = 0;
            if (this.status == 1) anim.play('blinkyLeft');
        } else if (this.accRight) {
            this.dir.x = 1;
            this.dir.y = 0;
            if (this.status == 1) anim.play('blinkyRight');
        } else if (this.accUp) {
            this.dir.x = 0;
            this.dir.y = 1;
            if (this.status == 1) anim.play('blinkyUp');
        } else if (this.accDown) {
            this.dir.x = 0;
            this.dir.y = -1;
            if (this.status == 1) anim.play('blinkyDown');
        }
        this.speed.x = this.dir.x * this.moveSpeed;
        this.speed.y = this.dir.y * this.moveSpeed;
        this.node.x += this.speed.x;
        this.node.y += this.speed.y;
    },
    Change_way() {
        this.status = 1;
        this.num = parseInt(Math.random() * 100000 % 4);
        this.Init();
        if (this.num == 0) {
            this.accLeft = true;
        } else if (this.num == 1) {
            this.accRight = true;
        } else if (this.num == 2) {
            this.accDown = true;
        } else if (this.num == 3) {
            this.accUp = true;
        }

        // console.log(this.num);
    },
    Init() {
        this.accLeft = false;
        this.accRight = false;
        this.accDown = false;
        this.accUp = false;
    },
    onBeginContact: function (contact, selfCollider, otherCollider) {
        // console.log(otherCollider.node.group);
        if (otherCollider.node.group == "pacman") {
            this.reset();
            if (this.moveSpeed != this.debuffSpeed) {
                cc.director.pause();
                var death=this.pacMan.getComponent("Player");
                death.decease();
                //setTimeout("cc.director.loadScene('Gameover');", 1000);
                //this.overSm = cc.audioEngine.play(this.gameOverSm, false, 1);
                //cc.director.loadScene("Gameover");
            } else {
                this.deathFlag = true;
            }
        }
        // else if(otherCollider.node.group == "ghost"){
        //     this.Move();
        // }
    },
    reset:function(){
        this.flagOfReset=1;
    },
    onEndContact: function (contact, selfCollider, otherCollider) {

    },
    onPreSolve: function (contact, selfCollider, otherCollider) {

    },
    Valid() {
        this.isWallTop = false;
        this.isWallButton = false;
        this.PW1 = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.PwTemp = cc.v2(this.PW1);
        this.PwTemp.x += this.dir.y * this.size.x;
        this.PwTemp.y += this.dir.x * this.size.y;
        this.PW2 = cc.v2(0, 0);
        this.PW2.x = this.PwTemp.x + this.dir.x * this.moveSpeed * this.detectionDistance;
        this.PW2.y = this.PwTemp.y + this.dir.y * this.moveSpeed * this.detectionDistance;
        this.results = cc.director.getPhysicsManager().rayCast(this.PwTemp, this.PW2, cc.RayCastType.Closest);
        if (this.results.length >= 1) {
            this.results[0].collider.node.name == "Maze" ? this.isWallTop = true : this.isWallTop = false;
        }
        this.PwTemp = cc.v2(this.PW1);
        this.PwTemp.x -= this.dir.y * this.size.x;
        this.PwTemp.y -= this.dir.x * this.size.y;
        this.PW2 = cc.v2(0, 0);
        this.PW2.x = this.PwTemp.x + this.dir.x * this.moveSpeed * this.detectionDistance;
        this.PW2.y = this.PwTemp.y + this.dir.y * this.moveSpeed * this.detectionDistance;
        this.results = cc.director.getPhysicsManager().rayCast(this.PwTemp, this.PW2, cc.RayCastType.Closest);
        if (this.results.length >= 1) {
            this.results[0].collider.node.name == "Maze" ? this.isWallButton = true : this.isWallButton = false;
        }
        return (this.isWallTop == false) && (this.isWallButton == false);
    },

});
