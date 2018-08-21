export class Session{
    constructor(context){
        this.context = context;
        //this.setupSocket();
        this.userData = {
            "user_id": 45,
            "token": "some-secret-token",
            "scenes": [
                {
                    "scene_id": 1541,
                    "name": "Electric",
                    "short_code": "16t"
                },
                {
                    "scene_id": 598,
                    "name": "Superb",
                    "short_code": "gm"
                },
                {
                    "scene_id": 597,
                    "name": "Thirsty",
                    "short_code": "gl"
                }
            ]
        }
    }
    onLogin(){

    }
    setupSocket(){
        this.socket = io.connect('https://shanesedit.org',{ ////http://localhost:8082
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax : 5000,
            reconnectionAttempts: 99999
        });
        this.socket.on('login',msg=>{
            // this.userData = msg;
            // console.log(JSON.stringify(this.userData,null,4))
            this.onLogin(msg);
        });
    }

}