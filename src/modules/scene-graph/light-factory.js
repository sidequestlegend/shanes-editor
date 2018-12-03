export class LightFactory{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
    }
    makeLight(light_settings){
        let light = new THREE[light_settings.type](light_settings);
        if(light.shadow){
            light.castShadow = light_settings.castShadow;
            light.shadow.mapSize.width = light_settings.mapSize.width;
            light.shadow.mapSize.height = light_settings.mapSize.height;
            light.shadow.camera.near = light_settings.camera.near;
            light.shadow.camera.far = light_settings.camera.far;
            light.shadow.camera.fov = light_settings.camera.fov;
        }
        if(light_settings.target){
            light.target.position.set(light_settings.target.x,light_settings.target.y,light_settings.target.z);
            light.target.updateMatrixWorld();
        }
        return light;
    }
    shadowDefaults(lightSettings,settings){
        lightSettings.castShadow = settings.castShadow||false;
        lightSettings.mapSize = settings.mapSize||{width:512,height:512};
        lightSettings.camera = settings.camera||{near:0.5,far:500,fov:50};
    }
    lightDefaults(settings){
        let lightSettings = {
            color:settings.color||"#ffffff",
            intensity:settings.intensity||1,
            type:settings.type||"AmbientLight"
        };
        switch(lightSettings.type){
            case "DirectionalLight":
                lightSettings.target = settings.target||{x:0,y:0,z:0};
                this.shadowDefaults(lightSettings,settings);
                break;
            case "HemisphereLight":
                lightSettings.groundColor = settings.groundColor||"#ffffff";
                lightSettings.color = settings.color||"#ffffff";
                break;
            case "PointLight":
                lightSettings.distance = settings.distance||1;
                lightSettings.decay = settings.decay||2;
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
                lightSettings.decay = settings.decay||2;
                lightSettings.power = settings.power||4*Math.PI;
                lightSettings.target = settings.target||{x:0,y:0,z:0};
                this.shadowDefaults(lightSettings,settings);
                break;
        }
        return lightSettings;
    }
}