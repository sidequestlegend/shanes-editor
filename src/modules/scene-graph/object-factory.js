import {MaterialFactory} from "./material-factory";
import {GeometryFactory} from "./geometry-factory";

export class ObjectFactory{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
        this.materialFactory = new MaterialFactory(sceneGraph);
        this.geometryFactory = new GeometryFactory(sceneGraph);
    }
    changeGeometry(type){
        let isPrimitive = this.sceneGraph.context.currentObject.settings.type==="Primitive";
        let newGeometry = this.geometryFactory[isPrimitive?"geometrySettingsWithDefaults":"parametricSettingsWithDefaults"]
        (isPrimitive?{type:type}:{sub_type:type});
        this.sceneGraph.context.currentObject.settings.geometry = newGeometry;
            ;
        if(isPrimitive){
            this.sceneGraph.context.currentObject.settings.geometry.type = type;
        }else{
            this.sceneGraph.context.currentObject.settings.geometry.sub_type = type;
        }
        this.resetGeometry();
    }
    resetGeometry(){
        let settings = this.sceneGraph.context.currentObject.settings;
        this.sceneGraph.context.currentObject.object3D.geometry =
            settings.type==="Primitive"?
                this.geometryFactory.makeGeometry(settings.geometry):
                this.geometryFactory.makeParametric(settings.geometry);
        if(settings.type!=="Primitive")this.scaleAndCenterGeometry(this.sceneGraph.context.currentObject.object3D.geometry);
        this.addStats(this.sceneGraph.context.currentObject.object3D,this.sceneGraph.context.currentObject);
    }
    changeMaterial(type){
        console.log(type);
        let settings = this.sceneGraph.context.currentObject.settings;
        settings.material.type = type;
        this.sceneGraph.context.currentObject.settings.material = this.materialFactory.materialSettingsWithDefaults(settings.material)
        console.log(this.sceneGraph.context.currentObject.settings.material);
        this.materialFactory.makeMaterial(this.sceneGraph.context.currentObject.settings.material)
            .then(material=>{
                this.sceneGraph.context.currentObject.object3D.material = material
            });
    }
    generateUserData(settings){
        console.log(settings);
        let userData = this.defaultUserData(
                settings.type,
                settings.sub_type||"",
                settings.geo_settings||{},
                settings.mat_settings||{},
                settings.tra_settings||{},
                settings.name
            );
        if(settings.url)userData.url = settings.url;
        if(settings.mtl_url){
            userData.mtl_url = settings.mtl_url;
            userData.mtl_path = settings.mtl_path;
        }
        userData.state.added = true;
        return userData;
    }

    defaultUserData(type,sub_type,geo_settings,mat_settings,tra_settings,name,uuid){
        geo_settings = geo_settings||{};
        geo_settings.type = sub_type;
        geo_settings.sub_type = geo_settings.sub_type||"";
        return {
            name:(name||this.sceneGraph.context.namer.generateName()),
            uuid:uuid||THREE.Math.generateUUID(),
            type:type||"Object3D",
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
            behaviours:[],
            hide_on_mobile:false,
            hide_on_desktop:false,
            geometry:geo_settings||{},
            material:this.materialFactory.materialSettingsWithDefaults(mat_settings||{}),
            state:{
                added:false,
                updated:false,
                transform_update:false,
                removed:false
            }
        }
    }
    getTotals(object){
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
        if(!child.settings.stats)
            child.settings.stats = this.getTotals(object);
    }
    transform(object,child){
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
    resolveObject(object,scene,child,resolve){
        this.transform(object,child);
        this.scaleAndCenterObject(scene);
        object.add( scene );
        this.addStats(object,child);
        setTimeout(()=>resolve(object),50);
    }
    make(child){
        let settings = child.settings;
        return new Promise(resolve=>{
            let object, geometry, promise, loader;
            switch(settings.type){
                case "Primitive":
                    geometry = this.geometryFactory.makeGeometry(settings.geometry);
                    //geometry = this.geometryModify(settings,geometry);
                    this.materialFactory.makeMaterial(settings.material)
                        .then(material=>{
                            object = new THREE.Mesh(geometry,material);
                            this.transform(object,child);
                            this.addStats(object,child);
                            resolve(object);
                        });
                    break;
                case "Parametric":
                    geometry = this.geometryFactory.makeParametric(settings.geometry);
                    this.scaleAndCenterGeometry(geometry);
                    //geometry = this.geometryModify(settings,geometry);
                    this.materialFactory.makeMaterial(settings.material)
                        .then(material=>{
                            object = new THREE.Mesh(geometry,material);
                            this.transform(object,child);
                            this.addStats(object,child);
                            resolve(object);
                        });
                    break;
                case "Object3D":
                    object = new THREE.Object3D();
                    object.name = 'Group';
                    this.transform(object,child);
                    object.userData.sceneObject.stats = {points:0,pixels:0};
                    resolve(object);
                    break;
                case "Poly":
                case "Custom":
                    object = new THREE.Object3D();
                    object.name = settings.type;
                    switch(settings.geometry.type){
                        case "GLTF2":
                            promise = Promise.resolve(settings.url);
                            if(settings.type==="Poly"){
                                promise = new Promise(function(r){
                                    new THREE.FileLoader().load('poly-proxy/'+encodeURIComponent(settings.url),function(url) {
                                        r(url);
                                    });
                                })
                            }
                            promise.then((url)=>{
                                let loader = new THREE.GLTFLoader();
                                loader.setCrossOrigin( true );
                                loader.load( url, ( response )=> this.resolveObject(object,response.scene,child,resolve));
                            });
                            break;
                        case "DAE":
                            let url = settings.url;
                            loader = new THREE.ColladaLoader();
                            loader.setCrossOrigin( true );
                            loader.load(url, response=> this.resolveObject(object,response.scene,child,resolve));
                            break;
                        case "GLTF":
                            loader = new THREE.LegacyGLTFLoader();
                            loader.setCrossOrigin( true );
                            loader.load( settings.url, ( response )=>this.resolveObject(object,response.scene,child,resolve));
                            break;
                        case "OBJ":
                            promise = Promise.resolve({obj:settings.url,mtl:settings.mtl_url,mtl_path:settings.mtl_path});
                            if(settings.type==="Poly"){
                                promise = Promise.all([new Promise(function(r){
                                    new THREE.FileLoader().load('poly-proxy/'+encodeURIComponent(settings.url),function(url) {
                                        r(url);
                                    });
                                }),
                                    new Promise(function(r){
                                        new THREE.FileLoader().load('poly-proxy/'+encodeURIComponent(settings.mtl_url),function(url) {
                                            r(url);
                                        });
                                    })])
                                    .then(function(urls){
                                        let relative_path = settings.url.replace(settings.mtl_path,"");
                                        return {obj:urls[0],mtl:urls[1],mtl_path:urls[0].slice( 0, urls[0].indexOf( relative_path ) )}
                                    });
                            }
                            loader = new THREE.MTLLoader();
                            loader.setCrossOrigin( true );
                            promise.then(urls=>{
                                loader.setTexturePath( urls.mtl_path );
                                loader.load( urls.mtl,  materials => {
                                    materials.preload();
                                    loader = new THREE.OBJLoader();
                                    loader.setMaterials(materials);
                                    loader.load(urls.obj, obj=>this.resolveObject(object,obj,child,resolve));
                                });
                            });
                            break;
                    }
                    break;
            }
        });
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
        let sizeH = geometry.boundingBox.getSize(); // get the size of the bounding box of the house
        let sizeO = this.getScaledVector(sizeH); // get the size of the bounding box of the obj
        let ratio = sizeH.divide( sizeO );
        geometry.scale ( 1/ratio.x, 1/ratio.y, 1/ratio.z );
        geometry.center();
    }
    scaleAndCenterObject(object){
        let box = new THREE.Box3().setFromObject( object );
        let sizeH = box.getSize(); // get the size of the bounding box of the house
        let sizeO = this.getScaledVector(sizeH); // get the size of the bounding box of the obj
        let ratio = sizeH.divide( sizeO );
        object.scale.set( 1/ratio.x, 1/ratio.y, 1/ratio.z );
        let offset = box.getCenter().clone().negate();
        object.position.copy(new THREE.Vector3(offset.x/ratio.x,offset.y/ratio.y,offset.z/ratio.z));
    }
}