export class BehaviourFactory{

    constructor(scene_graph){
        // TODO: This is just a transplant of the old behaviour code. This is not functional and needs to be re-implemented.
        this.scene_graph = scene_graph;
        this.global_time = {
            offset:0,
            updated:false
        };
    }

    getServerTime(){
        return new Date().getTime()-this.global_time.offset;
    }

    getGlobals(){
        return {
            document:document,
            scene:this.scene_graph.entityContainer.sceneEl.object3D,
            root:this.scene_graph.container,
            helper:this.scene_graph.behaviourHelper
        }
    }
    makeBehaviour(name){
        return {
            name:name||this.scene_graph.context.namer.generateName(),
            description:"",
            category: 'misc',
            image:'https://cdn.theexpanse.app/images/icons/objects/behaviour.jpg',
            is_public:false,
            obfuscate:false,
            definition:`return {
    schema(){
        
    },
    awake(globals,object3d,behaviour_config,user_config){
        
    },
    update(globals,object3d,behaviour_config,user_config,delta,serverTime){
        
    },
    dispose(object3d){
        
    }
}`,
            trigger:'auto-trigger',
            sync:false,
            //"toggle-trigger","mod-toggle-trigger","no-mod-toggle-trigger","click-trigger","mod-click-trigger","no-mod-click-trigger"
        }
    }
    cancelImportBehaviours(behaviours){
        let existing = [];
        let existingIds = [];
        for(let i = 0; i < behaviours.length; i++){
            existing.push({old_id:behaviours[i].behaviours_id});
            existingIds.push(behaviours[i].behaviours_id);
        }
        this.updateBehaviourIds(existing,existingIds,true);
    }
    updateBehaviourIds(existing,existingIds,isRemove){
        let sceneBehaviours = this.scene_graph.currentScene.behaviours;
        for(let i = 0; i < existing.length; i++){
            if(sceneBehaviours.hasOwnProperty(existing[i].old_id)){
                if(!isRemove) {
                    sceneBehaviours[existing[i].new_id] = sceneBehaviours[existing[i].old_id];
                    sceneBehaviours[existing[i].new_id].behaviours_id = existing[i].new_id;
                }
                delete sceneBehaviours[existing[i].old_id];
            }
        }

        this.scene_graph.traverse(this.scene_graph.currentScene,child=>{
            for(let i = 0; i < child.settings.behaviours.length; i++){
                let behaviour = child.settings.behaviours[i];
                let index = existingIds.indexOf(behaviour);
                if(index!==-1){
                    if(isRemove) {
                        child.settings.behaviours.splice(i,1);
                    }else{
                        child.settings.behaviours[i] = existing[index].new_id;
                    }
                }
            }
        });
    }
    checkBehaviours(){
        let behaviour_keys = Object.keys(this.scene_graph.currentScene.behaviours);
        if(behaviour_keys.length){
            let behaviours = [];
            for(let i = 0; i < behaviour_keys.length; i++){
                behaviours.push(this.scene_graph.currentScene.behaviours[behaviour_keys[i]]);
            }
            //this.loadLegacyBehaviours(behaviours);
            this.legacyBehaviours = behaviours;//sceneEl.emit('old-behaviours',behaviours);
        }
    }

    async loadRemoteBehaviours(type,data){
        return new Promise(resolve=>{
            let sceneEl = this.scene_graph.context.sceneEl;
            let response = ({detail})=>{
                resolve(detail);
                sceneEl.removeEventListener(type+"-return",response);
            };
            sceneEl.emit(type,data);
            sceneEl.addEventListener(type+"-return",response)
        });
    }

    async loadLegacyBehaviours(legacyBehaviours){
        let behaviourIds = [];
        for(let i = 0; i < legacyBehaviours.length; i++){
            behaviourIds.push(legacyBehaviours[i].behaviours_id)
        }
        if(!this.scene_graph.isEditing){
            return this.awakeBehaviours();
        }
        let existing = await this.loadRemoteBehaviours('getOldBehaviours',behaviourIds);
        let existingIds = existing.map(e=>e.old_id);
        let importBehaviours = legacyBehaviours;
        if(existing.length){
            importBehaviours = [];
            for(let i = 0; i < legacyBehaviours.length; i++){
                let index = existingIds.indexOf(legacyBehaviours[i].behaviours_id);
                if(index===-1){
                    importBehaviours.push(legacyBehaviours[i]);
                }
            }
            this.updateBehaviourIds(existing,existingIds);
        }
        if(importBehaviours.length){
            this.scene_graph.context.importBehavioursModal.open(importBehaviours,existingIds);
        }else{
            this.awakeBehaviours();
        }
    }

    async loadBehaviours() {
        if(this.legacyBehaviours){
            await this.loadLegacyBehaviours(this.legacyBehaviours);
        }else{
            await this.loadRemoteBehaviours('getSceneBehaviours',this.getBehaviourIds())
                .then(behaviours=>{
                    for(let i = 0; i < behaviours.length; i++){
                        this.scene_graph.currentScene.behaviours[behaviours[i].behaviours_id] = behaviours[i];
                    }
                    this.awakeBehaviours();
                })
        }
    }

