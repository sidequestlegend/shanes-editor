export class LightFactory{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
    }
    makeLight(light_settings){
        let type = light_settings.type;
        delete light_settings.type;
        return new THREE[type](light_settings);
    }
    shadowDefaults(lightSettings,settings){
        lightSettings.castShadow = settings.castShadow||false;
        lightSettings.shadow = settings.shadow||{
            mapSize:{width:512,height:512},
            camera:{near:0.5,far:500}
        };
    }
    lightDefaults(settings){
        let lightSettings = {
            color:settings.color||"#ffffff",
            intensity:settings.intensity||1,
            type:settings.type||"AmbientLight"
        };
        switch(lightSettings.type){
            case "DirectionalLight":
                lightSettings.target = settings.target||null;
                this.shadowDefaults(lightSettings,settings);
                break;
            case "HemisphereLight":
                lightSettings.groundColor = settings.groundColor||"#ffffff";
                lightSettings.color = settings.color||"#ffffff";
                break;
            case "PointLight":
                lightSettings.distance = settings.distance||1;
                lightSettings.decay = settings.decay||0;
                lightSettings.power = settings.power||4*Math.PI;
                this.shadowDefaults(lightSettings,settings);
                break;
            case "RectAreaLight":
                lightSettings.width = settings.width||10;
                lightSettings.height = settings.height||10;
                break;
            case "SpotLight":
                lightSettings.distance = settings.distance||0;
                lightSettings.angle = settings.angle||Math.PI/2;
                lightSettings.penumbra = settings.penumbra||0;
                lightSettings.decay = settings.decay||0;
                lightSettings.power = settings.power||4*Math.PI;
                lightSettings.target = settings.target||null;
                this.shadowDefaults(lightSettings,settings);
                break;
        }

    }
}