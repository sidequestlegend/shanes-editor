export class Serialiser{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
        this.isMobile = AFRAME.utils.device.isGearVR()
            ||AFRAME.utils.device.isMobile()
        ||/Pacific Build.+OculusBrowser.+SamsungBrowser.+Mobile VR/i.test(window.navigator.userAgent);
    }
    deSerialiseScene(scene_current,current,promises){
        if(!scene_current||!scene_current.settings)return;
        current = current||this.sceneGraph.container;
        promises = promises || [];
        if(!scene_current.settings.uuid)scene_current.settings.uuid = THREE.Math.generateUUID();
        scene_current.object3D = current;
        current.userData.sceneObject = scene_current;
        for(let i = 0; i< scene_current.children.length;i++){
            promises.push(Promise.resolve().then(()=>{
                let child = scene_current.children[i];
                let should_show = true;
                if(!child){
                    return;
                }
                if(this.sceneGraph.context.is_renderer&&!this.isMobile&&child.settings.hide_on_desktop){
                    should_show = false;
                }else if(this.sceneGraph.context.is_renderer&&this.isMobile&&child.settings.object.hide_on_mobile){
                    should_show = false;
                }
                if(should_show){
                    return this.sceneGraph.objectFactory.make(child).then(object=>{
                        if(object){
                            current.add(object);
                            child.parent = scene_current;
                            this.deSerialiseScene(child,object,promises);
                            return {object:object,child:child};
                        }
                    });
                }
            }));
        }
        return promises;
    }
    serialiseScene(current,behaviours){
        current = current||this.sceneGraph.currentScene;
        let output = {settings:current.settings,children:[]};
        current.children.forEach(child=>{
            for(let i = 0; i < child.settings.behaviours.length; i++){
                behaviours[child.settings.behaviours[i]] = this.sceneGraph.currentScene.behaviours[child.settings.behaviours[i]];
            }
            output.children.push(this.serialiseScene(child,behaviours));
        });
        return output;
    }
}