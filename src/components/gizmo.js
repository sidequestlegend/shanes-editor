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
        this.el.addEventListener('loaded',()=>{
            this.setupElements();
            this.setMode();
        });
        // Seed the empty transform values
        this.currentTransform = {
            position:new THREE.Vector3(),
            rotation:new THREE.Vector3(),
            scale:new THREE.Vector3(),
        };
        this.el.switchMode = this.switchMode.bind(this);

    },
    switchMode(){
        // Set the mode with the mode attribute is updated on the gizmo element.
        if(this.top_box&&!this.isAnimating){
            this.toggle(true)
                .then(()=>this.setMode())
                .then(()=>this.toggle());
        }
    },
    setObject(object,boundingBox){
        if(!object){
            // Close the gizmos if the object in falsy
            return new TWEEN.Tween(this.el.getAttribute('scale'))
                .to(new THREE.Vector3(0.00001,0.00001,0.00001), 250)
                .easing(TWEEN.Easing.Exponential.Out).start();
        }
        // Scale the gizmo container up to full size.
        new TWEEN.Tween(this.el.getAttribute('scale'))
            .to(new THREE.Vector3(1,1,1), 250)
            .easing(TWEEN.Easing.Exponential.Out).start();
        // Get gizmo position from  the bounding box - move it to the corner.
        this.boundingBox = boundingBox;
        let size = new THREE.Vector3();
        boundingBox.getSize(size);
        let position = object.parent.localToWorld(object.position.clone());
        this.el.setAttribute('position',position);
        this.el.setAttribute('position',{x:position.x-(0.12+size.x/2),y:position.y,z:position.z-(0.12+size.z/2)});
        // Set the current transform settings from the selected object.
        let current = this.el.sceneEl.context.currentObject;
        this.currentTransform.position = new THREE.Vector3().copy(current.settings.transform.position);
        this.currentTransform.rotation = new THREE.Vector3().copy(current.settings.transform.rotation);
        this.currentTransform.scale = new THREE.Vector3().copy(current.settings.transform.scale);
    },
    toggle(isClose){
        // Close open the gizmos to swap between modes.
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
        // Register event listeners.
        this.mousedown = e=>this.onMouseDown(e);
        this.mousemove = e=>this.onMouseMove(e);
        this.mouseup = e=>this.onMouseUp(e);
        this.addListeners(this.top_box);
        this.addListeners(this.x_box);
        this.addListeners(this.y_box);
        this.addListeners(this.z_box);
        // Register mouseup on scene incase the cursor ray is not on the box with released.
        this.el.sceneEl.addEventListener('mouseup',this.mouseup);
    },
    pause(){
        // Remove event listeners
        this.removeListeners(this.top_box);
        this.removeListeners(this.x_box);
        this.removeListeners(this.y_box);
        this.removeListeners(this.z_box);
        this.el.sceneEl.removeEventListener('mouseup',this.mouseup);
    },
    addListeners(el){
        el.addEventListener('mousedown',this.mousedown);
    },
    removeListeners(el){
        el.removeEventListener('mousedown',this.mousedown);
    },
    getDraggingSpine(){
        // Get the current spine to update when the associated box is being dragged.
        // Return the spine, axis and the initial offset position of the gizmo box.
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
        return {spine,axis,offset};
    },
    onMouseUp(e){
        if(this.dragging){
            // Reset the current box being dragged.
            this.dragging.setAttribute('position',this.defaultPosition);
            //let spine = this.getDraggingSpine();
            //spine.spine.object3D.scale.z = spine.axis==='top'?0.71:0.51;
            // Reset the gizmo state
            this.setMode();
            // Remove click catcher and remove intersect class to prevent clicks when not interacting.
            this.backing_element.setAttribute('scale','0.001 0.001 0.001');
            this.backing_element.className = '';
            // Remove mousemove listener
            this.backing_element.removeEventListener('ui-mousemove',this.mousemove);
            // Copy the new transform to the current object settings
            this.el.sceneEl.context.currentObject.settings.transform = this.deepCopy(this.currentTransform);
            // Emit the transform update event to trigger updates to the values on the UI panel
            this.el.sceneEl.emit('transform-update');
            // Set the display box to the new object transform
            // TODO: move this out of here.
            this.data.displayEl.components["display-box"].setObject(this.el.sceneEl.context.currentObject.object3D);
            // All done. Delete the ref to the current dragging object.
            delete this.dragging;
            this.el.emit('stop-gizmo');
        }
    },
    setSpinePosition(pos,spine){
        // Update the spine position while dragging.
        //let zero = new THREE.Vector3(0,0,0);
        let _spine = this.getDraggingSpine();
        spine = spine||_spine.spine;

        spine.geometry.verticesNeedUpdate = true;

        // Get the mid point between the dragging position and the origin point (0,0,0)
        // spine.setAttribute('position',this.getPointInBetweenByPerc(pos,zero));
        // // Scale the spine to connect the dragging box to the zero point
        // let scale = pos.distanceTo(zero);
        // //spine.getObject3D('mesh').geometry.translate(0,0,scale/2)
        // _spine.scale = scale;
         _spine.angle = Math.atan2(pos.y,pos.x);
        // spine.object3D.scale.z = scale;
        // // Rotate the spine by making it look at the dragging position.
        // spine.object3D.lookAt(pos);
        return _spine;
    },
    setBoxRotation(pos,axis){
        // Rotate the dragging box when in the rotate mode
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
            // Update the gizmos when being dragged.
            let pos = this.el.object3D
                .worldToLocal(e.x?e:e.detail.intersection.point);
            this.dragging.setAttribute('position',pos);
            let spine = this.setSpinePosition(pos);
            this.setBoxRotation(pos,spine.axis);
            this.updateObject(pos,spine);
        }
    },
    updateObject(pos,spine){
        // Update the transform settings depending on the current mode.
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
            // Copy the position to the object for a realtime preview.
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
            // Copy the rotation to the object for a realtime preview.
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
            // Copy the scale to the object for a realtime preview.
            current.object3D.scale.copy(this.currentTransform.scale);
        }
    },
    matrixFromEuler:function(euler){
        // Convert Euler angle to matrix.
        return new THREE.Matrix4().makeRotationFromEuler(euler)
    },
    getRotation:function(vector){
        // Get the current matrix transform from the original rotation.
        // This method allows for relative rotations against the current rotation.
        // This means that the gizmos work differently to updating teh rotation on the UI panel.
        // E.g. if you rotate on one axis, then next rotation will rotate the object as if its rotation is still 0.
        // This gives a much more intuitive rotation experience.
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
        // Get a point between two points - pretty self explanatory!
        let dir = pointB.clone().sub(pointA).normalize().multiplyScalar(pointA.distanceTo(pointB)*(percentage||0.5));
        return pointA.clone().add(dir);
    },
    getPointOnCircle(angle,axis,radius){
        // Get a point on a circle - used for the rotation gizmo box positions and for updating
        // their rotation while being dragged.
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
        this.el.emit('start-gizmo');
        // Set the current dragging box
        this.dragging = e.target;
        // Add the intersect class to the backing element for capturing mouse moves.
        this.backing_element.className = 'intersect';
        // Scale the backing to an enormous size to catch mouse events to very far away.
        this.backing_element.setAttribute('scale','1000 1000 1000');
        // Store the default position of the current gizmo box
        // TODO: i should sotre these as constants as they dont change.
        this.defaultPosition = e.target.getAttribute('position').clone();
        // Move the backing element to the current position to being capturing mouse events
        this.backing_element.setAttribute('position',this.defaultPosition);
        // Register the mouse move listener
        this.backing_element.addEventListener('ui-mousemove',this.mousemove);
        let pos = new THREE.Vector3();
        this.data.cameraEl.object3D.getWorldPosition(pos);
        // Make the backing elemtn face the camera for mouse moves relative to your current position.
        this.backing_element.object3D.lookAt(
            this.backing_element.object3D.parent
                .worldToLocal(pos)
        );
        // Save the current transform to use as an offset.
        this.saveCurrentTransform = this.deepCopy(this.el.sceneEl.context.currentObject.settings.transform);
        // Seed the current transform to be updated as we drag.
        this.currentTransform.position.copy(this.saveCurrentTransform.position);
        this.currentTransform.scale.copy(this.saveCurrentTransform.scale);
        this.currentTransform.rotation.copy(this.saveCurrentTransform.rotation);
    },
    deepCopy(object){
        // Deep copy lol
        return JSON.parse(JSON.stringify(object))
    },
    setupElements(){
        // Create an invisible backing plane for capturing mouse events relative to the current
        // dragging box position while moving
        this.backing_element = document.createElement('a-plane');
        this.backing_element.setAttribute('scale','0.001 0.001 0.001');
        this.backing_element.setAttribute('side','double');
        this.backing_element.setAttribute('visible',false);
        this.el.appendChild(this.backing_element);
        // Setup intractable dragging boxes.
        // The top box is used to adjust all axis at once.
        this.top_box = this.createElement('0.1 0.1 0.1',false,true);
        this.top_box.setAttribute('position','0 0.7 0');
        this.x_box = this.createElement('0.1 0.1 0.1',"blue",true);
        this.y_box = this.createElement('0.1 0.1 0.1',"green",true);
        this.z_box = this.createElement('0.1 0.1 0.1',"red",true);

        // Create the box spines
        this.top_spine = this.createSpine("#cfcfcf",this.top_box.getAttribute('position'));//this.createElement('0.005 0.005 0.71',"#cfcfcf");
        //this.top_spine.setAttribute('position','0 0.355 0');

        this.x_spine = this.createSpine("#0000ff",this.x_box.getAttribute('position'));//this.createElement('0.01 0.01 0.509','blue');
        this.y_spine = this.createSpine("#00ff00",this.y_box.getAttribute('position'));//this.createElement('0.01 0.01 0.509','green');
        this.z_spine = this.createSpine("#ff0000",this.z_box.getAttribute('position'));//this.createElement('0.01 0.01 0.509','red');

        // Create the rotation rails.
        this.x_rail = this.createRail('0 0 0','blue');
        this.y_rail = this.createRail('-90 0 0','green');
        this.z_rail = this.createRail('0 90 0','red');

    },
    setMode(){
        console.log('here set mode');
        // Set the image on the intractable dragging boxes to match the mode
        this.setImage(this.data.mode);
        if(this.data.mode==='rotation'){
            // Hide the top box for rotation - cant adjust all axis at once with that - or at least we dont want to.
            this.rot_x_pos = this.getPointOnCircle(1,'x',0.475);
            this.rot_y_pos = this.getPointOnCircle(Math.PI*1.25,'y',0.475);
            this.rot_z_pos = this.getPointOnCircle(1,'z',0.475);
            this.top_box.setAttribute('visible',false);
           // this.top_spine.setAttribute('visible',false);
            this.x_rail.setAttribute('visible',true);
            this.y_rail.setAttribute('visible',true);
            this.z_rail.setAttribute('visible',true);

            this.x_box.object3D.rotation.z = 1;
            this.y_box.object3D.rotation.y = (Math.PI*1.25);
            this.z_box.object3D.rotation.x = -1;
        }else{
            // Reset the dragging box rotations if anything but rotation
            this.x_box.object3D.rotation.z = 0;
            this.y_box.object3D.rotation.y = 0;
            this.z_box.object3D.rotation.x = 0;
            // Show the top box for adjust all axis at once.
            this.top_box.setAttribute('visible',true);
           // this.top_spine.setAttribute('visible',true);
            // Hide the rotation rails.
            this.x_rail.setAttribute('visible',false);
            this.y_rail.setAttribute('visible',false);
            this.z_rail.setAttribute('visible',false);
            // Reset the top spine position and rotations.
           // this.top_spine.setAttribute('rotation','90 0 0');
           // this.top_spine.setAttribute('position','0 0.355 0');
        }
        // Set the default positions of the dragging boxes, the same for scale/position but different for rotation.
        this.x_box.setAttribute('position',this.data.mode==='rotation'?this.rot_x_pos:'0.5 0 0');
        this.x_box.setAttribute('position',this.data.mode==='rotation'?this.rot_x_pos:'0.5 0 0');
        this.y_box.setAttribute('position',this.data.mode==='rotation'?this.rot_y_pos:'0 0.5 0');
        this.z_box.setAttribute('position',this.data.mode==='rotation'?this.rot_z_pos:'0 0 0.5');
        setTimeout(()=>{
            // Set spine positions on next tick rather than updating matrix world.
            // Got some wierdnes of the initial positions being off center and this solved it nicely
            this.setSpinePosition(this.top_box.getAttribute('position'),this.top_spine);
            this.setSpinePosition(this.x_box.getAttribute('position'),this.x_spine);
            this.setSpinePosition(this.y_box.getAttribute('position'),this.y_spine);
            this.setSpinePosition(this.z_box.getAttribute('position'),this.z_spine);
        });
    },
    setImage(mode){
        // Set the image on the intractable dragging boxes to match the mode
        this.top_box.setAttribute('src','https://cdn.theexpanse.app/images/gizmos/'+mode+'_top.jpg');
        this.x_box.setAttribute('src','https://cdn.theexpanse.app/images/gizmos/'+mode+'_top.jpg');
        this.y_box.setAttribute('src','https://cdn.theexpanse.app/images/gizmos/'+mode+'_top.jpg');
        this.z_box.setAttribute('src','https://cdn.theexpanse.app/images/gizmos/'+mode+'_top.jpg');
    },
    createSpine(color,position){
        let lineGeom = new THREE.Geometry();
        lineGeom.vertices.push(new THREE.Vector3());
        lineGeom.vertices.push(position);
        let line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color}));
        this.el.object3D.add(line);
        return line;
    },
    createRail(rotation,color){
        // Create a partial/full ring for the rail indicator for rotations.
        let rail = document.createElement('a-ring');
        rail.setAttribute('radius-inner',0.45);
        rail.setAttribute('radius-outer',0.5);
        rail.setAttribute('segments-theta',36);
        rail.setAttribute('shader','flat');
        rail.setAttribute('theta-length',color==="green"?270:360);
        rail.setAttribute('rotation',rotation);
        rail.setAttribute('side','double');
        rail.setAttribute('color',color);
        this.el.appendChild(rail);
        return rail;
    },
    createElement(scale,color,intersectable){
        // Create a dragging box.
        let element = document.createElement('a-box');
        element.setAttribute('shader','flat');
        element.setAttribute('scale',scale);
        if(intersectable){
            element.className = 'intersect';
        }
        if(color)element.setAttribute('color',color);
        this.el.appendChild(element);
        return element;
    }
});