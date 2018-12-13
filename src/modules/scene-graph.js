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
        this.currentScene = {settings:this.objectFactory.defaultUserData(),children:[],behaviours:{}};
        this.resetContainer();
        this.containerComponentName = 'scene-graph-container';
        this.setupAframeContainer();
        // this.currentScene = {"settings":{"altspace":{"behaviours":[]},"object":{"type":"Object3D","name":"Silly","uuid":"5FFF0276-8E78-4CE8-8EDF-2E3E5EDDD42B","transform":{"position":{"x":0,"y":0,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1}},"baked_lighting":false,"geometry_subdivision":0,"geometry_tessellation":0,"geometry_simplification":0,"geometry_subdivision_enabled":false,"geometry_tessellation_enabled":false,"geometry_simplification_enabled":false,"hide_on_mobile":false,"show_only_on_mobile":false,"object_is_added":false,"object_is_updated":false,"object_is_transform_updated":false,"object_is_removed":false,"lighting_position":{"x":-10,"y":450,"z":0}},"geometry":{"sub_type":""},"material":{"visible":true,"color":"#ffffff","transparent":false,"opacity":1,"map":"","repeatX":1,"repeatY":1,"offsetX":0,"offsetY":0,"wrapping":1000,"side":0}},"children":[{"settings":{"altspace":{"behaviours":[]},"object":{"type":"Primitive","name":"Timely Sphere","uuid":"92A21D61-D987-4E89-8323-0EAFDB6DCB19","transform":{"position":{"x":0,"y":0,"z":0},"rotation":{"x":-1.5707963267948966,"y":0,"z":1.5707963267948966},"scale":{"x":1,"y":1,"z":1}},"baked_lighting":false,"geometry_subdivision":0,"geometry_tessellation":0,"geometry_simplification":0,"geometry_subdivision_enabled":false,"geometry_tessellation_enabled":false,"geometry_simplification_enabled":false,"hide_on_mobile":false,"show_only_on_mobile":false,"object_is_added":false,"object_is_updated":false,"object_is_transform_updated":false,"object_is_removed":false,"is_native":false},"geometry":{"radius":500,"widthSegments":16,"heightSegments":16,"phiStart":0,"phiLength":3.142,"thetaStart":0,"thetaLength":3.142,"type":"SphereGeometry","sub_type":"Sphere"},"material":{"visible":true,"color":"#ffffff","transparent":false,"opacity":1,"map":"https://xactaccounts.co.uk/model/aurora-sky.jpg","repeatX":1,"repeatY":1,"offsetX":0,"offsetY":0,"wrapping":1000,"side":1}},"children":[]},{"settings":{"altspace":{"behaviours":[{"type":"Mesh Collider","sub_type":"environment","settings":{"type":"environment","isTrigger":false,"center":[0,0,0],"convex":false,"trigger":"auto-trigger","sync":false}}]},"object":{"type":"Custom","name":"Heavy","uuid":"262D72D2-C86B-4E4F-83FF-A39AFC1640C8","transform":{"position":{"x":1.364007892,"y":34.141,"z":-5.34796027617727},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":2000,"y":2000,"z":2000}},"baked_lighting":false,"geometry_subdivision":0,"geometry_tessellation":0,"geometry_simplification":0,"geometry_subdivision_enabled":false,"geometry_tessellation_enabled":false,"geometry_simplification_enabled":false,"hide_on_mobile":false,"show_only_on_mobile":false,"object_is_added":false,"object_is_updated":false,"object_is_transform_updated":false,"object_is_removed":false,"url":"https://xactaccounts.co.uk/model/Model.gltf","is_native":false},"geometry":{"type":"GLTF2","sub_type":""},"material":{"visible":true,"color":"#ffffff","transparent":false,"opacity":1,"map":"","repeatX":1,"repeatY":1,"offsetX":0,"offsetY":0,"wrapping":1000,"side":0}},"children":[]},{"settings":{"altspace":{"behaviours":[{"type":"Custom Behaviour","sub_type":"test","settings":{"name":"test","description":"testd","image":"images/behaviour.png","author":"Shane","obfuscate":false,"user_options":{"text":{"type":"string","value":"hello world"},"intensity":{"type":"number","value":1},"is_enabled":{"type":"boolean","value":true},"tint":{"type":"array","value":"#ffffff","values":["#ffffff","#ff55ff","#ff5500"]}},"code":{"awake_errors":0,"awake":"\n//Behaviour.awake\n//Paste ( or type if you dare ) the body of your awake method here...\n\n//@param globals Object:{\n//\tdocument:HTMLDocument,\n//\tscene:THREE.Scene\n//}\n//@param object3d THREE.Object3D|THREE.Mesh|THREE.Group\n//@param behaviour_config Object:{\n//\tname:string,\n//\tdescription:string,\n//\timage:string,\n//\tauthor:string,\n//\tis_public:boolean\n//}\n//function awake(globals,object3d,behaviour_config){\n\nconsole.log(\"awake called\",globals,object3d,behaviour_config,user_config);\n\n//}","update_errors":0,"update":"\n//Behaviour.update\n//Paste ( or type if you dare ) the body of your update method here...\n\n//@param globals Object:{\n//\tdocument:HTMLDocument,\n//\tscene:THREE.Scene\n//}\n//@param object3d THREE.Object3D|THREE.Mesh|THREE.Group\n//@param behaviour_config Object:{\n//\tname:string,\n//\tdescription:string,\n//\timage:string,\n//\tauthor:string,\n//\tis_public:boolean\n//}\n//function update(globals,object3d,behaviour_config,user_config,delta,serverTime){\n\n\n//}","dispose":"","dispose_errors":0,"user_config_errors":0,"user_config":"\n//Paste ( or type if you dare ) the user configuration settings here...\n//they will be presented as settings to the user when adding/editing the \n//behaviour. They will also be passed to the awake and update methods. You can \n//use the following types: number, string, boolean ( switch ) and array ( radio selection )\n//Array type also has a values property for the \n//options.\nreturn {\n\ttext:{\n\t\ttype:\"string\",\n\t\tvalue:\"hello world\",\n\t},\n\tintensity:{\n\t\ttype:\"number\",\n\t\tvalue:1.000,\n\t},\n\tis_enabled:{\n\t\ttype:\"boolean\",\n\t\tvalue:true,\n\t},\n\ttint:{\n\t\ttype:\"array\",\n\t\tvalue:\"#ffffff\",\n\t\tvalues:[\n\t\t\t\"#ffffff\",\n\t\t\t\"#ff55ff\",\n\t\t\t\"#ff5500\"\n\t\t]\n\t}\n}"},"trigger":"auto-trigger","sync":true,"cost":0,"behaviour_id":"1115"}}]},"object":{"type":"Primitive","name":"Wild Plane","uuid":"56059B79-4092-4533-A846-9F6E2B37E1DF","transform":{"position":{"x":0,"y":-0.5,"z":0},"rotation":{"x":-1.5707963267948966,"y":0,"z":0},"scale":{"x":2000,"y":2000,"z":1}},"baked_lighting":false,"geometry_subdivision":0,"geometry_tessellation":0,"geometry_simplification":0,"geometry_subdivision_enabled":false,"geometry_tessellation_enabled":false,"geometry_simplification_enabled":false,"hide_on_mobile":false,"show_only_on_mobile":false,"object_is_added":false,"object_is_updated":false,"object_is_transform_updated":false,"object_is_removed":false,"is_native":false},"geometry":{"width":1,"height":1,"widthSegments":1,"heightSegments":1,"type":"PlaneGeometry","sub_type":"Plane"},"material":{"visible":true,"color":"#c6e2ff","transparent":true,"opacity":0.6,"map":"","repeatX":1,"repeatY":1,"offsetX":0,"offsetY":0,"wrapping":1000,"side":0}},"children":[]}]};
        // this.migrations.migrate();
        // console.log(JSON.stringify(this.currentScene.behaviours));
        this.mixers = [];
        this.physicsShapeObjects = [];
        this.physicsChildren = [];
        this.physicsWalkOnChildren = [];
        this.raycastObjects = [];
        let version = require('./../../package.json').version;
        console.log('Shane\'s Editor Version '+version);
    }

    async load(scene,isEditing){
        this.isEditing = isEditing;
        // Close the existing scene if open.
        if(this.hasScene){
            this.close()
        }
        // Get the current scene json definition
        return fetch(this.context.rootUrl+scene.url)
            .then(response=>response.json())
            .then(_scene=>{
                // Clear anything out of the scene first.
                this.clearScene();
                this.hasScene = true;
                this.sceneLoaded = false;
                // Set the current scene object
                this.currentScene = _scene || this.currentScene;
                // Migrate the current scene object from the old altspace format
                this.migrations.migrate();
                // Prompt to save parsed behaviours
                if(this.isEditing){
                    this.behaviourFactory.checkBehaviours();
                }
                // Store the scene details in the scene definition
                this.currentScene.metadata = scene;
                console.log('Scene Downloaded.');
            });
    }
    
    sync(object){
        object = object || this.context.currentObject;
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(()=>this.syncSend(object),150);
    }


    syncSend(object){
        object = object || this.context.currentObject;
        let syncObject;
        let isRemoved = object.settings.state.removed;
        if(isRemoved){
            syncObject = {
                state:{removed:true},
                uuid:object.settings.uuid
            };
        }else if(object.settings.state.added||object.settings.state.updated){
            syncObject = {};
            for(let key in object.settings){
                if(object.settings.hasOwnProperty(key))
                syncObject[key] = object.settings[key];
            }
            if(object.settings.state.added){
                syncObject.state = {added:true}
            }else{
                syncObject.state = {updated:true}
            }
            syncObject.parentUuid = object.parent.settings.uuid;
        }else if(object.settings.state.transform_updated){
            syncObject = {
                state:{transform_updated:true},
                uuid:object.settings.uuid,
                transform:object.settings.transform
            };
        }
        if(syncObject){
            this.context.sceneEl.emit('syncObject',syncObject);
            object.settings.state = {
                added:false,
                updated:false,
                transform_update:false,
                removed:false
            };
            if(isRemoved){
                this.removeSceneObject();
            }
        }
    }

    async syncReceive(syncObject){
        if(syncObject.state.added){
            let parentUuid = syncObject.parentUuid;
            let parent = this.findByUUID(parentUuid);
            if(parent){
                await this.addToScene(parent,syncObject);
            }
        }else if(syncObject.state.updated||syncObject.state.transform_updated){
            let update_transform = (type,child)=>{
                child.object3D[type].set(
                    child.settings.transform[type].x,
                    child.settings.transform[type].y,
                    child.settings.transform[type].z
                );
            };
            this.traverse(this.currentScene,async child=>{
                if(child.settings.uuid === syncObject.uuid){
                    if(syncObject.state.transform_updated){
                        child.settings.transform = syncObject.transform;
                        update_transform('position',child);
                        update_transform('rotation',child);
                        update_transform('scale',child);
                        this.context.physics.setCurrentPosition(child);
                    }else{
                        child.settings = syncObject;
                        let saveCurrent = this.context.currentObject;
                        this.context.currentObject = child;
                        this.removeObject();
                        this.context.currentObject = saveCurrent;
                        await this.objectFactory.make(child)
                            .then(object=>{
                                // Attach the child to the object3D as a reference.
                                object.userData.sceneObject = child;
                                // Attach the object3D to the child as a reference.
                                child.object3D = object;
                                // Add the object3D to the scene.
                                child.parent.object3D.add(object);
                                // Setup physics on object
                                this.context.physics.addCurrent(child);
                            });
                    }
                }
            });
        }else if(syncObject.state.removed){
            this.traverse(this.currentScene,async child=>{
                if(child.settings.uuid === syncObject.uuid){
                    this.context.currentObject = child;
                    this.removeObject();
                    this.removeSceneObject();
                }
            });
        }
    }

    canOpen(){
        // Is there a scene loaded but not open?
        return this.hasScene&&!this.sceneLoaded;
    }

    dispatchLoadEvents(promises){
        // Send back load events to facilitate displaying loading percentages.
        let completeCount = 0;
        let total = promises.length;
        if(!promises.length){
            this.context.sceneEl.emit('scene-loading',1);
        }
        for(let i = 0; i < total; i++){
            let promise = promises[i];
            promise.then(()=>{
                completeCount++;
                this.context.sceneEl.emit('scene-loading',completeCount/total);
            });
        }
        Promise.all(promises)
            .then(()=>{
                this.updatePhysicsChildren();
            })
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

    close(){
        console.log('Closing Scene...');
        this.traverse(this.currentScene,child=>{
            if(child.object3D&&child.object3D.__behaviourList){
                for(let i = 0; i < child.object3D.__behaviourList.length; i++){
                    this.behaviourFactory.removeBehavior(child.object3D.__behaviourList[i],child.object3D);
                }
            }
        });
    }

    updatePhysicsChildren(){
        this.physicsChildren.length = 0;
        this.physicsWalkOnChildren.length = 0;
        this.traverse(this.currentScene,child=>{
            if(child.settings.physics.enabled){
                this.physicsChildren.push(child.object3D);
            }
            if(child.settings.physics.walkOnEnabled){
                this.physicsWalkOnChildren.push(child.object3D);
            }
            if(child.settings.physics.shapes.length){
                this.physicsShapeObjects.push(child);
            }
        });
    }

    setupAframeContainer(){
        let _this = this;
        // Register component to kick things off in aframe.
        AFRAME.registerComponent(this.containerComponentName, {
            init(){
                this.el.setObject3D('mesh',_this.container);
                this.el.sceneEl.sceneGraph = _this;
                this.preventClickTime = 0;
                this.throttledMouseEvents = AFRAME.utils.throttle(_this.emitMouseEvents, 60, _this);
                setTimeout(()=>this.el.sceneEl.canvas.addEventListener('mousedown', e=>{
                    if(_this.prevIntersectionEl){
                        let now = new Date().getTime();
                        if(now-this.preventClickTime<200)return;
                        if(!this.el.sceneEl.preventClick){
                            _this.prevIntersectionEl.emit('mousedown',this.currentIntersection);
                        }else{
                            this.el.sceneEl.preventClick = false;
                        }
                        this.preventClickTime = now;
                    }
                }),1000);
            },
            tick(time,delta){
                if(_this.lightHelper){
                    _this.lightHelper.update();
                }
                if ( _this.mixers.length > 0 ) {

                    for ( let i = 0; i < _this.mixers.length; i ++ ) {

                        _this.mixers[ i ].update( delta/1000 );

                    }

                }
                _this.behaviourFactory.updateBehaviours(delta);
                this.throttledMouseEvents();
                //TWEEN.update()
            }
        });
        // Create and attach the aframe entity container to the scene
        this.entityContainer = document.createElement('a-entity');
        this.entityContainer.setAttribute('scene-graph-container',"");
        this.entityContainer.setAttribute('position',"0 0 0");
        document.querySelector('a-scene').appendChild(this.entityContainer);

        this.aframeContainer = document.createElement('a-entity');
        this.aframeContainer.setAttribute('position',"0 0 0");
        document.querySelector('a-scene').appendChild(this.aframeContainer);
    }

    emitMouseEvents(){
        let raycaster;
        if(this.context.sceneEl.renderer.vr.enabled&&this.context.sceneEl.handRaycaster){
            raycaster = this.context.sceneEl.handRaycaster.raycaster;
        }else if(!this.context.sceneEl.renderer.vr.enabled&&this.context.sceneEl.raycaster){
            raycaster = this.context.sceneEl.raycaster.raycaster;
        }
        if(!raycaster)return;
        //let raycaster = this.context.sceneEl&&this.context.sceneEl.raycaster?this.context.sceneEl.raycaster.raycaster:new THREE.Raycaster();
        if(!this.raycastObjectsInitialised){
            this.raycastObjectsInitialised = true;
            this.raycastObjects.length = 0;
            if(this.context.sceneEl){
                this.context.sceneEl.object3D.traverse(child=>{
                    if(child.userData.sceneObject&&
                        child.userData.sceneObject.settings.mouseOn){
                        this.raycastObjects.push(child);
                    }
                });
            }else{
                this.traverse(this.currentScene,object=>{
                    if(object.settings.mouseOn){
                        this.raycastObjects.push(object.object3D);
                    }
                });
            }
        }
        // this.helper.setDirection(this.raycaster.ray.direction);
        let intersections = raycaster.intersectObjects( this.raycastObjects, true );
        this.prevIntersectionEls = this.prevIntersectionEls||[];
        let type = 'mouse-move';
        let defaultPrevented = false;
        let closestDistance = Number.POSITIVE_INFINITY;
        let closestIntersection;
        for(let i = 0;i < intersections.length; i++) {
            let intersection = intersections[i];
            if (intersection.distance < closestDistance) {
                closestIntersection = intersections[i];
                closestDistance = intersection.distance;
            }
        }
        if(closestIntersection) {
            this.context.sceneEl.preventTeleport = true;
            // Only emit events on objecst with an element attached
            if(closestIntersection.object.userData.sceneObject&&
                closestIntersection.object.userData.sceneObject.emit&&
                closestIntersection.object.userData.sceneObject.settings.mouseOn){
                // Emit event on sceneGraph object

                let currentEvent = {intersection:closestIntersection};
                // If this is the first time weve seen this element then emit the mouseenter event.
                if(this.prevIntersectionEl!==closestIntersection.object.userData.sceneObject){
                    closestIntersection.object.userData.sceneObject.emit('mouseenter',currentEvent);
                }
                this.currentIntersection = {cursorEl:closestIntersection.object.userData.sceneObject,intersection:closestIntersection,evt:event};
                closestIntersection.object.userData.sceneObject.emit(type,this.currentIntersection);
            }

            if(this.prevIntersectionEl&&closestIntersection.object.userData.sceneObject!==this.prevIntersectionEl){
                this.prevIntersectionEl.emit('mouseleave');
            }
            this.prevIntersectionEl = closestIntersection.object.userData.sceneObject;
        }else{
            this.context.sceneEl.preventTeleport = false;
            if(this.prevIntersectionEl){
                this.prevIntersectionEl.emit('mouseleave');
            }
            delete this.prevIntersectionEl;
        }
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

    createNew(){
        // Create an empty scene object
        return {
            settings:this.objectFactory.defaultUserData(),
            children:[],
            version:"2.0",
            behaviours:{}
        }
    }

    traverse(object,callback){
        callback(object);
        for(let i = 0; i < object.children.length; i++){
            this.traverse(object.children[i],callback);
        }
    }

    resetContainer(){
        // Reset the scene container.
        this.container = new THREE.Object3D();
        this.currentScene.settings = this.objectFactory.defaultUserData();
        this.currentScene.settings.physics.gravity = {x:0,y:-9.82,z:0};
        this.currentScene.children.length=0;
        this.currentScene.behaviours = {};
        this.container.userData.sceneObject = this.currentScene;
    }

    findByUUID(uuid,parent){
        // Traverse the scene graph to find an object with a certain UUID
        let found;
        this.traverse(parent||this.currentScene,child=>{
            if(child.settings.uuid === uuid){
                found = child;
            }
        });
        return found;
    }

    removeSceneObject(){
        let parent = this.context.currentObject.parent;
        let i = parent.children.indexOf(this.context.currentObject);
        if (i !== -1) {
            parent.children.splice(i, 1);
        }
        delete this.context.currentObject.settings;
        delete this.context.currentObject.parent;
        delete this.context.currentObject.object3D;
        delete this.context.currentObject.children;
        delete this.context.currentObject;
    }

    removeObject(){
        // Remove an object from the scene graph freeing the resources is consumes.
        if(~["Portal","Aframe"].indexOf(this.context.currentObject.settings.type)){
            // remove the aframe reference element of its is attached.
            let element = this.aframeContainer.querySelector('.o-'+this.context.currentObject.settings.uuid);
            if(element.object3D)UI.utils.clearObject(element.object3D);
            this.aframeContainer.removeChild(element);
            element = null;
        }
        this.context.physics.remove();
        let object3D = this.context.currentObject.object3D;
        if(object3D.mixer){
            let mixIndex = this.mixers.indexOf(object3D.mixer);
            if(mixIndex>-1){
                this.mixers.splice(mixIndex,1);
            }
        }
        UI.utils.clearObject(object3D);
        object3D.parent.remove(object3D);
    }

    async add(parent,settings){
        // Add an object to the scene.
        // If there is a camera dummy ( positioned 4m in front of the camera ) object
        // then use that to set the object position.
        if(this.context.cameraDummy){
            this.context.cameraDummy.object3D.position.set(-2,0,-3);
            this.context.cameraDummy.object3D.updateMatrixWorld();
            parent.object3D.updateMatrixWorld();
            let position = this.context.cameraDummy.object3D.localToWorld(new THREE.Vector3(0,0,0))
            settings.tra_settings = {position:parent.object3D.worldToLocal(position)};
        }
        // Generate the object settings from the input parameters.
        let objectData = this.objectFactory.generateUserData(settings);

        return this.addToScene(parent,objectData);
    }

    async addToScene(parent,objectData){
        // Seed child object
        let child = {settings:objectData,children:[],parent:parent};
        // Create the object3D
        let childObject = this.objectFactory.make(child);

        return childObject.promise.then(()=>{
                // Attach the child to the object3D as a reference.
                childObject.object.userData.sceneObject = child;
                // Attach the object3D to the child as a reference.
                child.object3D = childObject.object;
                // Add the object3D to the scene.
                parent.object3D.add(childObject.object);
                // Add the child to the parent int he scene graph
                parent.children.push(child);
                // Setup physics on object
                this.context.physics.addCurrent(child);
                // Return the newly created child.
                return child;
            });
    }

    showLightHelper(){
        if(this.context.currentObject&&this.context.currentObject.settings.type==="Light"){
            switch(this.context.currentObject.settings.geometry.type){
                case "PointLight":
                    this.lightHelper = new THREE.PointLightHelper( this.context.currentObject.object3D );
                    break;
                case "HemisphereLight":
                    this.lightHelper = new THREE.HemisphereLightHelper( this.context.currentObject.object3D );
                    break;
                case "DirectionalLight":
                    this.lightHelper = new THREE.DirectionalLightHelper( this.context.currentObject.object3D );
                    break;
                case "RectAreaLight":
                    this.lightHelper = new THREE.RectAreaLightHelper( this.context.currentObject.object3D );
                    break;
                case "SpotLight":
                    this.lightHelper = new THREE.SpotLightHelper( this.context.currentObject.object3D );
                    break;
            }
            if(this.lightHelper)this.context.sceneEl.object3D.add( this.lightHelper );
        }
    }
    hideLightHelper(){
        if(this.lightHelper){
            this.context.sceneEl.object3D.remove( this.lightHelper );
            delete this.lightHelper;
        }
    }

    clearScene(){
        this.hasScene = false;
        // Clean up all textures, materials, multi-materials, geometries and meshes.
        UI.utils.clearObject(this.container);
        // Reset the content container.
        this.resetContainer();
        this.objectFactory.clearAframeContainer();
        this.entityContainer.setObject3D('mesh',this.container);
    }

}