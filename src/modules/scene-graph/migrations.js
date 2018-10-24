export class Migrations{
    constructor(context){
        this.context = context;
        // Migrate the scene graph versions when there are breaking changes to the scene graph definition.
    }
    getVersion(){
        if(!this.context.currentScene)return;
        let version = this.context.currentScene.version;
        return version||"1.0";
    }
    migrate(){
        switch(this.getVersion()){
            case "1.0":
                try{this._session = JSON.parse(localStorage.getItem('session'));}catch(e){}
                this.migrateV2();
                break;
        }
    }
    migrateBehaviourV2(behaviour){
        let isAlt = behaviour.type !== "Custom Behaviour";
        let altSchema = JSON.stringify(behaviour.settings,null,4);
        behaviour.settings.code = behaviour.settings.code||{awake:"",update:"",dispose:""};
        return `return {
            schema(){
                `+(isAlt?'return '+altSchema:behaviour.settings.code.user_config)+`
            },
            awake(globals,object3d,behaviour_config,user_config){
                `+behaviour.settings.code.awake+`
            },
            update(globals,object3d,behaviour_config,user_config,delta,serverTime){
                `+behaviour.settings.code.update+`
            },
            dispose(object3d){
                `+behaviour.settings.code.dispose+`
            }
        }`;
    }
    migrateImageToCdn(image){
        // Correct relative paths to absolute urls.
        if(image === 'images/behaviour.png'){
            return 'https://cdn.theexpanse.app/images/icons/objects/behaviour.jpg'
        }else if(image.substr(0,7)==="images/"){
            console.log(this.context.context.rootUrl+image);
            return 'https://cdn.theexpanse.app/'+image
        }
    }
    migrateV2(current){
        current = current || this.context.currentScene;
        if(this.context.currentScene === current){
            current.version = "2.0";
            current.behaviours = {};
        }
        if(current.settings.object){
            let url = current.settings.object.url;
            let mtl_url = current.settings.object.mtl_url;
            let mtl_path = current.settings.object.mtl_path;
            let old_behaviours = current.settings.altspace?current.settings.altspace.behaviours||[]:[];
            let behaviours = [];
            old_behaviours.forEach(behaviour=>{
                let behaviourId = "new_"+behaviour.settings.behaviour_id;
                if(!behaviour.settings.behaviour_id){
                    let current_index = Object.keys(this.context.currentScene.behaviours).length;
                    behaviourId = "new_"+current_index+"_"+(this._session?this._session.users_id:THREE.Math.generateUUID());
                }
                let isAlt = behaviour.type !== "Custom Behaviour";
                this.context.currentScene.behaviours[behaviourId] = {
                    name:isAlt?behaviour.type:behaviour.settings.name,
                    description:isAlt?"":behaviour.settings.description,
                    category: isAlt?'altspace':'misc',
                    behaviours_id:behaviourId,
                    image:isAlt?'https://cdn.theexpanse.app/images/icons/objects/altvr.jpg':behaviour.settings.image?this.migrateImageToCdn(behaviour.settings.image):'https://cdn.theexpanse.app/images/icons/objects/behaviour.jpg',
                    is_public:false,
                    obfuscate:false,
                    definition:this.migrateBehaviourV2(behaviour),
                    trigger:behaviour.settings.trigger,
                    sync:behaviour.settings.sync,
                };
                behaviours.push(behaviourId);
            });
            current.settings = {
                name:current.settings.object.name,
                uuid:current.settings.object.uuid,
                type:current.settings.object.type,
                transform:current.settings.object.transform,
                behaviours:behaviours,
                hide_on_mobile:current.settings.object.hide_on_mobile||false,
                hide_on_desktop:current.settings.object.show_only_on_mobile||false,
                geometry:current.settings.geometry,
                preserve_scale:false,
                material:this.context.objectFactory.materialFactory.materialSettingsWithDefaults({
                    type:'MeshBasicMaterial',
                    visible:current.settings.material.visible,
                    color:current.settings.material.color,
                    transparent:current.settings.material.transparent,
                    opacity:current.settings.material.opacity,
                    map:this.migrateImageToCdn(current.settings.material.map),
                    side:current.settings.material.side,
                    fog:false,
                    lights:false,
                    texture:{
                        wrapping:{s:current.settings.wrapping?current.settings.wrapping.s:THREE.RepeatWrapping,t:current.settings.wrapping?current.settings.wrapping.t:THREE.RepeatWrapping},
                        repeat:{x:current.settings.material.repeatX?current.settings.material.repeatX:1,y:current.settings.material.repeatY?current.settings.material.repeatY:1},
                        offset:{x:current.settings.material.offsetX?current.settings.material.offsetX:0,y:current.settings.material.offsetY?current.settings.material.offsetY:0},
                        filters:{mag:current.settings.filters?current.settings.filters.mag:THREE.LinearFilter,min:current.settings.filters?current.settings.filters.min:THREE.LinearMipMapLinearFilter},
                    },
                    lightTexture:{
                        wrapping:{s:THREE.RepeatWrapping,t:THREE.RepeatWrapping},
                        repeat:{x:1,y:1},
                        offset:{x:0,y:0},
                        filters:{mag:THREE.LinearFilter,min:THREE.LinearMipMapLinearFilter},
                    }
                }),
                state:{
                    added:false,
                    updated:false,
                    transform_updated:false,
                    removed:false
                }
            };
            if(url){current.settings.url = url;}
            if(mtl_url){current.settings.mtl_url = mtl_url;}
            if(mtl_path){current.settings.mtl_path = mtl_path;}
        }
        current.children = current.children.filter(c=>c);
        for(let i = 0; i< current.children.length;i++){
            if(current.children[i]){
                this.migrateV2(current.children[i]);
            }
        }
    }
}