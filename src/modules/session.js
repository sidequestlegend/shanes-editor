export class Session{
    constructor(context){
        this.context = context;
        // Dummy session data.
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
                    "scene_id": 597,
                    "name": "Thirsty",
                    "short_code": "gl"
                }
            ]
        }
    }
}