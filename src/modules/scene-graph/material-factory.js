export class MaterialFactory{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
    }
    makeMaterial(mat_settings){
        let new_settings = {};
        return new Promise(resolve=>{
            Object.keys(mat_settings)
                .filter(function(key){return [
                    "type","map","texture","lightTexture",
                    "normalMap","lightMap","envMap","alphaMap","aoMap","emissiveMap","metalnessMap","normalMap","roughnessMap","bumpMap"
                ].indexOf(key)===-1;})
                .forEach(function(key){
                    new_settings[key] = mat_settings[key];
                });
            if(mat_settings.map&&typeof mat_settings.map === "string"){
                try{
                    let texture = new THREE.TextureLoader().load(mat_settings.map,()=>{
                        // in this example we create the material when the texture is loaded
                        resolve(new THREE[mat_settings.type](new_settings))
                    });
                    texture.offset.set(mat_settings.texture.offset.x||0,mat_settings.texture.offset.y||0);
                    texture.repeat.set(mat_settings.texture.repeat.x||1,mat_settings.texture.repeat.y||1);
                    if(mat_settings.texture.wrapping){
                        texture.wrapS = mat_settings.texture.wrapping.s;
                        texture.wrapT = mat_settings.texture.wrapping.t;
                        texture.minFilter = mat_settings.texture.filters.min;
                        texture.magFilter = mat_settings.texture.filters.mag;
                    }
                    new_settings.map = texture;
                }catch(e){
                    console.log(e);
                }
            }
            else{
                resolve(new THREE[mat_settings.type](new_settings))
            }
        })
    }
    phongSettingsWithDefaults(materialSettings,settings){
        let mapCompatibles = [
            "MeshPhongMaterial",
            "MeshToonMaterial"
        ];
        if(mapCompatibles.indexOf(settings.type)>-1) {
           //materialSettings.combine = settings.combine || THREE.Multiply;
            materialSettings.color = settings.color || "#ffffff";
            materialSettings.bumpMap = settings.bumpMap || "";
            materialSettings.bumpScale = settings.bumpScale || 1;
            materialSettings.displacementMap = settings.displacementMap || "";
            materialSettings.displacementScale = settings.displacementScale || 1;
            materialSettings.displacementBias = settings.displacementBias || 0;
            materialSettings.emissive = settings.emissive || '#000';
            materialSettings.emissiveMap = settings.emissiveMap || "";
            materialSettings.emissiveIntensity = settings.emissiveIntensity || 1;
            materialSettings.morphNormals = settings.morphNormals || false;
            materialSettings.morphTargets = settings.morphTargets || false;
            materialSettings.normalMap = settings.normalMap || "";
            materialSettings.normalScale = settings.normalScale || new THREE.Vector2(1, 1);
           // materialSettings.normalMapType = settings.normalMapType || 0;
            materialSettings.shininess = settings.shininess || 30;
            materialSettings.specular = settings.specular || '#111111';
            materialSettings.specularMap = settings.specularMap || "";
            materialSettings.reflectivity = settings.reflectivity || 0.5;
            materialSettings.refractionRatio = settings.reflectivity || 0.98;
            materialSettings.skinning = settings.skinning || false;
        }
    }
    standardSettingsWithDefaults(materialSettings,settings){
        let mapCompatibles = [
            "MeshStandardMaterial",
            "MeshPhysicalMaterial"
        ];
        if(mapCompatibles.indexOf(settings.type)>-1) {
            materialSettings.color = settings.color || "#ffffff";
            materialSettings.bumpMap = settings.bumpMap || "";
            materialSettings.bumpScale = settings.bumpScale || 1;
            materialSettings.displacementMap = settings.displacementMap || "";
            materialSettings.displacementScale = settings.displacementScale || 1;
            materialSettings.displacementBias = settings.displacementBias || 0;
            materialSettings.emissive = settings.emissive || '#000000';
            materialSettings.emissiveMap = settings.emissiveMap || "";
            materialSettings.emissiveIntensity = settings.emissiveIntensity || 1;
            materialSettings.envMapIntensity = settings.emissiveIntensity || 1;
            materialSettings.metalness = settings.metalness || 0.5;
            materialSettings.metalnessMap = settings.metalnessMap || "";
            materialSettings.morphNormals = settings.morphNormals || false;
            materialSettings.morphTargets = settings.morphTargets || false;
            materialSettings.normalMap = settings.normalMap || "";
            materialSettings.normalScale = settings.normalScale || new THREE.Vector2(1, 1);
           // materialSettings.normalMapType = settings.normalMapType || 0;
            materialSettings.roughness = settings.roughness || 0.8;
            materialSettings.roughnessMap = settings.roughnessMap || "";
            materialSettings.refractionRatio = settings.reflectivity || 0.98;
            materialSettings.skinning = settings.skinning || false;
        }
    }
    wireframeSettingsWithDefaults(mat_settings,settings){
        let mapCompatibles = [
            "MeshBasicMaterial",
            "MeshStandardMaterial",
            "MeshLambertMaterial",
            "MeshPhongMaterial",
            "MeshPhysicalMaterial",
            "MeshToonMaterial"
        ];
        if(mapCompatibles.indexOf(settings.type)>-1){
            mat_settings.wireframe = settings.wireframe||false;
            mat_settings.wireframeLinecap = settings.wireframeLinecap||'round';
            mat_settings.wireframeLinejoin = settings.wireframeLinejoin||'round';
            mat_settings.wireframeLinewidth = settings.wireframeLinewidth||1;
        }
    }
    mapSettingsWithDefaults(mat_settings,settings){
        let mapCompatibles = [
            "MeshBasicMaterial",
            "MeshStandardMaterial",
            "MeshLambertMaterial",
            "MeshPhongMaterial",
            "MeshPhysicalMaterial",
            "MeshToonMaterial"
        ];
        if(mapCompatibles.indexOf(settings.type)>-1){
            mat_settings.map = settings.map||"";
            mat_settings.alphaMap = settings.alphaMap||"";
            mat_settings.aoMap = settings.aoMap||"";
            mat_settings.aoMapIntensity = settings.aoMapIntensity||1;
            mat_settings.envMap = settings.envMap||"";
            mat_settings.lightMap = settings.lightMap||"";
            mat_settings.lightMapIntensity = settings.lightMapIntensity||1;
        }
    }
    materialSettingsWithDefaults(settings){

        let materialSettings = {
            type:settings.type||'MeshStandardMaterial',
            visible:settings.visible===false?settings.visible:true,
            transparent:settings.transparent||false,
            alphaTest:settings.alphaTest||0.5,
            opacity:settings.opacity||1,
            side:settings.side||THREE.FrontSide,
            texture:{
                wrapping:{s:settings.texture&&settings.texture.wrapping?settings.texture.wrapping.s:THREE.RepeatWrapping,t:settings.texture&&settings.texture.wrapping?settings.texture.wrapping.t:THREE.RepeatWrapping},
                repeat:{x:settings.texture&&settings.texture.repeat?settings.texture.repeat.x:1,y:settings.texture&&settings.texture.repeat?settings.texture.repeat.y:1},
                offset:{x:settings.texture&&settings.texture.offset?settings.texture.offset.x:0,y:settings.texture&&settings.texture.offset?settings.texture.offset.y:0},
                filters:{mag:settings.texture&&settings.texture.filters?settings.texture.filters.mag:THREE.LinearFilter,min:settings.texture&&settings.texture.filters?settings.texture.filters.min:THREE.LinearMipMapLinearFilter},
            },
            lightTexture:{
                wrapping:{s:settings.lightTexture&&settings.lightTexture.wrapping?settings.lightTexture.wrapping.s:THREE.RepeatWrapping,t:settings.lightTexture&&settings.lightTexture.wrapping?settings.lightTexture.wrapping.t:THREE.RepeatWrapping},
                repeat:{x:settings.lightTexture&&settings.lightTexture.repeat?settings.lightTexture.repeat.x:0,y:settings.lightTexture&&settings.lightTexture.repeat?settings.lightTexture.repeat.y:0},
                offset:{x:settings.lightTexture&&settings.lightTexture.offset?settings.lightTexture.offset.x:0,y:settings.lightTexture&&settings.lightTexture.offset?settings.lightTexture.offset.y:0},
                filters:{mag:settings.lightTexture&&settings.lightTexture.filters?settings.lightTexture.filters.mag:THREE.LinearFilter,min:settings.lightTexture&&settings.lightTexture.filters?settings.lightTexture.filters.min:THREE.LinearMipMapLinearFilter},
            }};
        switch(settings.type){
            case "MeshBasicMaterial":
                this.mapSettingsWithDefaults(materialSettings,settings);
                //materialSettings.combine = settings.combine||THREE.Multiply;
                materialSettings.color = settings.color||"#ffffff";
                materialSettings.reflectivity = settings.reflectivity||0.5;
                materialSettings.refractionRatio = settings.reflectivity||0.98;
                materialSettings.skinning = settings.skinning||false;
                materialSettings.lights = settings.lights||false;
                materialSettings.fog = settings.fog||false;
                materialSettings.specularMap = settings.specularMap||"";
                this.wireframeSettingsWithDefaults(materialSettings,settings);
                break;
            case "MeshStandardMaterial":
                this.mapSettingsWithDefaults(materialSettings,settings);
                this.standardSettingsWithDefaults(materialSettings,settings);
                this.wireframeSettingsWithDefaults(materialSettings,settings);
                break;
            case "MeshLambertMaterial":
                this.mapSettingsWithDefaults(materialSettings,settings);
                //materialSettings.combine = settings.combine||THREE.Multiply;
                materialSettings.color = settings.color || "#ffffff";
                materialSettings.emissive = settings.emissive||'#000';
                materialSettings.emissiveMap = settings.emissiveMap||"";
                materialSettings.emissiveIntensity = settings.emissiveIntensity||1;
                materialSettings.morphNormals = settings.morphNormals||false;
                materialSettings.morphTargets = settings.morphTargets||false;
                materialSettings.reflectivity = settings.reflectivity||0.5;
                materialSettings.refractionRatio = settings.reflectivity||0.98;
                materialSettings.skinning = settings.skinning||false;
                materialSettings.specularMap = settings.specularMap||"";
                this.wireframeSettingsWithDefaults(materialSettings,settings);
                break;
            case "MeshPhongMaterial":
                this.mapSettingsWithDefaults(materialSettings,settings);
                this.phongSettingsWithDefaults(materialSettings,settings);
                this.wireframeSettingsWithDefaults(materialSettings,settings);
                break;
            case "MeshDepthMaterial":
                materialSettings.alphaMap = settings.alphaMap||"";
                materialSettings.fog = settings.fog||false;
                materialSettings.lights = settings.lights||false;
                materialSettings.displacementMap = settings.displacementMap||"";
                materialSettings.displacementScale = settings.displacementScale||1;
                materialSettings.displacementBias = settings.displacementBias||0;
                materialSettings.depthPacking = settings.depthPacking||THREE.BasicDepthPacking;
                materialSettings.map = settings.map||"";
                materialSettings.skinning = settings.skinning||false;
                materialSettings.wireframe = settings.wireframe||false;
                materialSettings.wireframeLinewidth = settings.wireframeLinewidth||1;
                break;
            case "MeshPhysicalMaterial":
                this.mapSettingsWithDefaults(materialSettings,settings);
                this.standardSettingsWithDefaults(materialSettings,settings);
                materialSettings.clearCoat = settings.clearCoat||0;
                materialSettings.clearCoatRoughness = settings.clearCoatRoughness||0;
                materialSettings.reflectivity = settings.reflectivity||0.5;
                this.wireframeSettingsWithDefaults(materialSettings,settings);
                break;
            case "MeshToonMaterial":
                this.mapSettingsWithDefaults(materialSettings,settings);
                materialSettings.gradientMap = settings.gradientMap||"";
                this.phongSettingsWithDefaults(materialSettings,settings);
                this.wireframeSettingsWithDefaults(materialSettings,settings);
                break;
            case "ShaderMaterial":
                // TODO: think about how shaders can be implemented
                break;
        }
        return materialSettings;
    }
}