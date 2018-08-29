export class Serialiser{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
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
                // TODO: Implement new mobile checks with aframe. Look at getting an oculus go for testing.
                // if(this.sceneGraph.context.is_renderer&&!this.sceneGraph.context.is_mobile&&child.settings.object.show_only_on_mobile){
                //     should_show = false;
                // }else if(this.sceneGraph.context.is_renderer&&this.sceneGraph.context.is_mobile&&child.settings.object.hide_on_mobile){
                //     should_show = false;
                // }
                if(should_show){
                    return this.sceneGraph.objectFactory.make(child).then(object=>{
                        if(object){
                            current.add(object);
                            object.userData.sceneObject = child;
                            child.object3D = object;
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
    serialiseScene(current){
        current = current||this.sceneGraph.container;
        if(!this.isObject(current))return;
        let output = {settings:{},children:[]};
        current.userData = current.userData||{};
        current.userData.plusspace = current.userData.plusspace||this.sceneGraph.objectFactory.defaultUserData();
        output.settings = current.userData.plusspace;
        if(output.settings.type!=="Custom"&&output.settings.type!=="Poly"){
            if(current.children&&current.children.length){
                current.children.forEach(child=>{
                    output.children.push(this.serialiseScene(child))
                });
            }
        }
        return output;
    }
    isObject(object){
        return object.userData&&object.userData.plusspace&&object.userData.plusspace.object
            &&object.userData.plusspace.geometry&&object.userData.plusspace.material;
    }
}