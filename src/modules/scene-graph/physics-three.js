import PhysicsWorker from 'worker-loader!./physics-worker.js';

export class PhysicsThree{
    constructor(context){
        this.context = context;
        this.bodies = {};
        this.resolveCache = {};
        this.physicsWorker = new PhysicsWorker();
        this.physicsWorker.onmessage = e=>this.workerMessage(e);
        let _this = this;
        this.getData = true;
        AFRAME.registerComponent('physics-update', {
            init(){
                this.gizmoEl = document.getElementById('gizmos');
                this.gizmoEl.addEventListener('start-gizmo',()=>{
                    _this.getData = false;
                });
                this.gizmoEl.addEventListener('stop-gizmo',()=>{
                    _this.setCurrentPosition()
                        .then(()=>{
                            _this.getData = true;
                        });
                });
                this.rig = document.getElementById('rig').object3D;
                _this.send('add', {
                    id:this.rig.uuid,
                    isAvatar:true,
                    objectId:this.rig.uuid,
                    name:'avatar',
                    shape:'Box',
                    settings:{
                        size:{x:0.5,y:2,z:0.5}
                    },
                    bodySettings:{
                        mass:0,
                        position: this.rig.position
                    }
                });
            },
            tick() {
                _this.setAvatarPosition(this.rig);
                if(_this.getData){
                    _this.context.physics.send('getData',{})
                        .then(data=>{
                            for(let key in data.data){
                                _this.updateBodyObject(data.data[key]);

                            }
                        });
                }

            }
        });
        this.context.sceneEl.setAttribute('physics-update','');
    }
    setAvatarPosition(rig){
        return this.context.physics.send('setData',{
            objectId:rig.uuid,
            position:rig.position,
            friction:0,
            restitution:0,
            mass:0,
            quaternion:{
                x:rig.quaternion.x,
                y:rig.quaternion.y,
                z:rig.quaternion.z,
                w:rig.quaternion.w
            },
        });
    }
    setCurrentPosition(object) {
        object = object || this.context.currentObject;
        let quaternion = object.object3D.getWorldQuaternion();
        let position = object.object3D.getWorldPosition();
        return this.context.physics.send('setData',{
            objectId:object.settings.uuid,
            position:position,
            mass:object.settings.physics.settings.mass,
            friction:object.settings.physics.settings.friction,
            restitution:object.settings.physics.settings.restitution,
            quaternion:{
                x:quaternion.x,
                y:quaternion.y,
                z:quaternion.z,
                w:quaternion.w
            },
        });
    }
    remove(){
        for(let key in this.bodies){
            if(this.bodies[key].object===this.context.currentObject){
                this.send('remove', {id:key});
                delete this.bodies[key];
            }
        }
    }
    updateShape(child){
        if(this.bodies[child.objectId]&&this.bodies[child.objectId].shapes[child.id]&&this.context.currentObject.settings.physics.enabled){
            this.context.physics.send('updateShape',{id:child.id,objectId:child.objectId,shape:child.shape,settings:child.settings});
        }
    }
    removeShape(id,objectId){
        if(this.bodies[objectId]&&this.bodies[objectId].shapes[id]){
            this.context.physics.send('removeShape',{id,objectId});
            delete this.bodies[objectId].shapes[id]
        }
    }
    addCurrent(object){
        object = object || this.context.currentObject;
        let physics = object.settings.physics;
        if(!physics.enabled) return;
        let i = 0;

        for(let key in physics.shapes){
            let shape = physics.shapes[key];
            if(!this.bodies[shape.objectId]){
                let mass = object.settings.physics.settings.mass;
                this.bodies[shape.objectId] = {
                    id:shape.objectId,
                    mass:mass,
                    object:object,
                    shapes:{}
                };
            }


            let quaternion = object.object3D.getWorldQuaternion();
            let position = object.object3D.getWorldPosition();
            let bodySett = object.settings.physics.settings;
            this.send('add', i===0?{
                id:shape.id,
                objectId:shape.objectId,
                name:shape.name,
                shape:shape.shape,
                settings:shape.settings,
                bodySettings:{
                    mass:bodySett.mass,
                    position: position,
                    quaternion: {
                        x:quaternion.x,
                        y:quaternion.y,
                        z:quaternion.z,
                        w:quaternion.w
                    },
                    friction: bodySett.friction,
                    restitution: bodySett.restitution
                }
            }:shape);
            i++;
            this.bodies[shape.objectId].shapes[shape.id] = shape;
        }
    }
    add(shape,meshes){
        let objectId = this.context.currentObject.settings.uuid;
        this.context.currentObject.object3D.updateMatrixWorld();
        if(!meshes.length){
            meshes = [null];
        }
        for(let i = 0; i < meshes.length; i++){
            let mesh = meshes[i];
            let name = (mesh?mesh.name:this.context.namer.generateName()+" "+shape);
            let settings = this.shapeSettings(mesh,shape);
            let id = THREE.Math.generateUUID();
            let bodySettings;
            if(!this.bodies[objectId]){
                let bodySett = this.context.currentObject.settings.physics.settings;
                this.bodies[objectId] = {
                    id:objectId,
                    mass:bodySett.mass,
                    object:this.context.currentObject,
                    shapes:{},
                    disabled:[]
                };
                let quaternion = this.context.currentObject.object3D.getWorldQuaternion();
                let position = this.context.currentObject.object3D.getWorldPosition();
                bodySettings = {
                    mass: bodySett.mass,
                    position: position,
                    quaternion:{
                        x:quaternion.x,
                        y:quaternion.y,
                        z:quaternion.z,
                        w:quaternion.w
                    },
                    friction: bodySett.friction,
                    restitution: bodySett.restitution
                };
            }

            let shapeObject = {id,objectId,name,shape,settings};
            if(this.context.currentObject.settings.physics.enabled){
                this.send('add', {id,objectId,name,shape,settings,bodySettings});
                this.bodies[objectId].shapes[shapeObject.id] = {id,objectId};
            }
            this.context.currentObject.settings.physics.shapes.push({id,objectId,name,shape,settings});
        }
    }
    shapeSettings(object,shape){
        let settings = {
            hide_on_mobile:false,
            hide_on_desktop:false
        };
        let box;
        if(object){
            box = new THREE.Box3().setFromObject(object);
            settings.offset = box.getCenter().sub(this.context.currentObject.object3D.getWorldPosition());
        }else{
            box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(),new THREE.Vector3(1,1,1));
            settings.offset = box.getCenter();
        }
        settings.rotationOffset = {x:0,y:0,z:0};
        settings.size = box.getSize();
        switch(shape){
            case "Plane":
                settings.width = settings.size.x;
                settings.height = settings.size.y;
                settings.size.z = 0.01;
                break;
            case "Box":
                // nothing to do;
                break;
            case "Sphere":
                settings.radius = Math.max.apply(null, [settings.size.x,settings.size.y,settings.size.z])/2;
                break;
            case "Cylinder":
                settings.radiusTop = Math.max.apply(null, [settings.size.x,settings.size.y,settings.size.z]);
                settings.radiusBottom = Math.max.apply(null, [settings.size.x,settings.size.y,settings.size.z]);
                settings.height = 1;
                settings.radialSegments = 16;
                break;
            case "Terrain Collider":
                settings.heightfield = this.getHeightField(object,box);
                //settings.rotationOffset.x = -Math.PI/2;
                // settings.offset.x=-(settings.heightfield.elementSize*settings.heightfield.size.sizeX)/2;
                // settings.offset.y=-(settings.heightfield.elementSize*settings.heightfield.size.sizeZ)/2;
                // settings.offset.z=-(settings.heightfield.max.y-settings.heightfield.min.y)/2;
                // console.log(settings);
                break;
        }
        return settings;
    }
    updateBodyObject(bodyData){
        if(this.bodies[bodyData.key]){
            let position = this.bodies[bodyData.key].object.object3D.parent.worldToLocal(new THREE.Vector3(bodyData.position.x,bodyData.position.y,bodyData.position.z))
            this.bodies[bodyData.key].object.object3D.position.copy(position);
            this.bodies[bodyData.key].object.object3D.quaternion.set(bodyData.quaternion.x,bodyData.quaternion.y,bodyData.quaternion.z,bodyData.quaternion.w);
            let helper = this.context.physicsView.displayShapes[bodyData.key];
            if(helper){
                helper.mesh.position.set(bodyData.position.x,bodyData.position.y,bodyData.position.z);
                helper.mesh.quaternion.set(bodyData.quaternion.x,bodyData.quaternion.y,bodyData.quaternion.z,bodyData.quaternion.w);
            }
        }
    }
    reduceHeightFieldSize(sizeX,sizeZ){
        if(sizeX*sizeZ>1600){
            let ratio = sizeX / sizeZ;
            if(ratio>1){
                sizeX-=1;
                sizeZ-=(1/ratio);
            }else{
                sizeX-=ratio;
                sizeZ-=1;
            }
            return this.reduceHeightFieldSize(sizeX,sizeZ);
        }
        return {sizeX,sizeZ};
    }
    getHeightField(object,box) {
        let sizeX = 40,
            sizeZ = 40;
        let minx = box.min.x;
        let maxx = box.max.x;
        let totx = maxx-minx;
        let minz = box.min.z;
        let maxz = box.max.z;
        let totz = maxz-minz;
        let ratio = totx / totz;
        if(ratio > 1){
            sizeZ = sizeZ*ratio
        }else{
            sizeX = sizeX*(1/ratio)
        }
        let size = this.reduceHeightFieldSize(sizeX,sizeZ);
        size.sizeX = Math.round(size.sizeX);
        size.sizeZ = Math.round(size.sizeZ);
        let min = box.min;
        let max = box.min;
        let center = box.getCenter();
        let elementSize = totx/size.sizeX;
        let raycaster = new THREE.Raycaster();
        let planeGeometry = new THREE.PlaneGeometry(size.sizeX*elementSize,size.sizeZ*elementSize,size.sizeX,size.sizeZ);
        let mesh = new THREE.Mesh(planeGeometry,new THREE.MeshBasicMaterial({color:'#ff0000',wireframe:true}));
        mesh.rotation.x=Math.PI/2;
        mesh.position.copy(center);
        mesh.position.y = box.max.y;
        this.context.sceneEl.object3D.add(mesh);
        mesh.parent.updateMatrixWorld();
        let matrix = [];
        let row = -1;
        for (let i = 0; i < planeGeometry.vertices.length; i++) {
            if(planeGeometry.vertices[i].x===planeGeometry.vertices[0].x){
                matrix.push([]);
                row++;
            }
            let vertexPos = mesh.localToWorld(planeGeometry.vertices[i].clone());
            raycaster.ray.direction.copy( new THREE.Vector3(0,-1,0) );
            raycaster.ray.origin.copy( vertexPos);
            let intersections = raycaster.intersectObjects( [object] );
            if(intersections.length){
               // console.log();
                matrix[row].push((box.max.y-box.min.y)-intersections[0].distance);
                //matrix[row].push(box.min.y-((box.max.y-box.min.y)-intersections[0].point.y));
            }else {
                matrix[row].push(0);
            }
        }
        UI.utils.clearObject(mesh);
        this.context.sceneEl.object3D.remove(mesh);
        return {min,max,center,elementSize,size,matrix};
    }
    workerMessage(event){
        if(this.resolveCache[event.data.id]){
            this.resolveCache[event.data.id](event.data);
            delete this.resolveCache[event.data.id];
        }
    }
    async send(type, data){
        let id = THREE.Math.generateUUID();
        this.physicsWorker.postMessage({ type, data, id});
        return new Promise(resolve=>{
            this.resolveCache[id] = resolve;
        });
    }
}