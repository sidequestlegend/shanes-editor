export class BehaviourHelper{

    constructor(scene_graph){
        // TODO: This is just a transplant of the old behaviour helper. Some behaviours depend on these methods so i
        // TODO: need to be careful not to break anything. This is not functional and needs to be re-implemented.
        this.scene_graph = scene_graph;
        this.store = {
            _cannon:{
                bodies:[],
                meshes:[]
            },
            _peers:{}
        };
    }
    findByUUID(uuids,is_json,parent){
        var results = {},
            _this = this;
        if(typeof uuids === "string"){
            uuids = [uuids];
        }
        (parent||this.scene_graph.container).traverse(function(child){
            if(child.userData.plusspace){
                if(uuids.indexOf(child.userData.plusspace.object.uuid) > -1){
                    results[child.userData.plusspace.object.uuid] = is_json?JSON.stringify(_this.scene_graph.serialiseScene(child)):child;
                }
            }
        });
        return results;
    }
    setupNetworking(){
        var _this =this;
        this.scene_graph.context.socket.on('new-user',function(user){
            _this.store._peers[user.userId] = user;
        });
        this.scene_graph.context.socket.on('all-users',function(users){
            var me = users.filter(function(u){return u.userId===_this.scene_graph.context.user.userId});
            if(me.length){
                users.filter(function(u){return u.userId!==_this.scene_graph.context.user.userId&&u.connect_time<me[0].connect_time}).forEach(function(u){
                    _this.store._peers[u.userId] = u;
                    if(!_this.store._peers[u.userId].peer){
                        _this.addPeer({userId:u.userId},true,_this.network_callback||function(){});
                    }
                });
            }
        });
        this.scene_graph.context.socket.emit('all-users');
        this.scene_graph.context.socket.on('remove-user',function(user){
            delete _this.store._peers[user.userId];
        });
        this.scene_graph.context.socket.on('signal',function(data){
            if(!_this.store._peers[data.userId]||!_this.store._peers[data.userId].peer){
                _this.store._peers[data.userId] = {userId:data.userId};
                _this.addPeer({userId:data.userId},false,_this.network_callback||function(){});
            }
            _this.store._peers[data.userId].peer.signal(data.signal);
        });
    }
    addPeer(user,initiator,callback){
        var _this = this;
        if(user.userId===this.scene_graph.context.user.userId)return;
        if(Object.keys(this.store._peers).filter(function(k){return !!_this.store._peers[k];}).length>11)console.warn('Maximum stream count of 12 achieved. Ignoring further requests.')
        var local_peer = new SimplePeer({ initiator: initiator,  channelName: this.scene_graph.context.space.sid,
            reconnectTimer: 500,
        });
        local_peer.on('signal',function(data){
            _this.scene_graph.context.socket.emit('signal',{signal:data,userId:user.userId});
        });
        _this.store._peers[user.userId].peer = local_peer;
        local_peer.on('connect', function () {
            console.log('Shane\'s Editor: Network peer connection opened - ',user.userId);
            local_peer.on('close', function () {
                delete _this.store._peers[user.userId];
            });
            local_peer.on('data', function (data) {
                try{
                    callback({userId:user.userId,data:new TextDecoder("utf-8").decode(data)})
                }catch(e){

                }
            });
        });
        local_peer.on('error', function (err) {
            console.warn(err);
            delete _this.store._peers[user.userId];
        });
    }
    getPeers(){
        return Object.keys(this.store._peers);
    }
    sendToAll(msg){
        var _this = this;
        Object.keys(this.store._peers).forEach(function(k){
            if(!_this.store._peers[k].peer||!_this.store._peers[k].peer.connected){
                //console.log('user '+k+' is not connected.');
            }else{
                if(_this.store._peers[k].peer.connected)_this.store._peers[k].peer.send(msg);
            }
        });
    }
    sendTo(userId,msg){
        if(this.store._peers[userId]&&this.store._peers[userId].peer)this.store._peers[userId].peer.send(msg);
    }
    onMessage(callback){
        this.network_callback = callback;
    }
    getSceneGraph(){
        return this.scene_graph;
    }
    loadJS(url){
        var _this = this;
        this.external_scripts = this.external_scripts||[];
        if(this.external_scripts.map(function(d){return d.url+d.loaded}).indexOf(url+"true")>-1)return Promise.resolve();
        var script_index = this.external_scripts.map(function(d){return d.url}).indexOf(url);
        if(script_index>-1){
            return new Promise(function(resolve){
                _this.external_scripts[script_index].callbacks.push(resolve);
            });
        }
        var script_object = {url:url,loaded:false,callbacks:[]};
        this.external_scripts.push(script_object);
        return new Promise(function(resolve){
            var scriptTag = document.createElement('script');
            scriptTag.src = url;
            scriptTag.onload = function(){
                script_object.loaded = true;
                resolve();
                script_object.callbacks.forEach(function(r){r();});
            };
            scriptTag.onreadystatechange = function(){
                script_object.loaded = true;
                resolve();
                script_object.callbacks.forEach(function(r){r();});
            };
            document.body.appendChild(scriptTag);
        });
    }
    portalUser(position){
        var _this = this;
        var is_space_id = typeof position === "string";
        if(_this.scene_graph.context.user&&!this.not_to_move){
            this.not_to_move = true;
            if(!this.plusspaceTargetEntity){
                this.plusspaceTargetEntity = new THREE.Object3D();
                this.scene_graph.context.simulation.scene.add(this.plusspaceTargetEntity);
                this.plusspaceTargetTrigger = new THREE.Object3D();
                this.scene_graph.context.simulation.scene.add(this.plusspaceTargetTrigger);
                this.plusspacePortal = new altspaceutil.behaviors.NativeComponent('n-portal',is_space_id?{targetSpace: position}:{},is_space_id?{}:{targetEntity: this.plusspaceTargetEntity});
                this.plusspaceAttach = new altspaceutil.behaviors.NativeComponent('n-skeleton-parent',{
                    index: 0,
                    part:'eye',
                    side:'left',
                    userId:_this.scene_graph.context.user.userId,
                });
                this.plusspaceTargetTrigger.addBehaviors(this.plusspacePortal,this.plusspaceAttach);
                this.plusspaceTargetTrigger.scale.set(0.00001,1,0.00001);
                this.plusspaceTargetTrigger.position.set(0,-1000,0);
            }
            if(!is_space_id){
                this.plusspaceTargetEntity.position.set(position.x,position.y,position.z);
                this.plusspacePortal.data.targetPosition = this.plusspaceTargetEntity.position;
            }
            this.plusspaceTargetTrigger.position.set(0,0,0);
            return new Promise(function(resolve){
                setTimeout(function(){
                    _this.plusspaceTargetTrigger.position.set(0,-1000,0);
                    _this.not_to_move = false;
                    resolve();
                },2000);
            });
        }else{
            return Promise.reject('not_to_move');
        }
    }
    getCannonWorld(){
        if(!this.cannonWorld){
            this.cannonWorld = new CANNON.World();
        }
        return this.cannonWorld;
    }
    getPortalSocket(){
        return this.scene_graph.context.portal_socket
    }
    bakeLight(object){
        return this.scene_graph.lighting.bakeVertexLighting(object,this.scene_graph.light)
    }
    resetCannonWorld(object3d){
        if(this.cannonWorld){
            var num = this.store._cannon.meshes.length;
            for(var i=0; i<num; i++){
                this.cannonWorld.remove(this.store._cannon.bodies.pop());
                var mesh = this.store._cannon.meshes.pop();
                object3d.remove(mesh);
            }
        }
    }
    addCannonMesh(body,color,parent,should_hide) {
        this.cannonBodyAxisSwap(body);
        var obj = new THREE.Object3D();
        parent.add(obj);
        var currentMaterial = new THREE.MeshBasicMaterial(should_hide?{visible:false}:{side:THREE.DoubleSide,color: color,map:new THREE.TextureLoader().load('https://cdn.theexpanse.app/images/display_texture.png')});
        for (var l = 0; l < body.shapes.length; l++) {
            var shape = body.shapes[l];
            var mesh;
            switch (shape.type) {
                case CANNON.Shape.types.SPHERE:
                    var sphere_geometry = new THREE.SphereGeometry(shape.radius, 16, 16);
                    mesh = new THREE.Mesh(sphere_geometry, currentMaterial);
                    break;

                case CANNON.Shape.types.PARTICLE:
                    mesh = new THREE.Mesh(this.particleGeo, particleMaterial);
                    var s = this.settings;
                    mesh.scale.set(s.particleSize, s.particleSize, s.particleSize);
                    break;

                case CANNON.Shape.types.PLANE:
                    var geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
                    mesh = new THREE.Object3D();
                    var submesh = new THREE.Object3D();
                    var ground = new THREE.Mesh(geometry, currentMaterial);
                    ground.scale.set(100, 100, 100);
                    submesh.add(ground);

                    mesh.add(submesh);
                    break;

                case CANNON.Shape.types.BOX:
                    var box_geometry = new THREE.BoxGeometry(shape.halfExtents.x * 2,
                        shape.halfExtents.y * 2,
                        shape.halfExtents.z * 2);
                    mesh = new THREE.Mesh(box_geometry, currentMaterial);
                    break;

                case CANNON.Shape.types.CONVEXPOLYHEDRON:
                    var geo = new THREE.Geometry();

                    // Add vertices
                    for (var i = 0; i < shape.vertices.length; i++) {
                        var v = shape.vertices[i];
                        geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
                    }

                    for (var i = 0; i < shape.faces.length; i++) {
                        var face = shape.faces[i];

                        // add triangles
                        var a = face[0];
                        for (var j = 1; j < face.length - 1; j++) {
                            var b = face[j];
                            var c = face[j + 1];
                            geo.faces.push(new THREE.Face3(a, b, c));
                        }
                    }
                    geo.computeBoundingSphere();
                    geo.computeVertexNormals();
                    geo.computeFaceNormals();
                    mesh = new THREE.Mesh(geo, currentMaterial);
                    break;

                case CANNON.Shape.types.HEIGHTFIELD:
                    var geometry = new THREE.Geometry();

                    var v0 = new CANNON.Vec3();
                    var v1 = new CANNON.Vec3();
                    var v2 = new CANNON.Vec3();
                    for (var xi = 0; xi < shape.data.length - 1; xi++) {
                        for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
                            for (var k = 0; k < 2; k++) {
                                shape.getConvexTrianglePillar(xi, yi, k === 0);
                                v0.copy(shape.pillarConvex.vertices[0]);
                                v1.copy(shape.pillarConvex.vertices[1]);
                                v2.copy(shape.pillarConvex.vertices[2]);
                                v0.vadd(shape.pillarOffset, v0);
                                v1.vadd(shape.pillarOffset, v1);
                                v2.vadd(shape.pillarOffset, v2);
                                geometry.vertices.push(
                                    new THREE.Vector3(v0.x, v0.y, v0.z),
                                    new THREE.Vector3(v1.x, v1.y, v1.z),
                                    new THREE.Vector3(v2.x, v2.y, v2.z)
                                );
                                var i = geometry.vertices.length - 3;
                                geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
                            }
                        }
                    }
                    geometry.computeBoundingSphere();
                    geometry.computeFaceNormals();
                    geometry.computeVertexNormals();
                    mesh = new THREE.Mesh(geometry, currentMaterial);
                    break;
                case CANNON.Shape.types.TRIMESH:
                    var geometry = new THREE.Geometry();
                    var v0 = new CANNON.Vec3();
                    var v1 = new CANNON.Vec3();
                    var v2 = new CANNON.Vec3();
                    for (var i = 0; i < shape.indices.length / 3; i++) {
                        shape.getTriangleVertices(i, v0, v1, v2);
                        geometry.vertices.push(
                            new THREE.Vector3(v0.x, v0.y, v0.z),
                            new THREE.Vector3(v1.x, v1.y, v1.z),
                            new THREE.Vector3(v2.x, v2.y, v2.z)
                        );
                        var j = geometry.vertices.length - 3;
                        geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
                    }
                    geometry.computeBoundingSphere();
                    geometry.computeFaceNormals();
                    geometry.computeVertexNormals();
                    mesh = new THREE.Mesh(geometry, currentMaterial);
                    break;

                default:
                    throw "Visual type not recognized: " + shape.type;
            }

            var o = body.shapeOffsets[l];
            var q = body.shapeOrientations[l];
            mesh.position.set(o.x, o.y, o.z);
            mesh.quaternion.set(q.x, q.y, q.z, q.w);
            obj.add(mesh);
            //this.bakeLight(mesh);
        }
        this.store._cannon.bodies.push(body);
        this.store._cannon.meshes.push(obj);
        return obj;
    }
    cannonBodyAxisSwap(body){
        //body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
    }
    updateCannonPhysics(){
        if(this.cannonWorld){

            var timeStep = 1 / 90;

            var now = Date.now() / 1000;

            if(!this.lastCallTime){
                // last call time not saved, cant guess elapsed time. Take a simple step.
                this.cannonWorld.step(timeStep);
                this.lastCallTime = now;
                return;
            }

            var timeSinceLastCall = now - this.lastCallTime;

            this.cannonWorld.step(timeStep, timeSinceLastCall, 3);

            this.lastCallTime = now;
        }
        var N = this.store._cannon.bodies.length;

        // Read position data into visuals
        for(var i=0; i<N; i++){
            var b = this.store._cannon.bodies[i], visual = this.store._cannon.meshes[i];
            visual.position.copy(b.position);
            if(b.quaternion){
                visual.quaternion.copy(b.quaternion);
            }
        }
    }
}

var BehaviourHelpers = function(scene_graph){
    this.scene_graph = scene_graph;
};
BehaviourHelpers.prototype = {
    store:{
        _cannon:{
            bodies:[],
            meshes:[]
        },
        _peers:{}
    },

};