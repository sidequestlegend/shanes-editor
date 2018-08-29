import {BehaviourHelper} from './scene-graph/behaviour-helper';
import {ObjectFactory} from "./scene-graph/object-factory";
import {Serialiser} from "./scene-graph/serialiser";
import {BehaviourFactory} from "./scene-graph/behaviour-factory";
import {Migrations} from "./scene-graph/migrations";
export class SceneGraph{

    constructor(context){
        this.context = context;
        this.migrations = new Migrations(this);
        this.behaviourHelper = new BehaviourHelper(this);
        this.objectFactory = new ObjectFactory(this);
        this.serialiser = new Serialiser(this);
        this.behaviourFactory = new BehaviourFactory(this);
        // Seed the current scene object - this is replaced when you load a scene in.
        this.currentScene = {settings:this.objectFactory.defaultUserData(),children:[]};
        this.resetContainer();
        this.containerComponentName = 'scene-graph-container';
        this.setupAframeContainer();
        console.log('Shane\'s Editor Version 0.2.0')
    }

    async load(scene){
        // Get the current scene json definition
        return fetch(window.location.protocol+'//'+window.location.host+'/scene/'+scene.short_code+'.json')
            .then(response=>response.json())
            .then(_scene=>{
                // Clear anything out of the scene first.
                this.clearScene();
                this.hasScene = true;
                this.sceneLoaded = false;
                // Set the current scene object
                this.currentScene = _scene || this.currentScene;
                // Migrate the current scene object fromthe old altspace format
                this.migrations.migrate();
                // Store the scene details in the scene definition
                this.currentScene.metadata = scene;
                console.log('Scene Downloaded.');
                return Promise.resolve();
            });
    }

    canOpen(){
        // Is there a scene loaded but not open?
        return this.hasScene&&!this.sceneLoaded;
    }

    dispatchLoadEvents(promises){
        // Send back load events to facilitate displaying loading percentages.
        let completeCount = 0;
        let total = promises.length;
        for(let i = 0; i < total; i++){
            let promise = promises[i];
            promise.then(()=>{
                completeCount++;
                this.context.sceneEl.emit('scene-loading',completeCount/total);
            });
        }
    }

    open(){
        console.log('Loading Scene...');
        // return if no scene is loaded.
        if(!this.currentScene||this.sceneLoaded)return;
        // Open the current scene that was previously loaded with this.load()
        this.context.sceneEl.emit('scene-load-start');
        this.sceneLoaded = true;
        // Deserialize scene
        let promises = this.serialiser.deSerialiseScene(this.currentScene);
        this.dispatchLoadEvents(promises);
        return Promise.all(promises);
    }

    setupAframeContainer(){
        let _this = this;
        // Register aframe component to attach the scene to teh aframe container
        // I didnt use aframe for the scene graph as i wanted more granular control over the
        // hierarchy and wanted to be able to use fancy geometries and more material settings.
        AFRAME.registerComponent(this.containerComponentName, {
            init(){
                this.el.setObject3D('mesh',_this.container);
            }
        });
        // Create and attach the aframe entity container to the scene
        this.entityContainer = document.createElement('a-entity');
        this.entityContainer.setAttribute('scene-graph-container',"");
        this.entityContainer.setAttribute('position',"0 -1.6 0");
        document.querySelector('a-scene').appendChild(this.entityContainer);
    }

    totals(object,totals,desktopOverride,mobileOverride){
        // Recursively calculate object stats for the current object and its children.
        // These stats are set when the objects are initially deserialized
        let hide_on_mobile = object.settings.hide_on_mobile;
        let hide_on_desktop = object.settings.hide_on_desktop;
        if(object.settings.stats){
            if(!hide_on_desktop&&!desktopOverride){
                totals.desktop.points+=object.settings.stats.points;
                totals.desktop.pixels+=object.settings.stats.pixels;
            }else{
                hide_on_desktop = true;
            }
            if(!hide_on_mobile&&!mobileOverride){
                totals.mobile.points+=object.settings.stats.points;
                totals.mobile.pixels+=object.settings.stats.pixels;
            }else{
                hide_on_mobile = true;
            }
        }
        for(let i = 0; i< object.children.length; i++){
            this.totals(object.children[i],totals,hide_on_desktop,hide_on_mobile);
        }
    }

