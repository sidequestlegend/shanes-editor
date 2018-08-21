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

        this.currentScene = {settings:this.objectFactory.defaultUserData(),children:[]};

        this.resetContainer();

        this.containerComponentName = 'scene-graph-container';

        this.setupAframeContainer();

        console.log('Scene Editor Version 0.1.0')
    }

    async load(scene){
        return fetch(window.location.protocol+'//'+window.location.host+'/scene/'+scene.short_code+'.json')
            .then(response=>response.json())
            .then(_scene=>{
                this.clearScene();
                this.hasScene = true;
                this.sceneLoaded = false;
                this.currentScene = _scene || this.currentScene;
                this.migrations.migrate();
                this.currentScene.metadata = scene;
                console.log('Scene Downloaded.');
                return Promise.resolve();
            });
    }

    canOpen(){
        return this.hasScene&&!this.sceneLoaded;
    }

    dispatchLoadEvents(promises){
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
        this.context.sceneEl.emit('scene-load-start');
        if(!this.currentScene||this.sceneLoaded)return;
        this.sceneLoaded = true;
        let promises = this.serialiser.deSerialiseScene(this.currentScene);
        this.dispatchLoadEvents(promises);
        return Promise.all(promises);
    }

    setupAframeContainer(){
        let _this = this;
        AFRAME.registerComponent(this.containerComponentName, {
            init(){
                this.setObject3d(_this.container);
            },
            setObject3d(object){
                this.el.setObject3D('mesh',object);
            }
        });
        this.entityContainer = document.createElement('a-entity');
        this.entityContainer.setAttribute('scene-graph-container',"");
        this.entityContainer.setAttribute('position',"0 -1.6 0");
        document.querySelector('a-scene').appendChild(this.entityContainer);
    }

    totals(object,totals,desktopOverride,mobileOverride){
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
        this.container = new THREE.Object3D();
        this.currentScene.settings = this.objectFactory.defaultUserData();
        this.currentScene.children.length=0;
        this.container.userData.sceneObject = this.currentScene;
    }

    findByUUID(uuids,is_json,parent){
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
        let child = parent.children[index];
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
        if(this.context.cameraDummy){
            this.context.cameraDummy.object3D.position.set(0,0,-3);
            this.context.cameraDummy.object3D.updateMatrixWorld();
            parent.object3D.updateMatrixWorld();
            let position = this.context.cameraDummy.object3D.localToWorld(new THREE.Vector3(0,0,0))
            settings.tra_settings = {position:parent.object3D.worldToLocal(position)};
        }
        let userData = this.objectFactory.generateUserData(settings);
        if(parent.settings.uuid){
            let child = {settings:userData,children:[]};
            return this.objectFactory.make(child)
                .then(object=>{
                    child.object3D = object;
                    child.parent = parent;
                    parent.object3D.add(object);
                    parent.children.push(child);
                    return child;
                })
        }
    }

    getPointInBetweenByPerc(pointA, pointB, percentage) {
        let dir = pointB.clone().sub(pointA).normalize().multiplyScalar(pointA.distanceTo(pointB)*(percentage||0.5));
        return pointA.clone().add(dir);
    }

    clearObject(object){
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
        this.entityContainer.components[this.containerComponentName].setObject3d(this.container);
    }
}