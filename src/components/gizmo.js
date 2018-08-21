/* global AFRAME,TWEEN,THREE */
/**
 * The transform gizmos for adjusting objects on all three axis.
 * @namespace expanse-editor
 * @component gizmo
 * @author Shane Harris
 */

module.exports = AFRAME.registerComponent('gizmo', {
    schema:{
        raycasterEl:{type:'selector'},
        cameraEl:{type:'selector'},
        displayEl:{type:'selector'},
        mode:{default:'position'}
    },
    init(){
        this.setupElements();
        this.setMode();

        this.currentTransform = {
            position:new THREE.Vector3(),
            rotation:new THREE.Vector3(),
            scale:new THREE.Vector3(),
        };
    },
    updateSchema(){
        if(this.top_box&&!this.isAnimating){
            this.toggle(true)
                .then(()=>this.setMode())
                .then(()=>this.toggle());
        }
    },
    setObject(object,boundingBox){
        if(!object){
            return new TWEEN.Tween(this.el.getAttribute('scale'))
                .to(new THREE.Vector3(0.00001,0.00001,0.00001), 250)
                .easing(TWEEN.Easing.Exponential.Out).start();
        }
        new TWEEN.Tween(this.el.getAttribute('scale'))
            .to(new THREE.Vector3(1,1,1), 250)
            .easing(TWEEN.Easing.Exponential.Out).start();
        this.boundingBox = boundingBox;
        let size = boundingBox.getSize();
        let position = object.parent.localToWorld(object.position.clone());
        this.el.setAttribute('position',position);
        this.el.setAttribute('position',{x:position.x-(0.12+size.x/2),y:position.y,z:position.z-(0.12+size.z/2)});

        let current = this.el.sceneEl.context.currentObject;
        this.currentTransform.position = new THREE.Vector3().copy(current.settings.transform.position);
        this.currentTransform.rotation = new THREE.Vector3().copy(current.settings.transform.rotation);
        this.currentTransform.scale = new THREE.Vector3().copy(current.settings.transform.scale);
    },
    toggle(isClose){
        return new Promise(resolve=>{
            this.isAnimating = true;
            let scale = isClose?0.00001:1;
            new TWEEN.Tween(this.el.getAttribute('scale'))
                .to(new THREE.Vector3(scale,scale,scale), 250)
                .onComplete(()=>{
                    this.isAnimating = false;
                    resolve();
                })
                .easing(TWEEN.Easing.Exponential.Out).start();
        });
    },
    play(){
        this.mousedown = e=>this.onMouseDown(e);
        this.mousemove = e=>this.onMouseMove(e);
        this.mouseup = e=>this.onMouseUp(e);
        this.addListeners(this.top_box);
        this.addListeners(this.x_box);
        this.addListeners(this.y_box);
        this.addListeners(this.z_box);
    },
    pause(){
        this.removeListeners(this.top_box);
        this.removeListeners(this.x_box);
        this.removeListeners(this.y_box);
        this.removeListeners(this.z_box);
    },
    addListeners(el){
        el.addEventListener('mousedown',this.mousedown);
        el.addEventListener('mouseup',this.mouseup);
    },
    removeListeners(el){
        el.removeEventListener('mousedown',this.mousedown);
        el.removeEventListener('mouseup',this.mouseup);
    },
    getDraggingSpine(){
        let spine,axis,offset;
        if(this.dragging===this.x_box){
            spine = this.x_spine;
            axis = 'x';
            offset = new THREE.Vector3(-0.5,0,0);
        }else if(this.dragging===this.y_box){
            spine = this.y_spine;
            axis = 'y';
            offset = new THREE.Vector3(0,-0.5,0);
        }else if(this.dragging===this.z_box){
            spine = this.z_spine;
            axis = 'z';
            offset = new THREE.Vector3(0,0,-0.5);
        }else if(this.dragging===this.top_box){
            spine = this.top_spine;
            axis = 'top';
            offset = new THREE.Vector3(0,-0.7,0);
        }
        return {spine:spine,axis:axis,offset:offset};
    },
    onMouseUp(e){
        if(this.dragging){
            this.dragging.setAttribute('position',this.defaultPosition);
            let spine = this.getDraggingSpine();
            spine.spine.object3D.scale.z = spine.axis==='top'?0.71:0.51;
            this.setMode();
            this.backing_element.setAttribute('scale','0.001 0.001 0.001');
            this.backing_element.className = '';
            this.backing_element.removeEventListener('ui-mousemove',this.mousemove);
            this.el.sceneEl.context.currentObject.settings.transform = this.deepCopy(this.currentTransform);
            this.el.sceneEl.emit('transform-update');
            this.data.displayEl.components["display-box"].setObject(this.el.sceneEl.context.currentObject.object3D);
            delete this.dragging;
        }
    },
    setSpinePosition(pos,spine){
        let zero = new THREE.Vector3(0,0,0);
        let _spine = this.getDraggingSpine();
        spine = spine||_spine.spine;
        spine.setAttribute('position',this.getPointInBetweenByPerc(pos,zero));
        let scale = pos.distanceTo(zero);
        _spine.scale = scale;
        _spine.angle = Math.atan2(pos.y,pos.x);
        spine.object3D.scale.z = scale;
        spine.object3D.lookAt(pos);
        return _spine;
    },
    setBoxRotation(pos,axis){
        if(this.data.mode==="rotation"){
            switch(axis){
                case "x":
                    this[axis+'_box'].object3D.rotation.z = Math.atan2(pos.y,pos.x);
                    break;
                case "y":
                    this[axis+'_box'].object3D.rotation.y = Math.atan2(pos.x,pos.z);
                    break;
                case "z":
                    this[axis+'_box'].object3D.rotation.x = -Math.atan2(pos.y,pos.z);
                    break;
            }
        }
    },
    onMouseMove(e){
        if(this.dragging){
            let pos = this.el.object3D
                .worldToLocal(e.x?e:e.detail.intersection.point);
            this.dragging.setAttribute('position',pos);
            let spine = this.setSpinePosition(pos);
            this.setBoxRotation(pos,spine.axis);
            this.updateObject(pos,spine);
        }
    },
    updateObject(pos,spine){
        let current = this.el.sceneEl.context.currentObject;
        if(this.data.mode==="position"){
            let newPosition = pos.clone()
                .add(this.saveCurrentTransform.position)
                .add(spine.offset);
            switch(spine.axis){
                case "x":
                    this.currentTransform.position.x = newPosition.x;
                    break;
                case "y":
                    this.currentTransform.position.y = newPosition.y;
                     break;
                case "z":
                    this.currentTransform.position.z = newPosition.z;
                    break;
                case "top":
                    this.currentTransform.position.copy(newPosition);
                    break;
            }
            current.object3D.position.copy(this.currentTransform.position);
        }else if(this.data.mode==="rotation"){
            let rotation = new THREE.Vector3();
            switch(spine.axis){
                case "x":
                    rotation.z = Math.atan2(pos.y,pos.x)-1;
                    break;
                case "y":
                    rotation.y = Math.atan2(pos.x,pos.z)-Math.PI*1.25;
                    break;
                case "z":
                    rotation.x = -Math.atan2(pos.y,pos.z)+1;
                    break;
            }
            let _rotation = this.getRotation(rotation);
            this.currentTransform.rotation = _rotation.vector;
            current.object3D.rotation.copy(_rotation.euler);
        }else if(this.data.mode==="scale"){
            let scale = ((spine.scale/(this.dragging===this.top_box?0.7:0.5))-1)*2;
            let newScale = new THREE.Vector3(scale,scale,scale)
                .add(this.saveCurrentTransform.scale);
            switch(spine.axis){
                case "x":
                    this.currentTransform.scale.x = newScale.x;
                    break;
                case "y":
                    this.currentTransform.scale.y = newScale.y;
                    break;
                case "z":
                    this.currentTransform.scale.z = newScale.z;
                    break;
                case "top":
                    this.currentTransform.scale.copy(newScale);
                    break;
            }
            current.object3D.scale.copy(this.currentTransform.scale);
        }
    },
    matrixFromEuler:function(euler){
        return new THREE.Matrix4().makeRotationFromEuler(euler)
    },
    getRotation:function(vector){
        let current_matrix = this.matrixFromEuler(
            new THREE.Euler(this.saveCurrentTransform.rotation.x,this.saveCurrentTransform.rotation.y,this.saveCurrentTransform.rotation.z)
        );
        let start_euler = new THREE.Euler().setFromVector3(vector);
        let new_matrix = current_matrix.premultiply(this.matrixFromEuler(start_euler));
        let eular = new THREE.Euler().setFromRotationMatrix(new_matrix);
        return {
            euler:eular,
            vector:new THREE.Vector3(eular.x,eular.y,eular.z)
        };
    },
    getPointInBetweenByPerc(pointA, pointB, percentage) {
        let dir = pointB.clone().sub(pointA).normalize().multiplyScalar(pointA.distanceTo(pointB)*(percentage||0.5));
        return pointA.clone().add(dir);
    },
    getPointOnCircle(angle,axis,radius){
        let output = new THREE.Vector3();
        switch(axis){
            case "x":
                output.x = Math.cos(angle) * radius;
                output.y = Math.sin(angle) * radius;
                output.z = 0;
                break;
            case "y":
                output.x = Math.sin(angle) * radius;
                output.y = 0;
                output.z = Math.cos(angle) * radius;
                break;
            case "z":
                output.z = Math.cos(angle) * radius;
                output.y = Math.sin(angle) * radius;
                output.x = 0;
                break;
        }
        return output;
    },
    onMouseDown(e){
        if([this.top_box,this.x_box,this.y_box,this.z_box].indexOf(e.target)===-1)return;
        this.dragging = e.target;
        this.backing_element.className = 'intersect';
        this.backing_element.setAttribute('scale','1000 1000 1000');
        this.defaultPosition = e.target.getAttribute('position').clone();
        this.backing_element.setAttribute('position',this.defaultPosition);
        this.backing_element.addEventListener('ui-mousemove',this.mousemove);
        this.backing_element.object3D.lookAt(
            this.backing_element.object3D.parent
                .worldToLocal(this.data.cameraEl.object3D.getWorldPosition())
        );
        this.saveCurrentTransform = this.deepCopy(this.el.sceneEl.context.currentObject.settings.transform);
        this.currentTransform.position.copy(this.saveCurrentTransform.position);
        this.currentTransform.scale.copy(this.saveCurrentTransform.scale);
        this.currentTransform.rotation.copy(this.saveCurrentTransform.rotation);
    },
    deepCopy(object){
        return JSON.parse(JSON.stringify(object))
    },
    setupElements(){
        this.backing_element = document.createElement('a-plane');
        this.backing_element.setAttribute('scale','0.001 0.001 0.001');
        this.backing_element.setAttribute('side','double');
        this.backing_element.setAttribute('visible',false);
        this.el.appendChild(this.backing_element);

        this.top_box = this.createElement('0.1 0.1 0.1',false,true);
        this.top_box.setAttribute('position','0 0.7 0');
        this.x_box = this.createElement('0.1 0.1 0.1',"blue",true);
        this.y_box = this.createElement('0.1 0.1 0.1',"green",true);
        this.z_box = this.createElement('0.1 0.1 0.1',"red",true);


        this.top_spine = this.createElement('0.005 0.005 0.71',"#cfcfcf");
        this.top_spine.setAttribute('position','0 0.355 0');

        this.x_spine = this.createElement('0.01 0.01 0.509','blue');
        this.y_spine = this.createElement('0.01 0.01 0.509','green');
        this.z_spine = this.createElement('0.01 0.01 0.509','red');
        this.x_rail = this.createRail('0 0 0','blue');
        this.y_rail = this.createRail('-90 0 0','green');
        this.z_rail = this.createRail('0 90 0','red');

    },
    setMode(){
        this.setImage(this.data.mode);
        if(this.data.mode==='rotation'){
            this.rot_x_pos = this.getPointOnCircle(1,'x',0.475);
            this.rot_y_pos = this.getPointOnCircle(Math.PI*1.25,'y',0.475);
            this.rot_z_pos = this.getPointOnCircle(1,'z',0.475);
            this.top_box.setAttribute('visible',false);
            this.top_spine.setAttribute('visible',false);
            this.x_rail.setAttribute('visible',true);
            this.y_rail.setAttribute('visible',true);
            this.z_rail.setAttribute('visible',true);

            this.x_box.object3D.rotation.z = 1;
            this.y_box.object3D.rotation.y = (Math.PI*1.25);
            this.z_box.object3D.rotation.x = -1;
        }else{

            this.x_box.object3D.rotation.z = 0;
            this.y_box.object3D.rotation.y = 0;
            this.z_box.object3D.rotation.x = 0;
            this.top_box.setAttribute('visible',true);
            this.top_spine.setAttribute('visible',true);
            this.x_rail.setAttribute('visible',false);
            this.y_rail.setAttribute('visible',false);
            this.z_rail.setAttribute('visible',false);

            this.top_spine.setAttribute('rotation','90 0 0');
            this.top_spine.setAttribute('position','0 0.355 0');
        }

        this.x_box.setAttribute('position',this.data.mode==='rotation'?this.rot_x_pos:'0.5 0 0');
        this.x_box.setAttribute('position',this.data.mode==='rotation'?this.rot_x_pos:'0.5 0 0');
        this.y_box.setAttribute('position',this.data.mode==='rotation'?this.rot_y_pos:'0 0.5 0');
        this.z_box.setAttribute('position',this.data.mode==='rotation'?this.rot_z_pos:'0 0 0.5');
        setTimeout(()=>{
            this.setSpinePosition(this.top_box.getAttribute('position'),this.top_spine);
            this.setSpinePosition(this.x_box.getAttribute('position'),this.x_spine);
            this.setSpinePosition(this.y_box.getAttribute('position'),this.y_spine);
            this.setSpinePosition(this.z_box.getAttribute('position'),this.z_spine);
        });
    },
    setImage(mode){
        this.top_box.setAttribute('src','images/gizmos/'+mode+'_top.jpg');
        this.x_box.setAttribute('src','images/gizmos/'+mode+'_top.jpg');
        this.y_box.setAttribute('src','images/gizmos/'+mode+'_top.jpg');
        this.z_box.setAttribute('src','images/gizmos/'+mode+'_top.jpg');
    },
    createRail(rotation,color){
        let rail = document.createElement('a-ring');
        rail.setAttribute('radius-inner',0.45);
        rail.setAttribute('radius-outer',0.5);
        rail.setAttribute('segments-theta',36);
        rail.setAttribute('theta-length',color==="green"?270:360);
        rail.setAttribute('rotation',rotation);
        rail.setAttribute('side','double');
        rail.setAttribute('color',color);
        this.el.appendChild(rail);
        return rail;
    },
    createElement(scale,color,intersectable){
        let element = document.createElement('a-box');
        element.setAttribute('scale',scale);
        if(intersectable){
            element.className = 'intersect';
        }
        if(color)element.setAttribute('color',color);
        this.el.appendChild(element);
        return element;
    }
});