    resetContainer(){
        // Reset the scene container.
        this.container = new THREE.Object3D();
        this.currentScene.settings = this.objectFactory.defaultUserData();
        this.currentScene.children.length=0;
        this.container.userData.sceneObject = this.currentScene;
    }

    findByUUID(uuids,is_json,parent){
        // Traverse the scene graph to find an object with a certain UUID
        // This is probably not needed as each scene graph object has a reference to the
        // associated object3D and vice versa ( via userData )
        let results = {},
            _this = this;
        if(typeof uuids === "string"){
            uuids = [uuids];
        }
        (parent||this.container).traverse(function(child){
            if(child.userData.sceneObject){
                if(uuids.indexOf(child.userData.sceneObject.uuid) > -1){
                    results[child.userData.sceneObject.uuid] = is_json?JSON.stringify(_this.scene_graph.serialiseScene(child)):child;
                }
            }
        });
        return uuids.length===1?results[uuids[0]]:results;
    }

    remove(parent,index){
        // Remove an object from the scene graph freeing the resources is consumes.
        let child = parent.children[index];
        // TODO: needs to be updated to use the referenced object3d at child.object3D
        if(child&&child.settings.uuid){
            let object = this.findByUUID(child.settings.uuid);
            if(object){
                object.parent.remove(object);
                this.clearObject(object);
            }
            parent.children.splice(index, 1);
        }
    }

    async add(parent,settings){
        // Add an object to the scene.
        // If there is a camera dummy ( positioned 4m in front of the camera ) object
        // then use that to set the object position.
        if(this.context.cameraDummy){
            this.context.cameraDummy.object3D.position.set(0,0,-3);
            this.context.cameraDummy.object3D.updateMatrixWorld();
            parent.object3D.updateMatrixWorld();
            let position = this.context.cameraDummy.object3D.localToWorld(new THREE.Vector3(0,0,0))
            settings.tra_settings = {position:parent.object3D.worldToLocal(position)};
        }
        // Generate the object settings from the input parameters.
        let userData = this.objectFactory.generateUserData(settings);
        // Seed child object
        let child = {settings:userData,children:[]};
        // Create the object3D
        return this.objectFactory.make(child)
            .then(object=>{
                // Attach the child to the object3D as a reference.
                object.userData.sceneObject = child;
                // Attach the object3D to the child as a reference.
                child.object3D = object;
                // Set the childs parent property for traversing up the tree.
                child.parent = parent;
                // Add the object3D to the scene.
                parent.object3D.add(object);
                // Add the child to the parent int he scene graph
                parent.children.push(child);
                // Return the newly created child.
                return child;
            })
    }

    // getPointInBetweenByPerc(pointA, pointB, percentage) {
    //     let dir = pointB.clone().sub(pointA).normalize().multiplyScalar(pointA.distanceTo(pointB)*(percentage||0.5));
    //     return pointA.clone().add(dir);
    // }

    clearObject(object){
        // TODO: need to investigate what of this is necessary - or if there are other things to do also
        object.traverse(child=>{
            if(child.material&&child.material.map&&child.material.map.dispose){
                child.material.map.dispose();
                if(child.material.dispose)
                    child.material.dispose();
            }
            if(child.material&&child.material.length){
                for(let i =0; i < child.material.length; i++){
                    if(child.material[i].map&&child.material[i].map.dispose){
                        child.material[i].map.dispose();
                    }
                }
            }
            if(child.geometry){
                child.geometry.dispose();
            }
            if(child.dispose)child.dispose();
        });
    }

    clearScene(){
        this.hasScene = false;
        // Clean up all textures, materials, multi-materials, geometries and meshes.
        this.clearObject(this.container);
        // Reset the content container.
        this.resetContainer();
        this.entityContainer.setObject3D('mesh',this.container);
    }
}