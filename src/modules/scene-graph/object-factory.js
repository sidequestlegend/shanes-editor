import {MaterialFactory} from "./material-factory";
import {GeometryFactory} from "./geometry-factory";
import {LightFactory} from "./light-factory";

export class ObjectFactory{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
        this.materialFactory = new MaterialFactory(sceneGraph);
        this.geometryFactory = new GeometryFactory(sceneGraph);
        this.lightFactory = new LightFactory(sceneGraph);
    }
    changeGeometry(type){
        // Change the type of the geometry
        let isPrimitive = this.sceneGraph.context.currentObject.settings.type==="Primitive";
        this.sceneGraph.context.currentObject.settings.geometry =
            this.geometryFactory[isPrimitive?"geometrySettingsWithDefaults":"parametricSettingsWithDefaults"]
                (isPrimitive?{type:type}:{sub_type:type});
        if(isPrimitive){
            this.sceneGraph.context.currentObject.settings.geometry.type = type;
        }else{
            this.sceneGraph.context.currentObject.settings.geometry.sub_type = type;
        }
        this.resetGeometry();
    }
    resetGeometry(){
        // Reset the current objects geometry to the new one selected.
        let settings = this.sceneGraph.context.currentObject.settings;
        this.sceneGraph.context.currentObject.object3D.geometry =
            settings.type==="Primitive"?
                this.geometryFactory.makeGeometry(settings.geometry):
                this.geometryFactory.makeParametric(settings.geometry);
        if(settings.type!=="Primitive")this.scaleAndCenterGeometry(this.sceneGraph.context.currentObject.object3D.geometry);
        this.addStats(this.sceneGraph.context.currentObject.object3D,this.sceneGraph.context.currentObject);
    }
    changeMaterial(type){
        // Change the material type transferring any settings across that are compatible.
        let settings = this.sceneGraph.context.currentObject.settings;
        settings.material.type = type;
        this.sceneGraph.context.currentObject.settings.material = this.materialFactory.materialSettingsWithDefaults(settings.material)
        let material = this.materialFactory.makeMaterial(this.sceneGraph.context.currentObject.settings.material);
        this.sceneGraph.context.currentObject.object3D.material = material;
    }
    generateUserData(settings){
        // Generate default settings for a new object created - wraps the defaultUserData method basically.
        let userData = this.defaultUserData(
                settings.type,
                settings.sub_type||"",
                settings.geo_settings||{},
                settings.mat_settings||{},
                settings.tra_settings||{},
                settings.name
            );
        if(settings.type==="Sprite"){
            userData.material.rotation = settings.mat_settings.rotation;
            userData.material.fog = settings.mat_settings.fog;
            userData.material.lights = settings.mat_settings.lights;
        }
        if(settings.portal){
            userData.portal = settings.portal;
        }
        userData.disable_animations = settings.disable_animations||false;
        userData.preserve_scale = settings.preserve_scale||false;
        if(settings.prefab)userData.prefab = settings.prefab;
        if(settings.url)userData.url = settings.url;
        if(settings.mtl_url){
            userData.mtl_url = settings.mtl_url;
            userData.mtl_path = settings.mtl_path;
        }
        if(settings.aframeCode)userData.aframeCode = settings.aframeCode;
        if(settings.type==="Light")userData.light = settings.settings;
        // Set the added flag to propagate this change to the sync system
        userData.state.added = true;
        return userData;
    }

    defaultUserData(type,sub_type,geo_settings,mat_settings,tra_settings,name,uuid){
        // Create the default object definition.
        geo_settings = geo_settings||{};
        geo_settings.type = sub_type;
        geo_settings.sub_type = geo_settings.sub_type||"";
        return {
            name:(name||this.sceneGraph.context.namer.generateName()),
            uuid:uuid||THREE.Math.generateUUID(),
            type:type||"Object3D",
            shadow:{cast:false,receive:false},
            transform:{
                position:{
                    x:tra_settings&&tra_settings.position?tra_settings.position.x||0:0,
                    y:tra_settings&&tra_settings.position?tra_settings.position.y||0:0,
                    z:tra_settings&&tra_settings.position?tra_settings.position.z||0:0
                },
                rotation:{
                    x:tra_settings&&tra_settings.rotation?tra_settings.rotation.x||0:0,
                    y:tra_settings&&tra_settings.rotation?tra_settings.rotation.y||0:0,
                    z:tra_settings&&tra_settings.rotation?tra_settings.rotation.z||0:0
                },
                scale:{
                    x:tra_settings&&tra_settings.scale?tra_settings.scale.x||1:1,
                    y:tra_settings&&tra_settings.scale?tra_settings.scale.y||1:1,
                    z:tra_settings&&tra_settings.scale?tra_settings.scale.z||1:1
                }
            },
            mouseOn:false,
            behaviours:[],
            physics:{
                enabled:false,
                walkOnEnabled:false,
                settings:{
                    mass:0,
                    friction:0,
                    restitution:0
                },
                shapes:[]
            },
            hide_on_mobile:false,
            hide_on_desktop:false,
            preserve_scale:false,
            disable_animations:false,
            geometry:geo_settings||{},
            material:this.materialFactory.materialSettingsWithDefaults(mat_settings||{}),
            light:{},
            state:{
                added:false,
                updated:false,
                transform_update:false,
                removed:false
            }
        }
    }
    getTotals(object){
        // Get the total vertices and pixels in a newly added object.
        let totals = {points:0,pixels:0};
        let imageCache = [];
        object.traverse(child=>{
            if(child.geometry&&child.geometry.attributes){
                totals.points += child.geometry.attributes.position.count;
            }else if(child.geometry&&child.geometry.faces) {
                totals.points += child.geometry.faces.length*3;
            }
            if(child.material&&child.material.map&&child.material.map.image&&
                imageCache.indexOf(child.material.map.image.currentSrc)===-1){

                imageCache.push(child.material.map.image.currentSrc);
                totals.pixels+=child.material.map.image.width*child.material.map.image.height;
            }
        });
        return totals;
    }
    addStats(object,child){
        // Add total stats to an object if not already set.
        if(!child.settings.stats)
            child.settings.stats = this.getTotals(object);
    }
    transform(object,child){
        // Transform a newly created object to the settings in the scene graph.
        object.userData.sceneObject = child;
        if(object){
            object.rotation.set(
                child.settings.transform.rotation.x,
                child.settings.transform.rotation.y,
                child.settings.transform.rotation.z);
            object.position.set(
                child.settings.transform.position.x,
                child.settings.transform.position.y,
                child.settings.transform.position.z);
            object.scale.set(
                child.settings.transform.scale.x,
                child.settings.transform.scale.y,
                child.settings.transform.scale.z
            );
        }
    }
    spriteDefaults(settings){
        return {
            color:settings.color||'#ffffff',
            fog:settings.fog||false,
            lights:settings.lights||false,
            rotation:settings.rotation||0,
            map:settings.map||""
        }
    }

    portalDefaults(settings){
        return {
            image:settings.image||'https://cdn.theexpanse.app/images/portal-default.jpg',
            spaces_id:settings.spaces_id||1,
        }
    }

    makePortal(settings){
        let portalDefaults = this.portalDefaults(settings.portal);
        //#4db6ac
        settings.aframeCode = '<a-entity expanse-portal="image:'+portalDefaults.image+';title:'+settings.name+';backgroundColor:#000000;spaces_id:'+portalDefaults.spaces_id+'"></a-entity>';
    }


    makeEffect(settings){
        switch(settings.geometry.type){
            case "Fire":
                settings.aframeCode = `<a-entity spe-particles__sparks="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/square.png; color: yellow, red; particle-count: 10; max-age: 0.5; max-age-spread: 0.4; velocity: 0 5 0; velocity-spread: 0 3 0; wiggle: 1 0 1; wiggle-spread: 5 0 5; emitter-scale: 50; size-spread: .5; randomize-velocity: true"
 spe-particles__smoke="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/fog.png; velocity: .4 2 0; velocity-spread: 1.4 0 1.4; particle-count: 10; max-age: 4; size: 8,16; opacity: 0,0.5,0; color: #666,#222"
 spe-particles__fire="texture:https://harlyq.github.io/aframe-spe-particles-component/assets/explosion_sheet.png; texture-frames: 5 5; velocity: .4 .1 0; acceleration: 0 2 0; acceleration-spread: 0 2 0; velocity-spread: .4 0 .4; particle-count: 15; max-age: 1; size: 7.5,15; size-spread: 5; opacity: 1,0; wiggle: 0 1 0; blending: additive"></a-entity>`;
                break;
            case "Explosion":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/explosion_sheet.png; texture-frames: 5 5; distribution: sphere; radius: .1; particle-count: 20; max-age: 1; size: 16; active-multiplier: .5">
                </a-entity>`;
                break;
            case "RingOfFire":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/blob.png; particle-count: 300; maxAge: 1; distribution: disc; acceleration-distribution: box; acceleration: 0 2 0; color: orange">
                </a-entity>`;
                break;
            case "Fireworks":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/fireworks_sheet.png; texture-frames: 5 5; particle-count: 2; max-age: 2; size: 15">
                </a-entity>`;
                break;
            case "Smoke":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/fog.png; velocity: .2 1 0; velocity-spread: .2 0 .2; particle-count: 50; max-age: 4; size: 3,8; opacity: 0,1,0; color: #aaa,#222">
                </a-entity>`;
                break;
            case "Fog":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/fog.png; position-spread: 2 0 2; velocity-spread: .1 .05 .1; particle-count: 50; max-age: 10; size: 6,10; opacity: 0,1,0; randomize-position: true">
                </a-entity>`;
                break;
            case "Steam":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/fog.png; velocity: .2 1 0; velocity-spread: .2 0 .2; particle-count: 50; max-age: 4; size: 3,8; opacity: 0,1,0; color: #eee,#fff">
                </a-entity>`;
                break;
            case "Fountain":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/blob.png; color: blue; velocity: 0 10 0; velocity-spread: 2 0 2; acceleration: 0 -10 0">
                </a-entity>`;
                break;
            case "Rain":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/assets/blob.png; color: blue; position-spread: 2 0 2; radius: 0; randomize-position: true; particle-count: 50; velocity: 0 -10 0; max-age: .25">
                </a-entity>`;
                break;
            case "Snow":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/assets/blob.png; color: #ccc; blending: normal; position-spread: 2 0 2; radius: 0; randomize-position: true; particle-count: 50; velocity: 0 -.5 0; velocity-spread: .1 .2 .1; wiggle-spread: 1 0 1; maxAge: 6; emitter-scale: 100">
                </a-entity>`;
                break;
            case "Sparkler":
                settings.aframeCode = `<a-entity spe-particles="texture: https://harlyq.github.io/aframe-spe-particles-component/assets/blob.png; particle-count: 50; max-age: .5; distribution: sphere; radius: .01; velocity: 1; acceleration: 1">
                </a-entity>`;
                break;
        }
    }

    resolveObject(object,scene,child,resolve){
        // Resolve a newly created object - used to calculate the loading percentage and
        // some common processing tasks.
        this.transform(object,child);
        // TODO: hook into preserve_scale property to decide if this object should be centered and scaled to fit inside 1,1,1
        if(!child.settings.preserve_scale)this.scaleAndCenterObject(scene);
        object.add( scene );
        this.addStats(object,child);
        setTimeout(()=>resolve(object),50);
    }
    make(child){
        let settings = child.settings;
        let object,promise;
        promise = new Promise(resolve=>{
            let geometry, loader;
            switch(settings.type){
                case "Primitive":
                    // Create a primitive geometry
                    geometry = this.geometryFactory.makeGeometry(settings.geometry);
                    let material = this.materialFactory.makeMaterial(settings.material)
                     //   .then(material=>{
                    object = new THREE.Mesh(geometry,material);
                    object.name = "Primitive";
                    this.transform(object,child);
                    this.addStats(object,child);
                    object.castShadow = settings.shadow.cast;
                    object.receiveShadow = settings.shadow.receive;
                    resolve(object);
                    //    });
                    break;
                case "Parametric":
                    // Create a parametric geometry
                    geometry = this.geometryFactory.makeParametric(settings.geometry);
                    this.scaleAndCenterGeometry(geometry);
                    this.materialFactory.makeMaterial(settings.material)
                        .then(material=>{
                            object = new THREE.Mesh(geometry,material);
                            object.name = "Parametric";
                            this.transform(object,child);
                            this.addStats(object,child);
                            object.castShadow = settings.shadow.cast;
                            object.receiveShadow = settings.shadow.receive;
                            resolve(object);
                        });
                    break;
                case "Light":
                    // Create a light
                    object = this.lightFactory.makeLight(settings.light);
                    object.position.set(
                        child.settings.transform.position.x,
                        child.settings.transform.position.y,
                        child.settings.transform.position.z);
                    object.userData.sceneObject = child;
                    object.userData.sceneObject.stats = {points:0,pixels:0};
                    resolve(object);
                    break;
                case "Object3D":
                    object = new THREE.Object3D();
                    object.name = 'Group';
                    this.transform(object,child);
                    object.userData.sceneObject.stats = {points:0,pixels:0};
                    resolve(object);
                    break;
                case "Sprite":
                    let defaults = this.spriteDefaults(settings.material);
                    if(defaults.map){
                        defaults.map = new THREE.TextureLoader().load(defaults.map);
                    }else{
                        delete defaults.map;
                    }
                    object = new THREE.Sprite(new THREE.SpriteMaterial(defaults));
                    this.transform(object,child);
                    resolve(object);
                    break;
                case "Effect":
                case "Portal":
                case "Aframe":
                    if(settings.type==="Portal"){
                        this.makePortal(child.settings);
                    }else if(settings.type==="Effect"){
                        this.makeEffect(child.settings);
                    }
                    object = new THREE.Object3D();
                    this.addAframeItem(child)
                        .then(aobject=>{
                            if(settings.type==="Aframe"&&!child.settings.preserve_scale){
                                this.scaleAndCenterObject(aobject);
                            }
                            this.transform(object,child);
                            object.add(aobject);
                            return object;
                        })
                        .then(resolve);
                    break;
                case "Prefab":
                    object = new THREE.Object3D();
                    fetch(this.sceneGraph.context.rootUrl+settings.prefab.url)
                        .then(response=>response.json())
                        .then(_prefab=>{
                            let promises = this.sceneGraph.serialiser.deSerialiseScene(_prefab,object);
                            this.sceneGraph.behaviourFactory.awakePrefabBehaviours(_prefab);
                            this.transform(object,child);
                            Promise.all(promises)
                                .then(()=>resolve(object));
                        });
                    break;
                case "Avatar":
                case "Kenney":
                case "Sketchfab":
                case "Poly":
                case "Custom":
                    // Load a 3d model from any source.
                    object = new THREE.Object3D();
                    child.object3D = object;
                    let loader;
                    object.name = settings.type;
                    switch(settings.geometry.type){
                        case "GLTF2":
                            loader = new THREE.GLTFLoader();
                            loader.setCrossOrigin( true );
                            loader.load( settings.url, ( response )=>{
                                if(!settings.disable_animations)this.startAnimations(response,response.scene,object);
                                this.resolveObject(object,response.scene,child,resolve)
                            });
                            break;
                        case "DAE":
                            let url = settings.url;
                            loader = new THREE.ColladaLoader();
                            loader.setCrossOrigin( true );
                            loader.load(url, response=> {
                                if(!settings.disable_animations)this.startAnimations(response,response.scene,object);
                                this.resolveObject(object,response.scene,child,resolve)
                            });
                            break;
                        case "FBX":
                            loader = new THREE.FBXLoader();
                            loader.setCrossOrigin( true );
                            loader.load( settings.url, ( response )=>{
                                if(!settings.disable_animations)this.startAnimations(response,response,object);
                                this.resolveObject(object,response,child,resolve)
                            });
                            break;
                        case "GLTF":
                            loader = new THREE.LegacyGLTFLoader();
                            loader.setCrossOrigin( true );
                            loader.load( settings.url, ( response )=>this.resolveObject(object,response.scene,child,resolve));
                            break;
                        case "OBJ":
                            let urls = {obj:settings.url,mtl:settings.mtl_url,mtl_path:settings.mtl_path};
                            loader = new THREE.MTLLoader();
                            loader.setCrossOrigin( true );
                            loader.setTexturePath( urls.mtl_path );
                            loader.load( urls.mtl,  materials => {
                                materials.preload();
                                loader = new THREE.OBJLoader();
                                loader.setMaterials(materials);
                                loader.load(urls.obj, obj=>this.resolveObject(object,obj,child,resolve));
                            });
                            break;
                    }
                    break;
            }
        });
        return {object,promise}
    }
    startAnimations(response,scene,object){
        if(response.animations&&response.animations.length){
            object.mixer = new THREE.AnimationMixer( scene );
            this.sceneGraph.mixers.push( object.mixer );

            let action = object.mixer.clipAction( response.animations[ 0 ] );
            action.play();
        }
    }
    getScaledVector(sizeH){
        if(sizeH.x>=sizeH.y&&sizeH.x>=sizeH.z){
            return new THREE.Vector3(1,sizeH.y/sizeH.x,sizeH.z/sizeH.x);
        }else if(sizeH.y>sizeH.x&&sizeH.y>sizeH.z){
            return new THREE.Vector3(sizeH.x/sizeH.y,1,sizeH.z/sizeH.y);
        }else if(sizeH.z>sizeH.x&&sizeH.z>sizeH.y){
            return new THREE.Vector3(sizeH.x/sizeH.z,sizeH.y/sizeH.z,1);
        }else{
            return new THREE.Vector3(1,1,1);
        }
    }
    scaleAndCenterGeometry(geometry){
        geometry.computeBoundingBox();
        // get the size of the bounding box of the house
        let sizeH = new THREE.Vector3();
        geometry.boundingBox.getSize(sizeH);
        // get the size of the bounding box of the obj
        let sizeO = this.getScaledVector(sizeH);
        let ratio = sizeH.divide( sizeO );
        geometry.scale ( 1/ratio.x, 1/ratio.y, 1/ratio.z );
        geometry.center();
    }
    scaleAndCenterObject(object){
        let box = new THREE.Box3().setFromObject( object );
        // get the size of the bounding box of the house

        let sizeH = new THREE.Vector3();
        box.getSize(sizeH);
        if(isNaN(sizeH.x)){
            sizeH = new THREE.Vector3(1,1,1);
        }
        // get the size of the bounding box of the obj
        let sizeO = this.getScaledVector(sizeH);
        let ratio = sizeH.divide( sizeO );

        object.scale.set( 1/ratio.x, 1/ratio.y, 1/ratio.z );
        let offset = new THREE.Vector3();
        box.getCenter(offset);
        offset.negate();
        object.position.copy(new THREE.Vector3(offset.x/ratio.x,offset.y/ratio.y,offset.z/ratio.z));
    }

    addAframeItem(object){
        return new Promise(resolve=>{
            let loadedWrapper = document.createElement('a-entity');
            loadedWrapper.className = 'o-'+object.settings.uuid;
            loadedWrapper.setAttribute('visible',false);
            loadedWrapper.insertAdjacentHTML('afterbegin',object.settings.aframeCode);
            loadedWrapper.addEventListener('loaded',e=>{
                // Trigger an update to redraw scrollbars and fire change events.
                loadedWrapper.object3D.parent.remove(loadedWrapper.object3D);
                loadedWrapper.object3D.name=object.settings.uuid;
                resolve(loadedWrapper.object3D);
                loadedWrapper.setAttribute('visible',true);
            });
            this.sceneGraph.aframeContainer.appendChild(loadedWrapper);
        })
    }

    resetAframeContainerItem(uuid,aframeItem){
        let object;

        this.sceneGraph.traverse(this.sceneGraph.currentScene,child=>{
            if(child.settings.uuid === uuid){
                object = child;
            }
        });
        if(object){
            object.object3D.children.forEach(child=>{
                if(child.name === uuid){
                    child.parent.remove(child);
                    UI.utils.clearObject(child);
                }
            });
            let element = this.sceneGraph.aframeContainer.querySelector('.o-'+uuid);
            this.sceneGraph.aframeContainer.removeChild(element);
            element = null;
            object.settings.aframeCode = aframeItem;
            this.addAframeItem(object)
                .then(aobject=>{
                    if(object.settings.type==="Aframe"&&!object.settings.preserve_scale){
                        this.scaleAndCenterObject(aobject);
                    }
                    this.transform(object.object3D,object);
                    object.object3D.add(aobject);
                    this.sceneGraph.context.displayBox.setObject(object.object3D);
                });
        }
    }

    clearAframeContainer(){
        while (this.sceneGraph.aframeContainer.firstChild) {
            let child = this.sceneGraph.aframeContainer.firstChild;
            if(child.object3D){
                UI.utils.clearObject(child.object3D);
            }
            this.sceneGraph.aframeContainer.removeChild(child);
        }
    }
}