    getBehaviourIds(){
        let behaviourIds = [];
        this.scene_graph.traverse(this.scene_graph.currentScene,child=>{
            let behaviours = child.settings.behaviours;
            for(let i = 0; i < behaviours.length; i++){
                if(!~behaviourIds.indexOf(behaviours[i])){
                    behaviourIds.push(behaviours[i]);
                }
            }
        });
        return behaviourIds;
    }

    awakePrefabBehaviours(prefabObject){
        this.scene_graph.traverse(prefabObject,child=>{
            this.addBehaviours(child,child.object3D,prefabObject);
        });
    }

    awakeBehaviours(){
        this.scene_graph.traverse(this.scene_graph.currentScene,child=>{
            this.addBehaviours(child,child.object3D);
        });
    }

    updateBehaviours(delta){
        let objectsToUpdate = [];

        this.scene_graph.container.traverse(function (object) {
            if (object.__behaviourList&&object.__behaviourList.length) {
                objectsToUpdate.push(object);
            }
        });

        for (let i = 0, max = objectsToUpdate.length; i < max; i++) {
            let object = objectsToUpdate[i];
            for(let j = 0; j < object.__behaviourList.length; j++){
                this.updateBehaviour(object.__behaviourList[j],object,delta);
            }
        }
    }

    updateBehaviour(behaviour,object,delta){
        try{
            if(behaviour){
                if(behaviour.update)behaviour.update.call(behaviour,this.getGlobals(),object,behaviour,behaviour.schema(),delta,this.getServerTime())
            }
        }catch(error){
            console.log.call(console, error.stack || error);
            console.log(behaviour.definition);
            console.log('Update Behavior:', behaviour.name,', SceneObject: ',object.userData.sceneObject?object.userData.sceneObject.settings.name:'Unknown: '+object.uuid);

        }
    }

    resetBehaviour(behaviours_id,prefabObject){

        let behaviourToUpdate = (prefabObject?prefabObject:this.scene_graph.currentScene).behaviours[behaviours_id];
        this.scene_graph.currentScene.object3D.traverse(child=>{
            if(child.userData.sceneObject&&child.__behaviourList){
                for(let i = 0; i < child.__behaviourList.length; i++){
                    if(child.__behaviourList[i].behaviours_id === behaviourToUpdate.behaviours_id){
                        this.removeBehavior(child.__behaviourList[i],child);
                        this.addBehaviour(behaviourToUpdate,child);
                    }
                }
            }
        });
    }

    addBehaviour(behaviour,object){
        try{
            if(behaviour){
                let proto = new Function(behaviour.definition)();
                for(let key in proto){
                    if(proto.hasOwnProperty(key)){
                        behaviour[key] = proto[key];
                    }
                }
                object.__behaviourList = object.__behaviourList || [];
                object.__behaviourList.push(behaviour);
                console.log('Adding Behaviour',behaviour.name);
                if(behaviour.awake)behaviour.awake.call(behaviour,this.getGlobals(),object,behaviour,behaviour.schema())
            }
        }catch(error){
            console.log.call(console, error.stack || error);
            console.log(behaviour.definition);
            console.log('Add Behavior:', behaviour.name,', SceneObject: ',object.userData.sceneObject?object.userData.sceneObject.settings.name:'Unknown: '+object.uuid);

        }
    }

    addBehaviours(child,object,prefabObject){
        for(let i = 0; i < child.settings.behaviours.length; i++){
            let behaviour = (prefabObject?prefabObject:this.scene_graph.currentScene).behaviours[child.settings.behaviours[i]];
            this.addBehaviour(behaviour,object);
        }
    }

    disposeBehaviour(behaviour,object){
        try {
            if (behaviour.dispose) behaviour.dispose.call(behaviour,object,behaviour,behaviour.schema());
        } catch (error) {
            console.log.call(console, error.stack || error);
            console.log(behaviour.definition);
            console.log('Dispose Behavior:', behaviour.name,', SceneObject: ',object.userData.sceneObject?object.userData.sceneObject.settings.name:'Unknown: '+object.uuid);
        }
    }

    removeBehavior(behaviour,object){
        if (!object.__behaviourList || object.__behaviourList.length === 0) return null;

        let i = object.__behaviourList.indexOf(behaviour);
        if (i !== -1) {
            object.__behaviourList.splice(i, 1);
            this.disposeBehaviour(behaviour,object);
        }
    }

    removeAllBehaviors(object){
        if (!object.__behaviourList || object.__behaviourList.length === 0) return null;

        for (let i = 0, max = object.__behaviourList.length; i < max; i++) {
            let behaviour = object.__behaviourList[i];
            this.removeBehavior(object,behaviour);
        }

        object.__behaviourList.length = 0;
    }

}
