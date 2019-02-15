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
        this.setupEmitOnSceneObject(scene_current);
        current.userData.sceneObject = scene_current;
        for(let i = 0; i< scene_current.children.length;i++){
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
                let childObject = this.sceneGraph.objectFactory.make(child);
                promises.push(Promise.resolve().then(()=>{
                    return childObject.promise.then(object=>{
                        if(object){
                            child.parent = scene_current;
                            child.emit('object-loaded');
                            child.objectLoaded = true;
                            current.add(childObject.object);
                            return {object:childObject.object,child:child};
                        }
                    });
                }));
                promises = this.deSerialiseScene(child,childObject.object,promises);
            }
        }
        return promises;
    }
    serialiseScene(current){
        let behaviours = {};
        let traverse = (current)=>{
            current = current||this.sceneGraph.currentScene;
            for(let i = 0; i < current.settings.behaviours.length; i++){
                behaviours[current.settings.behaviours[i]] = this.sceneGraph.currentScene.behaviours[current.settings.behaviours[i]];
            }
            let newCurrent = {settings:current.settings,children:[]};
            current.children.forEach(child=>{
                newCurrent.children.push(traverse(child));
            });
            return newCurrent;
        };
        let output = traverse(current);
        output.behaviours = behaviours;
        output.version = "2.0";
        return output;
    }
    setupEmitOnSceneObject(scene){
        scene.eventListeners = {};
        scene.addEventListener = (event,callback)=>{
            if(typeof callback === "function"){
                scene.eventListeners[event] = scene.eventListeners[event]||[];
                scene.eventListeners[event].push(callback);
            }
        };
        scene.removeEventListener = (event,callback)=>{
            if(scene.eventListeners[event]){
                let index = scene.eventListeners[event].indexOf(callback);
                if(index>-1){
                    scene.eventListeners[event].splice(index,1);
                }
            }
        };
        scene.removeAllEventListeners = (event)=>{
            delete scene.eventListeners[event];
        };
        scene.emit = (event,data)=>{
            if(scene.eventListeners[event]){
                for(let i = 0; i < scene.eventListeners[event].length; i ++){
                    scene.eventListeners[event][i](data);
                }
            }
        }
    }
}