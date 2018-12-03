import * as CANNON from "cannon";

export class PhysicsCannon{
    constructor(context){
        this.context = context;
        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.defaultContactMaterial.contactEquationStiffness = 5e6;
        this.world.defaultContactMaterial.contactEquationRelaxation = 10;
        this.bodies = {};
        this.defaultGravity = {x:0, y:-9.82, z:0};
        this.fixedTimeStep = 1.0 / 60.0;
        this.maxSubSteps = 3;
        this.addGround();
        this.setGravity(this.defaultGravity);
        this.setupListener();

    }
    removeGround(){
        if(!this.groundBody)return;
        this.world.removeBody(this.groundBody);
        delete this.groundBody;
    }
    addGround(){
        // Ground plane
        if(this.groundBody)return;
        let plane = new CANNON.Plane();
        this.groundBody = new CANNON.Body({ mass: 0 });
        this.groundBody.addShape(plane);
        this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        this.world.addBody(this.groundBody);
    }
    setGravity(gravity){
        this.world.gravity.set(gravity.x, gravity.y, gravity.z); // m/s²
    }
    setData(id, data){
        if(this.bodies.hasOwnProperty(data.objectId)){
            this.bodies[data.objectId].body.velocity = new CANNON.Vec3();
            this.bodies[data.objectId].body.angularVelocity = new CANNON.Vec3();
            this.bodies[data.objectId].body.position.set(data.position.x, data.position.y, data.position.z);
            this.bodies[data.objectId].body.quaternion.set(data.quaternion.x, data.quaternion.y,data.quaternion.z, data.quaternion.w);
            this.bodies[data.objectId].body.mass = this.bodies[data.objectId].mass = data.mass;
            let material = new CANNON.Material({friction:data.friction,restitution:data.restitution});
            this.bodies[data.objectId].body.material = material;
            //this.bodies[data.objectId].body.type = this.bodies[data.objectId].body.mass!==0?CANNON.Body.DYNAMIC:CANNON.Body.STATIC;
            this.bodies[data.objectId].body.type = CANNON.Body.DYNAMIC;
            this.bodies[data.objectId].body.updateMassProperties();
            this.context.postMessage({type:'setData',id});
        }
    }
    getHeightField(reqid, id, objectId){
        if(this.bodies.hasOwnProperty(objectId)){
            let body = this.bodies[objectId];
            if(body.shapes.hasOwnProperty(id)){
                let shape = body.shapes[id];
                var v0 = new CANNON.Vec3();
                var v1 = new CANNON.Vec3();
                var v2 = new CANNON.Vec3();
                let geometry = {
                    faces:[],
                    vertices:[]
                };
                for (var xi = 0; xi < shape.cannonShape.data.length - 1; xi++) {
                    for (var yi = 0; yi < shape.cannonShape.data[xi].length - 1; yi++) {
                        for (var k = 0; k < 2; k++) {
                            shape.cannonShape.getConvexTrianglePillar(xi, yi, k===0);
                            v0.copy(shape.cannonShape.pillarConvex.vertices[0]);
                            v1.copy(shape.cannonShape.pillarConvex.vertices[1]);
                            v2.copy(shape.cannonShape.pillarConvex.vertices[2]);
                            v0.vadd(shape.cannonShape.pillarOffset, v0);
                            v1.vadd(shape.cannonShape.pillarOffset, v1);
                            v2.vadd(shape.cannonShape.pillarOffset, v2);
                            geometry.vertices.push(
                                [v0.x, v0.y, v0.z],
                                [v1.x, v1.y, v1.z],
                                [v2.x, v2.y, v2.z]
                            );
                            var i = geometry.vertices.length - 3;
                            geometry.faces.push([i, i+1, i+2]);
                        }
                    }
                }
                this.context.postMessage({type:'getHeightField',data:geometry,id:reqid});
            }
        }

    }
    getData(id){
        let time = performance.now();
        if(this.lastTime !== undefined){
            let dt = (time - this.lastTime) / 1000;
            this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
        }
        this.lastTime = time;
        let bodies = {};
        for(let key in this.bodies){
            if(this.bodies.hasOwnProperty(key)){
                let body = this.bodies[key];
                if(body.mass>0&&!body.isAvatar){
                    bodies[key] = {
                        position:body.body.position,
                        quaternion:body.body.quaternion,
                        key
                    }
                }
            }
        }
        this.context.postMessage({type:'getData',data:bodies,id});
    }
    remove(id){
        if(!this.bodies[id])return;
        this.world.removeBody(this.bodies[id].body);
        delete this.bodies[id].body;
        delete this.bodies[id].shapes;
        delete this.bodies[id];
    }
    removeShape(id,objectId){
        if(!this.bodies[objectId]||!this.bodies[objectId].shapes[id])return;
        let index = this.bodies[objectId].body.shapes.indexOf(this.bodies[objectId].shapes[id].cannonShape);
        this.bodies[objectId].body.shapes.splice(index,1);
        this.bodies[objectId].body.shapeOffsets.splice(index,1);
        this.bodies[objectId].body.shapeOrientations.splice(index,1);
        this.bodies[objectId].body.updateMassProperties();
        delete this.bodies[objectId].shapes[id].cannonShape;
        delete this.bodies[objectId].shapes[id].shape;
        delete this.bodies[objectId].shapes[id].settings;
        delete this.bodies[objectId].shapes[id];
    }
    updateShape(id,objectId,shape,settings){
        if(!this.bodies[objectId]||!this.bodies[objectId].shapes[id])return;
        this.removeShape(id,objectId);
        this.add(id,objectId,shape,settings);
    }
    add(id,objectId,shape,settings,bodySettings,isAvatar){
        let cannonShape;
        switch(shape){
            case "Plane":
                settings.size.x = settings.width||1;
                settings.size.y = settings.height||1;
            case "Box":
                cannonShape = this.makeBoxShape(settings);
                break;
            case "Sphere":
                cannonShape = this.makeSphereShape(settings);
                break;
            case "Cylinder":
                cannonShape = this.makeCylinderShape(settings);
                break;
            case "Terrain Collider":
                cannonShape = this.makeHeightField(settings);
                break;
        }
        if(cannonShape){
            if(!this.bodies[objectId]){
                let material = new CANNON.Material({friction:bodySettings.friction,restitution:bodySettings.restitution});
                this.bodies[objectId] = {
                    id:objectId,
                    body:new CANNON.Body({
                        mass: bodySettings.mass,
                        position: bodySettings.position,
                        quaternion: bodySettings.quaternion,
                        material:material
                    }),
                    mass:bodySettings.mass,
                    shapes:{},
                    isAvatar:isAvatar
                };
                this.world.addBody(this.bodies[objectId].body);
            }
            settings.offset = settings.offset||{x:0,y:0,z:0};
            settings.rotationOffset = settings.rotationOffset||{x:0,y:0,z:0};
            this.bodies[objectId].body.addShape(
                cannonShape,
                new CANNON.Vec3(settings.offset.x,settings.offset.y,settings.offset.z),
                new CANNON.Quaternion().setFromEuler(
                    settings.rotationOffset.x,
                    settings.rotationOffset.y,
                    settings.rotationOffset.z,
                    'XYZ'
                )
            );
            this.bodies[objectId].body.updateMassProperties();
            this.bodies[objectId].shapes[id] = {shape,cannonShape,settings};
        }
    }
    setupListener() {
        this.context.addEventListener('message', event => {
            switch (event.data.type) {
                case "add":
                    this.add(event.data.data.id,event.data.data.objectId,event.data.data.shape,event.data.data.settings,event.data.data.bodySettings,event.data.data.isAvatar);
                    break;
                case "remove":
                    this.remove(event.data.data.id);
                    break;
                case "removeShape":
                    this.removeShape(event.data.data.id,event.data.data.objectId);
                    break;
                case "updateShape":
                    this.updateShape(event.data.data.id,event.data.data.objectId,event.data.data.shape,event.data.data.settings);
                    break;
                case "setGravity":
                    this.setGravity(event.data.data||this.defaultGravity);
                    break;
                case "getHeightField":
                    this.getHeightField(event.data.id,event.data.data.id,event.data.data.objectId);
                    break;
                case "getData":
                    this.getData(event.data.id);
                    break;
                case "setData":
                    this.setData(event.data.id,event.data.data);
                    break;
            }
        });
    }
    makeBoxShape (settings) {
        let shape = new CANNON.Box(new CANNON.Vec3(
            settings.size.x/2 || 0.01,
            settings.size.y/2 || 0.01,
            settings.size.z/2 || 0.01
        ));
        return shape;
    }
    makeCylinderShape(settings){
        return new CANNON.Cylinder(
            settings.radiusTop,
            settings.radiusBottom,
            settings.height||1,
            settings.radialSegments||8
        );
    }
    makeSphereShape(settings){
        return new CANNON.Sphere(settings.radius)
    }
    makeHeightField(settings){
        //console.log(JSON.stringify(settings.heightfield.matrix));
        return new CANNON.Heightfield(settings.heightfield.matrix, {
            elementSize: settings.heightfield.elementSize
        });
    }
    makeConvexPolyhedronShape(settings){
        let vertices = new Array(settings.geometry.vertices.length);
        for (let i = 0; i < settings.geometry.vertices.length; i++) {
            vertices[i] = new CANNON.Vec3(settings.geometry.vertices[i].x, settings.geometry.vertices[i].y, settings.geometry.vertices[i].z);
        }
        return new CANNON.ConvexPolyhedron(vertices, settings.geometry.faces);
    }
    makeTrimeshShape(settings){
        let indices = Object.keys(settings.geometry.vertices).map(Number);
        return new CANNON.Trimesh(settings.geometry.vertices, indices);
    }
}