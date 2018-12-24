export class PhysicsView {
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/geometries/primitive/';
        this.types_images = {
            'Box': icon_path + 'Box.jpg',
            'Cylinder': icon_path + 'Cylinder.jpg',
            'Plane': icon_path + 'Plane.jpg',
            'Sphere': icon_path + 'Sphere.jpg',
            'Quick Hull': icon_path + 'Torus.jpg',
            'Terrain Collider': icon_path + 'Terrain.jpg'
        };
        this.displayShapes = {};
    }
    open(page,child) {
        this.context.showLoader();
        this.page = page || 0;
        this.context.content.container.setAttribute('visible',false);
        this.isTop = this.context.currentObject === this.context.sceneGraph.currentScene;
        this.isShape = !!child;
        let type = "Physics Shape"+(this.isShape?'':' List');
        let editor = document.getElementById('editor');
        editor.setAttribute('material','color:#efffff');
        editor.setAttribute('physics-helper-update','');
        this.context.breadCrumbs.make(
            this.context.breadCrumbs.fromObject(this.context.currentObject)
                .concat([{
                    name: 'Physics', callback: () => {
                        if(this.isShape){
                            this.open(0);
                        }
                    }, isTop: false
                }])
                .concat(this.isShape?[{
                    name: child.name, callback: () => {}, isTop: false
                }]:[])
        );
        let uuid = this.context.currentObject.settings.uuid;
        let name = (this.isTop?this.context.currentObject.metadata.name:this.context.currentObject.settings.name)+' Physics'
        if(this.isShape){
            name = child.name+" Shape";
            uuid = child.id;
        }
        this.child = child;
        this.context.currentObject.settings.physics_shapes = this.context.currentObject.settings.physics.shapes || [];
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadScreen('physics-view', [
            'title-section',
            'physics-material-settings',
            'physics-body-settings',
            'physics-side-body-settings',
            'physics-shape-geometry',
            'three-number-inputs',
            'single-item-button',
            'double-item-button',
            'side-item-add'
        ],true)
            .then(()=>this.hideNotNeeded())
            .then(()=>this.showShapeHelpers())
            .then(()=>this.context.viewUtils.title(name,{settings:{uuid,type,geometry:{type:''}}}))
            .then(()=>this.setupTitleSection())
            .then(()=>this.setupGravitySettings())
            .then(()=>this.setupBodySettings())
            .then(()=>this.setupMaterialSettings())
            .then(() => this.setupAddItem())
            .then(() => this.setupRemoveShape())
           //.then(() => this.setupMobileResponse())
            .then(() => this.setupShapes())
            .then(() => this.setupShapeSettings())
            .then(() => this.setupPlaneSettings())
            .then(() => this.setupBoxSettings())
            .then(() => this.setupSphereSettings())
            .then(() => this.setupCylinderSettings())
            .then(() => this.setupOffsetListeners())
            .then(() => this.uiRenderer.components['ui-renderer'].play())
            .then(() => this.context.content.reloadContent())
            .then(() => this.context.hideLoader())
            .then(()=>this.context.content.container.setAttribute('visible',true));
    }
    hideNotNeeded(){
        // if(this.isShape){
        //     let ele = document.getElementById('rightSection');
        //     ele.parent.removeChild(ele);
        //     document.getElementById('leftSection').setAttribute('width',3.75);
        // }
    }
    setupMobileResponse(){
        if(!this.isShape) return;
        return this.context.content.compileTemplates('mobile-response',[{
            hide_on_mobile:this.child.settings.hide_on_mobile,
            hide_on_desktop:this.child.settings.hide_on_desktop
        }])
            .then(contents=>this.context.content.addTemplateItem('#mobileSettings',contents[0]))
            .then(()=>{
                let hideOnMobile = document.querySelector('.hideOnMobile');
                let hideOnDesktop = document.querySelector('.hideOnDesktop');
                hideOnMobile.addEventListener('mousedown',()=>{
                    this.child.settings.hide_on_mobile = hideOnMobile.getValue();
                });
                hideOnDesktop.addEventListener('mousedown',()=>{
                    this.child.settings.hide_on_desktop = hideOnDesktop.getValue();
                });
            });
    }
    setupRemoveShape(){
        if(!this.isShape) return;
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Remove',
            description:'Remove this shape from the physics object.',
            buttonText:'REMOVE SHAPE',
            buttonColor:'#e57373',
            buttonFontColor:'white',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#removeObject',contents[0]))
            .then(()=>{
                let removeButton = document.querySelector('#removeObject').querySelector('.singleButton');
                removeButton.removeAttribute('ui-modal');
                removeButton.addEventListener('mousedown',()=>{
                    this.context.physics.removeShape(this.child.id,this.child.objectId);
                    let helper = this.displayShapes[this.child.objectId].shapes[this.child.id];
                    helper.parent.remove(helper);
                    UI.utils.clearObject(helper);
                    delete this.displayShapes[this.child.objectId].shapes[this.child.id];
                    let shapes = this.context.currentObject.settings.physics.shapes;
                    let index = shapes.indexOf(this.child);
                    shapes.splice(index,1);
                    if(!shapes.length){
                        this.context.physics.remove();
                        this.resetPhysics();
                        this.context.currentObject.settings.physics.enabled = false;
                    }
                    this.open(0);

                });
            });

    }
    setupMaterialSettings(){
        if(this.isShape) return;
        return this.context.content.compileTemplates('physics-material-settings',[{
            enabled:this.context.currentObject.settings.physics.enabled,
            friction:this.context.currentObject.settings.physics.settings.friction,
            restitution:this.context.currentObject.settings.physics.settings.restitution,
        }])
            .then(contents=>this.context.content.addTemplateItem('#materialSettings',contents[0],true))
            .then(()=>{

                let parent = document.querySelector('.materialSettings');
                this.setupSingleBodyButton(parent,'.zFrictionUp','x','friction',()=>this.materialUpdate(),1);
                this.setupSingleBodyButton(parent,'.zFrictionDown','x','friction',()=>this.materialUpdate(),-1);
                this.setupSingleBodyButton(parent,'.zRestitutionUp','x','restitution',()=>this.materialUpdate(),1);
                this.setupSingleBodyButton(parent,'.zRestitutionDown','x','restitution',()=>this.materialUpdate(),-1);
                this.setupMaterialListeners();
            });
    }

    setupGravitySettings(){
        if(this.isShape) return;
        let transforms = [
            {name:'Gravity',vector:this.context.sceneGraph.currentScene.settings.physics.gravity,className:'gravitySettings'},
        ];
        return this.context.content.compileTemplates('three-number-inputs',transforms)
            .then(contents=>this.context.content.addTemplateItem('#gravitySettings',this.startSection('Gravity Settings','Changing gravity settings affects all objects in the scene at once.')+contents[0]+contents[1]+'</a-entity>',true))
            .then(()=>{
                this.setupButtonGroup(document.querySelector('.gravitySettings'),'gravity',()=>this.gravityUpdate());
                this.setupGravityListeners();
            });
    }

    setupBodySettings(){
        return this.context.content.compileTemplates(this.isShape?'physics-side-body-settings':'physics-body-settings',[{
            enabled:this.context.currentObject.settings.physics.enabled,
            walkOnEnabled:this.context.currentObject.settings.physics.walkOnEnabled,
            mouseOnEnabled:this.context.currentObject.settings.mouseOn,
            mass:this.context.currentObject.settings.physics.settings.mass,
        }])
            .then(contents=>this.context.content.addTemplateItem(this.isShape?'#childObjectsContainer':'#bodySettings',contents[0],true))
            .then(()=>{
                this.setupMassListeners();
                let parent = document.querySelector('.bodySettings');
                this.setupSingleBodyButton(parent,'.zMassUp','x','mass',()=>this.massTargetUpdate(),1);
                this.setupSingleBodyButton(parent,'.zMassDown','x','mass',()=>this.massTargetUpdate(),-1);
                let enabledSwitch = document.querySelector('.physicsEnabled');
                enabledSwitch.addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.physics.enabled = enabledSwitch.getValue();
                    if(this.context.currentObject.settings.physics.enabled){
                        this.context.physics.addCurrent();
                        this.resetPhysics();
                    }else{
                        this.context.physics.remove();
                    }
                    this.context.sceneGraph.updatePhysicsChildren();
                    this.showShapeHelpers();
                });
                let walkOnSwitch = document.querySelector('.walkOnEnabled');
                if(walkOnSwitch){
                    walkOnSwitch.addEventListener('mousedown',()=>{
                        this.context.currentObject.settings.physics.walkOnEnabled = walkOnSwitch.getValue();
                        this.context.sceneGraph.updatePhysicsChildren();
                        this.showShapeHelpers();
                    });
                }
                let mouseOnSwitch = document.querySelector('.mouseOnEnabled');
                if(mouseOnSwitch){
                    mouseOnSwitch.addEventListener('mousedown',()=>{
                        this.context.currentObject.settings.mouseOn = mouseOnSwitch.getValue();
                        this.context.sceneGraph.raycastObjectsInitialised = false;
                    });
                }
                document.querySelector('.resetPhysics').addEventListener('mousedown',()=>{
                    this.resetPhysics();
                });
            });
    }
    resetPhysics(){
        this.context.physics.getData = false;
        this.context.currentObject.object3D.position.set(
            this.context.currentObject.settings.transform.position.x,
            this.context.currentObject.settings.transform.position.y,
            this.context.currentObject.settings.transform.position.z,
        );
        this.context.currentObject.object3D.rotation.set(
            this.context.currentObject.settings.transform.rotation.x,
            this.context.currentObject.settings.transform.rotation.y,
            this.context.currentObject.settings.transform.rotation.z,
        );
        if(this.displayShapes[this.context.currentObject.settings.uuid]) {
            let pos = new THREE.Vector3();
            this.context.currentObject.object3D.getWorldPosition(pos);
            let quat = new THREE.Quaternion();
            this.context.currentObject.object3D.getWorldQuaternion(quat);
            this.displayShapes[this.context.currentObject.settings.uuid].mesh.position.copy(pos);
            this.displayShapes[this.context.currentObject.settings.uuid].mesh.quaternion.copy(quat);
        }
        this.context.physics.setCurrentPosition()
            .then(()=>{
                this.context.physics.getData = true;
            });
    }
    startSection(title,extra){
        return  `<a-text font="roboto" baseLine="top" anchor="center" 
            value="`+title+`"
                    color="#212121" wrap-count="26" width="1.35" height="0.15"></a-text>
            <a-plane width="2.6" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="2.6">`+(extra?`<a-text font="roboto" baseLine="top" anchor="center" 
            value="`+extra+`" color="#212121" wrap-count="60" width="2.6" height="0.09"></a-text>`:``);
    }
    setupPlaneSettings(){
        if(!this.isShape||this.child.shape !== "Plane") return;
        let transforms = [
            {name:'Width',number:this.child.settings.width||1},
            {name:'Height',number:this.child.settings.height||1}
        ];
        return this.context.content.compileTemplates('number',transforms)
            .then(contents=>{
                return this.context.content.addTemplateItem('#specificSettings',this.startSection('Plane Settings')+contents[0]+contents[1]+'</a-entity>',true)
            })
            .then(()=>{
                this.settupSingleButtonGroup(document.querySelector('.width'),'width',false,'width',()=>this.planeUpdate(),1);
                this.settupSingleButtonGroup(document.querySelector('.height'),'height',false,'height',()=>this.planeUpdate(),1);
                this.setupPlaneListeners();
            });
    }
    setupBoxSettings(){
        if(!this.isShape||this.child.shape !== "Box") return;
        let transforms = [
            {name:'Size',vector:this.child.settings.size,className:'sizeSettings'}
        ];
        return this.context.content.compileTemplates('three-number-inputs',transforms)
            .then(contents=>this.context.content.addTemplateItem('#specificSettings',this.startSection('Box Settings')+contents[0]+'</a-entity>',true))
            .then(()=>{
                this.setupButtonGroup(document.querySelector('.sizeSettings'),'size',()=>this.sizeUpdate());
                this.setupSizeListeners();
            });
    }
    setupSphereSettings(){
        if(!this.isShape||this.child.shape !== "Sphere") return;
        let transforms = [
            {name:'Radius',number:this.child.settings.radius||0.5,className:'radius'}
        ];
        return this.context.content.compileTemplates('number',transforms)
            .then(contents=>this.context.content.addTemplateItem('#specificSettings',this.startSection('Sphere Settings')+contents[0]+'</a-entity>',true))
            .then(()=>{
                this.settupSingleButtonGroup(document.querySelector('.radius'),'radius',false,'radius',()=>this.radiusUpdate(),0.5);
                this.setupRadiusListeners();
            });
    }
    setupCylinderSettings(){
        if(!this.isShape||this.child.shape !== "Cylinder") return;
        let transforms = [
            {name:'Radius Top',number:this.child.settings.radiusTop||0.5,className:'radiustop'},
            {name:'Radius Bottom',number:this.child.settings.radiusBottom||0.5,className:'radiusbottom'},
            {name:'Height',number:this.child.settings.height||1,className:'height'},
            {name:'Radial Segments',number:this.child.settings.radialSegments||16,className:'radialsegments'}
        ];
        return this.context.content.compileTemplates('number',transforms)
            .then(contents=>this.context.content.addTemplateItem('#specificSettings',this.startSection('Cylinder Settings')+contents[0]+contents[1]+contents[2]+contents[3]+'</a-entity>',true))
            .then(()=>{
                this.settupSingleButtonGroup(document.querySelector('.radiustop'),'radiustop',false,'radiusTop',()=>this.cylinderUpdate(),0.5);
                this.settupSingleButtonGroup(document.querySelector('.radiusbottom'),'radiusbottom',false,'radiusBottom',()=>this.cylinderUpdate(),0.5);
                this.settupSingleButtonGroup(document.querySelector('.height'),'height',false,'height',()=>this.cylinderUpdate(),1);
                this.settupSingleButtonGroup(document.querySelector('.radialsegments'),'radialsegments',false,'radialSegments',()=>this.cylinderUpdate(),16);
                this.setupCylinderListeners();
            });
    }
    setupShapeSettings(){
        if(!this.isShape) return;
        let transforms = [
            {name:'Position',vector:this.child.settings.offset,className:'offsetSettings'},
            {name:'Rotation',vector:{
                    x:THREE.Math.radToDeg(this.child.settings.rotationOffset.x),
                    y:THREE.Math.radToDeg(this.child.settings.rotationOffset.y),
                    z:THREE.Math.radToDeg(this.child.settings.rotationOffset.z),
                },className:'rotationOffsetSettings'},
        ];
        return this.context.content.compileTemplates('three-number-inputs',transforms)
            .then(contents=>this.context.content.addTemplateItem('#shapeSettings',this.startSection('Shape Offsets')+contents[0]+contents[1]+'</a-entity>',true))
            .then(()=>{
                this.setupButtonGroup(document.querySelector('.offsetSettings'),'offset',()=>this.offsetUpdate());
                this.setupButtonGroup(document.querySelector('.rotationOffsetSettings'),'rotationOffset',()=>this.offsetUpdate());
                this.setupOffsetListeners();
            });
    }

    setupSingleButton(parent,selector,direction,field,isRotation,callback){
        let button = parent.querySelector(selector);
        button.addEventListener('mousedown',()=>{
            this.child.settings[field]+=(isRotation?
                    THREE.Math.degToRad(this.context.precision*direction):
                    this.context.precision*direction
            );
            if(this.child.settings[field]===0){
                this.child.settings[field]=0.0001;
            }
            callback()
        });
    }
    settupSingleButtonGroup(parent,setting,isRotation,field,callback,defaultValue){
        if(!this.isShape)return;
        this.setupSingleButton(parent,'.xInputUp',1,field,isRotation,callback);
        this.setupSingleButton(parent,'.xInputDown',-1,field,isRotation,callback);
    }
    setupButtonGroup(parent,setting,callback){
        if(!this.isShape&&setting !== "gravity")return;
        this.setupOffsetButton(parent,'.xInputUp','x',1,setting,callback);
        this.setupOffsetButton(parent,'.xInputDown','x',-1,setting,callback);
        this.setupOffsetButton(parent,'.yInputUp','y',1,setting,callback);
        this.setupOffsetButton(parent,'.yInputDown','y',-1,setting,callback);
        this.setupOffsetButton(parent,'.zInputUp','z',1,setting,callback);
        this.setupOffsetButton(parent,'.zInputDown','z',-1,setting,callback);
        parent.querySelector('.reset-values').addEventListener('mousedown',()=>{
            let value = setting==="size"?1:0;
            if(setting === "gravity"){
                this.context.sceneGraph.currentScene.settings.physics.gravity = {x:value,y:value,z:value};
            }else{
                this.child.settings[setting] = {x:value,y:value,z:value};
            }
            callback();
        });
    }
    setupOffsetButton(parent,selector,axis,direction,field,callback){
        let button = parent.querySelector(selector);
        button.addEventListener('mousedown',()=>{
            if(field === "gravity") {
                this.context.sceneGraph.currentScene.settings.physics.gravity[axis]+=this.context.precision*direction;
            }else{
                this.child.settings[field][axis]+=(field==="rotationOffset"?
                        THREE.Math.degToRad(this.context.precision*direction):
                        this.context.precision*direction
                );
                if(this.child.settings[field][axis]===0)
                    this.child.settings[field][axis]= 0.00001;
            }
            callback();
        });
    }
    setupCylinderListeners(){
        if(!this.isShape||this.child.shape !== "Cylinder")return;
        let radiusTopSettings = document.querySelector('.radiustop');
        let radiusBottomSettings = document.querySelector('.radiusbottom');
        let heightSettings = document.querySelector('.height');
        let radialSettings = document.querySelector('.radialsegments');
        let extraTextSettings = ';color:#212121;align:center';
        this.cylinderUpdate = ()=>{
            let radiusTop = this.child.settings.radiusTop;
            let radiusBottom = this.child.settings.radiusBottom;
            let height = this.child.settings.height;
            let radialSegments = this.child.settings.radialSegments;
            this.context.physics.updateShape(this.child);
            let currentShape = this.displayShapes[this.child.objectId].shapes[this.child.id];
            UI.utils.clearObject(currentShape);
            currentShape.parent.remove(currentShape);
            delete this.displayShapes[this.child.objectId].shapes[this.child.id];
            this.setupShapeHelper(this.child);
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            radiusTopSettings.querySelector('.xText').setAttribute('text','value:'+(radiusTop).toFixed(3)+extraTextSettings);
            radiusBottomSettings.querySelector('.xText').setAttribute('text','value:'+(radiusBottom).toFixed(3)+extraTextSettings);
            heightSettings.querySelector('.xText').setAttribute('text','value:'+(height).toFixed(3)+extraTextSettings);
            radialSettings.querySelector('.xText').setAttribute('text','value:'+(radialSegments).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }
    setupPlaneListeners(){
        if(!this.isShape||this.child.shape !== "Plane")return;
        let widthSettings = document.querySelector('.width');
        let heightSettings = document.querySelector('.height');
        let extraTextSettings = ';color:#212121;align:center';
        this.planeUpdate = ()=>{
            let width = this.child.settings.width;
            let height = this.child.settings.height;
            this.context.physics.updateShape(this.child);
            let currentShape = this.displayShapes[this.child.objectId].shapes[this.child.id];
            UI.utils.clearObject(currentShape);
            currentShape.parent.remove(currentShape);
            delete this.displayShapes[this.child.objectId].shapes[this.child.id];
            this.setupShapeHelper(this.child);
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            widthSettings.querySelector('.xText').setAttribute('text','value:'+(width).toFixed(3)+extraTextSettings);
            heightSettings.querySelector('.xText').setAttribute('text','value:'+(height).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }
    setupRadiusListeners(){
        if(!this.isShape||this.child.shape !== "Sphere")return;
        let radiusSettings = document.querySelector('.radius');
        let extraTextSettings = ';color:#212121;align:center';
        this.radiusUpdate = ()=>{
            let radius = this.child.settings.radius;
            let currentShape = this.displayShapes[this.child.objectId].shapes[this.child.id];
            UI.utils.clearObject(currentShape);
            currentShape.parent.remove(currentShape);
            delete this.displayShapes[this.child.objectId].shapes[this.child.id];
            this.setupShapeHelper(this.child);
            this.context.physics.updateShape(this.child);
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            radiusSettings.querySelector('.xText').setAttribute('text','value:'+(radius).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }

    setupGravityListeners(){
        if(this.isShape)return;
        let gravitySettings = document.querySelector('.gravitySettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.gravityUpdate = ()=>{
            let gravity = this.context.sceneGraph.currentScene.settings.physics.gravity;
            this.context.physics.send('setGravity',this.context.sceneGraph.currentScene.settings.physics.gravity);
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            gravitySettings.querySelector('.xInput').setAttribute('text','value:'+(gravity.x).toFixed(3)+extraTextSettings);
            gravitySettings.querySelector('.yInput').setAttribute('text','value:'+(gravity.y).toFixed(3)+extraTextSettings);
            gravitySettings.querySelector('.zInput').setAttribute('text','value:'+(gravity.z).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }

    setupSizeListeners(){
        if(!this.isShape)return;
        let positionSettings = document.querySelector('.sizeSettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.sizeUpdate = ()=>{
            let scale = this.child.settings.size;
            this.context.physics.updateShape(this.child);
            this.displayShapes[this.child.objectId].shapes[this.child.id].scale.set(scale.x,scale.y,scale.z);
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            positionSettings.querySelector('.xInput').setAttribute('text','value:'+(scale.x).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.yInput').setAttribute('text','value:'+(scale.y).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.zInput').setAttribute('text','value:'+(scale.z).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }
    setupOffsetListeners(){
        if(!this.isShape)return;
        let positionSettings = document.querySelector('.offsetSettings');
        let rotationSettings = document.querySelector('.rotationOffsetSettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.offsetUpdate = ()=>{
            let position = this.child.settings.offset;
            let rotation = this.child.settings.rotationOffset;
            let rotX = ['Cylinder'].indexOf(this.child.shape)===-1?rotation.x:rotation.x+Math.PI/2;//,'Terrain Collider'
            this.context.physics.updateShape(this.child);
            this.displayShapes[this.child.objectId].shapes[this.child.id].position.set(position.x,position.y,position.z);
            this.displayShapes[this.child.objectId].shapes[this.child.id].rotation.set(rotX,-rotation.z,-rotation.y);
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            positionSettings.querySelector('.xInput').setAttribute('text','value:'+(position.x).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.yInput').setAttribute('text','value:'+(position.y).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.zInput').setAttribute('text','value:'+(position.z).toFixed(3)+extraTextSettings);
            rotationSettings.querySelector('.xInput')
                .setAttribute('text','value:'+(THREE.Math.radToDeg(rotation.x)).toFixed(3)+extraTextSettings);
            rotationSettings.querySelector('.yInput')
                .setAttribute('text','value:'+(THREE.Math.radToDeg(rotation.y)).toFixed(3)+extraTextSettings);
            rotationSettings.querySelector('.zInput')
                .setAttribute('text','value:'+(THREE.Math.radToDeg(rotation.z)).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }
    setupSingleBodyButton(parent,selector,axis,field,callback,direction){
        let button = parent.querySelector(selector);
        button.addEventListener('mousedown',()=>{
            this.context.currentObject.settings.physics.settings[field]+=this.context.precision*direction;
            callback();
        });
    }
    setupMaterialListeners(){
        let materialSettings = document.querySelector('.materialSettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.materialUpdate = ()=>{
            this.context.physics.setCurrentPosition();
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            let friction = this.context.currentObject.settings.physics.settings.friction;
            let restitution = this.context.currentObject.settings.physics.settings.restitution;
            materialSettings.querySelector('.zFriction').setAttribute('text','value:'+(friction).toFixed(3)+extraTextSettings);
            materialSettings.querySelector('.zRestitution').setAttribute('text','value:'+(restitution).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }

    setupMassListeners(){
        let massSettings = document.querySelector('.bodySettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.massTargetUpdate = ()=>{
            this.context.physics.setCurrentPosition();
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            let mass = this.context.currentObject.settings.physics.settings.mass;
            massSettings.querySelector('.zMass').setAttribute('text','value:'+(mass).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }
    setupAddItem(){
        if(this.isShape) return;
        let start = this.page*10;
        let end  = start+10;
        let children = this.context.currentObject.settings.physics.shapes.slice(start,end);
        return this.context.content.compileTemplates('side-item-add',[{
            title:'Shapes',
            buttonText:'ADD SHAPE',
            children:children.map(child=>({image_url:this.types_images[child.shape],name:child.name,uuid:child.id,type:'Physics '+child.shape})),
            page:this.page
        }])
            .then(contents=>this.context.content.addTemplateItem('#childObjectsContainer',contents[0],true))
            .then(()=>{
                let loadButton = document.querySelector('#childObjectsContainer').querySelector('.loadItem');
                loadButton.addEventListener('mousedown', e => {
                    this.context.physicsShapeTypeModal.open();
                });
            });
    }
    setupShapes(){
        if(this.isShape) return;
        let prev = document.querySelector('.prev-button-children');
        if(prev){
            prev.addEventListener('mousedown',()=>{
                this.open(this.context.currentObject,--this.page);
            });
        }
        let next = document.querySelector('.next-button-children')
        if(next){
            next.addEventListener('mousedown',()=>{
                this.open(this.context.currentObject,++this.page);
            });
        }
        let openButtons = document.querySelector('#childObjectsContainer').querySelectorAll('.openItem');
        for(let i = 0; i < openButtons.length; i++){
            let openButton = openButtons[i];
            openButton.addEventListener('mousedown', e => {
                let child;
                for(let i =0; i < this.context.currentObject.settings.physics.shapes.length; i++){
                    let _child = this.context.currentObject.settings.physics.shapes[i];
                    if(_child.id===openButton.dataset.uuid){
                        child = _child;
                    }
                }
                if(child){
                    this.open(0,child);
                }
            })
        }
    }
    hideShapeHelpers(){
        for(let key in this.displayShapes){
            let shape = this.displayShapes[key].mesh;
            UI.utils.clearObject(shape);
            if(shape.parent)shape.parent.remove(shape);
            delete this.displayShapes[key].mesh;
            delete this.displayShapes[key];
        }
    }
    showShapeHelpers(){
        for(let j = 0; j < this.context.sceneGraph.physicsShapeObjects.length; j++) {
            let shapes = this.context.sceneGraph.physicsShapeObjects[j].settings.physics.shapes;
            for (let i = 0; i < shapes.length; i++) {
                let shape = shapes[i];
                if (!this.displayShapes[shape.objectId]) {
                    this.displayShapes[shape.objectId] = {mesh: new THREE.Object3D(), shapes: {}};
                    let pos = new THREE.Vector3();
                    this.context.sceneGraph.physicsShapeObjects[j].object3D.getWorldPosition(pos);
                    let quat = new THREE.Quaternion();
                    this.context.sceneGraph.physicsShapeObjects[j].object3D.getWorldQuaternion(quat);
                    this.displayShapes[shape.objectId].mesh.position.copy(pos);
                    this.displayShapes[shape.objectId].mesh.quaternion.copy(quat);
                    this.context.sceneEl.object3D.add(this.displayShapes[shape.objectId].mesh);
                }
                this.setupShapeHelper(shape);
            }
        }
    }
    setupShapeHelper(shape){
        if (!this.displayShapes[shape.objectId].shapes[shape.id]) {
            switch (shape.shape) {
                case 'Plane':
                    shape.settings.size.x = shape.settings.width;
                    shape.settings.size.y = shape.settings.height;
                case 'Box':
                    this.displayShapes[shape.objectId].shapes[shape.id] = new THREE.Mesh(
                        new THREE.BoxBufferGeometry(1, 1, 1),
                        new THREE.MeshBasicMaterial({wireframe: true, color: "#009688"})
                    );
                    // this.displayShapes[shape.objectId].shapes[shape.id].renderOrder = 9999;, depthTest: false
                    this.displayShapes[shape.objectId].shapes[shape.id].name = "<collider-mesh>";
                    this.displayShapes[shape.objectId].shapes[shape.id].scale.set(shape.settings.size.x,shape.settings.size.y,(shape.shape==="Plane"?0.01:shape.settings.size.z));
                    this.displayShapes[shape.objectId].shapes[shape.id].position.set(shape.settings.offset.x,shape.settings.offset.y,shape.settings.offset.z);
                    this.displayShapes[shape.objectId].shapes[shape.id].rotation.set(shape.settings.rotationOffset.x,shape.settings.rotationOffset.y,shape.settings.rotationOffset.z);

                    break;
                case "Sphere":
                    this.displayShapes[shape.objectId].shapes[shape.id] = new THREE.Mesh(
                        new THREE.SphereBufferGeometry(shape.settings.radius||0.00001, 8, 8),
                        new THREE.MeshBasicMaterial({wireframe: true, color: "#009688"})
                    );
                    // this.displayShapes[shape.objectId].shapes[shape.id].renderOrder = 9999;, depthTest: false
                    this.displayShapes[shape.objectId].shapes[shape.id].name = "<collider-mesh>";
                    this.displayShapes[shape.objectId].shapes[shape.id].position.set(shape.settings.offset.x,shape.settings.offset.y,shape.settings.offset.z);
                    break;
                case "Cylinder":
                    this.displayShapes[shape.objectId].shapes[shape.id] = new THREE.Mesh(
                        new THREE.CylinderBufferGeometry(shape.settings.radiusTop||0.00001, shape.settings.radiusBottom||0.00001, shape.settings.height,shape.settings.radialSegments),
                        new THREE.MeshBasicMaterial({wireframe: true, color: "#009688"})
                    );
                   // this.displayShapes[shape.objectId].shapes[shape.id].renderOrder = 9999;, depthTest: false
                    this.displayShapes[shape.objectId].shapes[shape.id].name = "<collider-mesh>";

                    this.displayShapes[shape.objectId].shapes[shape.id].rotation.set(shape.settings.rotationOffset.x+Math.PI/2,-shape.settings.rotationOffset.z,-shape.settings.rotationOffset.y);
                    this.displayShapes[shape.objectId].shapes[shape.id].position.set(shape.settings.offset.x,shape.settings.offset.y,shape.settings.offset.z);
                    break;
                case "Terrain Collider":
                    this.context.physics.send('getHeightField',{id:shape.id,objectId:shape.objectId})
                        .then(data=>{
                            //console.log(data);
                            var geometry = new THREE.Geometry();
                            data.data.vertices.forEach(v=>{
                                geometry.vertices.push(new THREE.Vector3(v[0],v[1],v[2]))
                            });
                            data.data.faces.forEach(f=>{
                                geometry.faces.push(new THREE.Face3(f[0],f[1],f[2]));
                            });
                            geometry.computeBoundingSphere();
                            geometry.computeFaceNormals();

                            this.displayShapes[shape.objectId].shapes[shape.id] = new THREE.Mesh(
                                geometry,
                                new THREE.MeshStandardMaterial({color: "#009688",wireframe:true,depthTest: false})//transparent: true, opacity: 0.8,
                            );
                            //console.log(this.displayShapes[shape.objectId].shapes[shape.id]);
                            //this.displayShapes[shape.objectId].shapes[shape.id].rotation.set(Math.PI/2,0,0);
                            this.displayShapes[shape.objectId].shapes[shape.id].renderOrder = 9999;
                            this.displayShapes[shape.objectId].shapes[shape.id].name = "<collider-mesh>";

                            this.displayShapes[shape.objectId].shapes[shape.id].position.set(
                                (shape.settings.heightfield.size.sizeX*shape.settings.heightfield.elementSize)/2,
                                0,
                                -(shape.settings.heightfield.size.sizeZ*shape.settings.heightfield.elementSize)/2
                            );
                            this.displayShapes[shape.objectId].shapes[shape.id].rotation.set(-Math.PI/2,0,0);

                            //this.displayShapes[shape.objectId].shapes[shape.id].position.set(shape.settings.offset.x,shape.settings.offset.y,shape.settings.offset.z);
                            this.displayShapes[shape.objectId].mesh.add(this.displayShapes[shape.objectId].shapes[shape.id]);
                        });
                    // let geometry = new THREE.PlaneGeometry(
                    //     shape.settings.heightfield.size.sizeX*shape.settings.heightfield.elementSize,
                    //     shape.settings.heightfield.size.sizeZ*shape.settings.heightfield.elementSize,
                    //     shape.settings.heightfield.size.sizeX,
                    //     shape.settings.heightfield.size.sizeZ
                    // );
                    // let heights = [];
                    // for (let i = 0; i < shape.settings.heightfield.matrix.length; i++) {
                    //     let _matrix = shape.settings.heightfield.matrix[i];
                    //     for (let j = 0; j < _matrix.length ; j++) {
                    //         heights.push(_matrix[j]);
                    //     }
                    // }
                    // for (let i = 0; i < heights.length; i++) {
                    //     geometry.vertices[i].z = heights[i];
                    // }
                    // geometry.computeFaceNormals();
                    // this.displayShapes[shape.objectId].shapes[shape.id] = new THREE.Mesh(
                    //     geometry,
                    //     new THREE.MeshStandardMaterial({color: "#009688",wireframe:true})//transparent: true, opacity: 0.8,depthTest: false,
                    // );
                    //
                    // this.displayShapes[shape.objectId].shapes[shape.id].rotation.set(Math.PI/2,0,0);
                    // this.displayShapes[shape.objectId].shapes[shape.id].renderOrder = 9999;
                    // this.displayShapes[shape.objectId].shapes[shape.id].name = "<collider-mesh>";
                    // this.displayShapes[shape.objectId].shapes[shape.id].position.set(shape.settings.offset.x,shape.settings.offset.y,shape.settings.offset.z);
                    //this.displayShapes[shape.objectId].shapes[shape.id].position.set(9.581,-42.797,-6.524);
                    break;

            }
            if(this.displayShapes[shape.objectId].shapes[shape.id]){
                this.displayShapes[shape.objectId].mesh.add(this.displayShapes[shape.objectId].shapes[shape.id]);
            }
        }
    }
    setupTitleSection(){
        document.getElementById('editItemTitle').setAttribute('visible',false)
        document.getElementById('copyUuid')
            .addEventListener('mousedown',()=>{
                UI.utils.copyToClipboard(this.context.currentObject.settings.uuid);
            });
    }
}