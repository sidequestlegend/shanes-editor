export class ViewUtils{
    constructor(context){
        this.context = context;
        // A collection of helper methods used by many views.
        this.parametric_types = [
            {name:'Apple',friendly_name:'Apple',image_url:'#small_icons',image_coords:'640 256 128 128'},
            {name:'AppleInverted',friendly_name:'Apple Inverted',image_url:'#small_icons',image_coords:'640 256 128 128'},
            {name:'Catenoid',friendly_name:'Catenoid',image_url:'#small_icons',image_coords:'512 384 128 128'},
            {name:'Fermat',friendly_name:'Fermat',image_url:'#small_icons',image_coords:'768 128 128 128'},
            {name:'Helicoid',friendly_name:'Helicoid',image_url:'#small_icons',image_coords:'896 0 128 128'},
            {name:'Horn',friendly_name:'Horn',image_url:'#small_icons',image_coords:'896 128 128 128'},
            {name:'HornInverted',friendly_name:'Horn Inverted',image_url:'#small_icons',image_coords:'896 128 128 128'},
            {name:'Klein',friendly_name:'Klein',image_url:'#small_icons',image_coords:'768 256 128 128'},
            {name:'KleinInverted',friendly_name:'Klein Inverted',image_url:'#small_icons',image_coords:'768 256 128 128'},
            {name:'Mobius',friendly_name:'Mobius',image_url:'#small_icons',image_coords:'640 384 128 128'},
            {name:'Mobius3D',friendly_name:'Mobius3D',image_url:'#small_icons',image_coords:'768 384 128 128'},
            {name:'Mobius3DInverted',friendly_name:'Mobius3D Inverted',image_url:'#small_icons',image_coords:'768 384 128 128'},
            {name:'Pillow',friendly_name:'Pillow',image_url:'#small_icons',image_coords:'896 384 128 128'},
            {name:'PillowInverted',friendly_name:'Pillow Inverted',image_url:'#small_icons',image_coords:'896 384 128 128'},
            {name:'NaticaStellata',friendly_name:'Natica',image_url:'#small_icons',image_coords:'896 256 128 128'},
            {name:'NaticaStellataInverted',friendly_name:'Natica Inverted',image_url:'#small_icons',image_coords:'896 256 128 128'},
            {name:'Scherk',friendly_name:'Scherk',image_url:'#small_icons',image_coords:'0 512 128 128'},
            {name:'Snail',friendly_name:'Snail',image_url:'#small_icons',image_coords:'128 512 128 128'},
            {name:'SnailInverted',friendly_name:'Snail Inverted',image_url:'#small_icons',image_coords:'128 512 128 128'},
            {name:'Spiral',friendly_name:'Spiral',image_url:'#small_icons',image_coords:'0 640 128 128'},
            {name:'SpiralInverted',friendly_name:'Spiral Inverted',image_url:'#small_icons',image_coords:'0 640 128 128'},
            {name:'Spring',friendly_name:'Spring',image_url:'#small_icons',image_coords:'128 640 128 128'},
            {name:'SpringInverted',friendly_name:'Spring Inverted',image_url:'#small_icons',image_coords:'128 640 128 128'}
        ];

        this.primitive_types = [
            {name:'Box',friendly_name:'Box',image_url:'#small_icons',image_coords:'0 768 128 128'},
            {name:'Circle',friendly_name:'Circle',image_url:'#small_icons',image_coords:'256 512 128 128'},
            {name:'Cone',friendly_name:'Cone',image_url:'#small_icons',image_coords:'128 768 128 128'},
            {name:'Cylinder',friendly_name:'Cylinder',image_url:'#small_icons',image_coords:'0 896 128 128'},
            {name:'Dodecahedron',friendly_name:'Dodecahedron',image_url:'#small_icons',image_coords:'256 640 128 128'},
            {name:'Icosahedron',friendly_name:'Icosahedron',image_url:'#small_icons',image_coords:'384 512 128 128'},
            {name:'Octahedron',friendly_name:'Octahedron',image_url:'#small_icons',image_coords:'512 512 128 128'},
            {name:'Plane',friendly_name:'Plane',image_url:'#small_icons',image_coords:'256 768 128 128'},
            {name:'Ring',friendly_name:'Ring',image_url:'#small_icons',image_coords:'128 896 128 128'},
            {name:'Sphere',friendly_name:'Sphere',image_url:'#small_icons',image_coords:'384 640 128 128'},
            {name:'Tetrahedron',friendly_name:'Tetrahedron',image_url:'#small_icons',image_coords:'512 640 128 128'},
            {name:'Torus',friendly_name:'Torus',image_url:'#small_icons',image_coords:'384 768 128 128'},
            {name:'TorusKnot',friendly_name:'TorusKnot',image_url:'#small_icons',image_coords:'640 512 128 128'}
        ]
    }
    title(name,object){
        // Set the title section of the current screen.
        return this.context.content.compileTemplates('title-section',[{name:name,uuid:object.settings.uuid,object_type:this.objectType(object)}],true)
            .then(contents=>this.context.content.addTemplateItem('#titleSection',contents[0]))
    }
    async stats(object){
        // Populate the stats section on the current view.
        if(this.context.sceneGraph.canOpen()){
            let statsParent = document.querySelector('#sceneStats')
            statsParent.parentElement.removeChild(statsParent);
            return;
        }
        let totals = {desktop:{points:0,pixels:0},mobile:{points:0,pixels:0}};
        this.context.sceneGraph.totals(object||this.context.sceneGraph.currentScene,totals);
        await this.context.content.compileTemplates('object-stats',[totals],true)
            .then(contents=>this.context.content.addTemplateItem('#sceneStats',contents[0]))
    }
    hideTransformOptions(){
        this.showTransformOptions(true);
    }
    scaleGizmoMenuButton(id,scale){
        new TWEEN.Tween(document.getElementById(id).getAttribute('scale'))
            .to(new THREE.Vector3(scale,scale,scale), 250)
            .easing(TWEEN.Easing.Exponential.Out).start();
    }
    showTransformOptions(shouldHide,hideRotation,hideScale){
        console.log('show transform',shouldHide);
        let opacity = shouldHide?0.4:1;
        document.getElementById('positionButton').getAttribute('opacity',opacity);
        document.getElementById('rotationButton').getAttribute('opacity',hideRotation?0.4:opacity);
        document.getElementById('scaleButton').getAttribute('opacity',hideScale?0.4:opacity);
        // this.scaleGizmoMenuButton('positionButton',scale);
        // if(!hideRotation)this.scaleGizmoMenuButton('rotationButton',scale);
        // if(!hideScale)this.scaleGizmoMenuButton('scaleButton',scale);
    }
    objectType(child){
        if(child===this.context.sceneGraph.currentScene) {
            return "Scene";
        }else if(child.settings.type==="Aframe"){
            return "Aframe Code";
        }else if(child.settings.type==="Object3D"){
            return "Group";
        }else{
            return child.settings.type==="Light"?
                this.context.friendly_names.show(child.settings.geometry.type):
                this.context.friendly_names.show(child.settings.type)+" "+this.context.friendly_names.show(child.settings.geometry.type);
        }
    }
    childObject(child){
        let _child = {
            uuid:child.settings.uuid,
            image_url:"#objects_custom",
            name:child.settings.name,
            type:this.objectType(child)
        };
        if(child.settings.type==='Object3D'){
            _child.image_url = "#small_icons";
            _child.image_coords = "0 384 128 128";
        }else if(child.settings.geometry.sub_type==='CustomGeometry'){
            _child.image_url = "#small_icons";
            _child.image_coords = "0 256 128 128";
        }else if(child.settings.type==='Sound'){
            _child.image_url = "#small_icons";
            _child.image_coords = "768 768 128 128";
        }else if(child.settings.type==='Light'){
            _child.image_url = "#small_icons";
            _child.image_coords = "384 896 128 128";
        }else if(child.settings.type==='Portal'){
            _child.image_url = "#small_icons";
            _child.image_coords = "640 768 128 128";
        }else if(child.settings.type==='Effect'){
            _child.image_url = "#small_icons";
            _child.image_coords = "640 640 128 128";
        }else if(child.settings.type==='Aframe'){
            _child.image_url = "#small_icons";
            _child.image_coords = "256 0 128 128";
        }else if(child.settings.type==='Avatar'){
            _child.image_url = "#small_icons";
            _child.image_coords = "384 0 128 128";
        }else if(child.settings.type==='Kenney'){
            _child.image_url = "#small_icons";
            _child.image_coords = "512 768 128 128";
        }else if(child.settings.type==='Prefab'){
            _child.image_url = "#small_icons";
            _child.image_coords = "512 896 128 128";
        }else if(child.settings.type==='Custom'){
            _child.image_url = "#small_icons";
            _child.image_coords = "0 256 128 128";
        }else if(child.settings.type==='Poly'){
            _child.image_url = "#small_icons";
            _child.image_coords = "768 640 128 128";
        }else if(child.settings.type==='Sketchfab'){
            _child.image_url = "#small_icons";
            _child.image_coords = "896 640 128 128";
        }else if(child.settings.type==='Primitive'||child.settings.type==='Parametric'){
            _child.image_url = "#small_icons";

            let shape_name = (child.settings.type==='Primitive'?child.settings.geometry.type:child.settings.geometry.sub_type)
                .replace('Geometry','')
                .replace('Buffer','')
                .replace('Inverted','');

            let getCoords = item=>{
                if(item.name===shape_name){
                    _child.image_coords = item.image_coords;
                }
            }

            this.parametric_types.forEach(getCoords);
            this.primitive_types.forEach(getCoords);
        }
        return _child;
    }

    setupColorUpdate(cssClass,field){
        let colorButton = this.context.content.popup
            .querySelector(cssClass);

        let colorText = this.context.content.popup
            .querySelector(cssClass+'Text');
        colorButton.addEventListener('mousedown',()=>{
            document.getElementById('colorPicker').open()
                .then(color=>{
                    colorText.setAttribute('value',color);
                    colorButton.setAttribute('color',color);
                    if(this.context.currentObject.settings.type==="Light"){
                        this.context.currentObject.settings.light[field] = color;
                        this.context.currentObject.object3D[field] = new THREE.Color(color);
                    }else {
                        this.context.currentObject.settings.material[field] = color;
                        this.context.currentObject.object3D.material[field] = new THREE.Color(color);
                        this.context.currentObject.settings.state.updated = true;
                        this.context.sceneGraph.sync();
                    }
                });
        });
    }

    setupNumberUpdate(object,cssClass,field,isDegrees,textureType,textureProperty){
        let upButton = this.context.content.popup.querySelector(cssClass)
            .querySelector('.xInputUp');
        let downButton = this.context.content.popup.querySelector(cssClass)
            .querySelector('.xInputDown');
        let text = this.context.content.popup.querySelector(cssClass)
            .querySelector('.xText');
        let material = this.context.currentObject.object3D.material;
        let changeTextureValue = modifier=>{
            this.context.currentObject.settings[object][textureType][textureProperty][field]+=this.context.precision*modifier;
            let value = this.context.currentObject.settings[object][textureType][textureProperty][field];
            if(textureType==="lightTexture"){
                if(material.lightMap)material.lightMap[textureProperty][field] = value;
                if(material.aoMap)material.aoMap[textureProperty][field] = value;
            }else{
                if(material.map)material.map[textureProperty][field] = value;
                if(material.specularMap)material.specularMap[textureProperty][field] = value;
                if(material.bumpMap)material.bumpMap[textureProperty][field] = value;
                if(material.emissiveMap)material.emissiveMap[textureProperty][field] = value;

                if(material.roughnessMap)material.roughnessMap[textureProperty][field] = value;
                if(material.metalnessMap)material.metalnessMap[textureProperty][field] = value;

                if(material.displacementMap)material.displacementMap[textureProperty][field] = value;
                if(material.normalMap)material.normalMap[textureProperty][field] = value;
                if(material.alphaMap)material.alphaMap[textureProperty][field] = value;
                if(material.envMap)material.envMap[textureProperty][field] = value;
            }
            material.needsUpdate = true;
            text.setAttribute('text','value:'+(this.context.currentObject.settings[object][textureType][textureProperty][field]).toFixed(3));
        };
        let changeMaterialValue = modifier=>{
            if(object==="sound"){
                this.context.currentObject.settings[object][field]+=this.context.precision*modifier;
                this.context.currentObject.object3D[field]=isDegrees?
                    THREE.Math.degToRad(this.context.currentObject.settings[object][field]):
                    this.context.currentObject.settings[object][field];
                text.setAttribute('text','value:'+(this.context.currentObject.settings[object][field]).toFixed(3));
            }else if(object==="light"){
                if(~field.indexOf('.')){
                    let parts = field.split('.');
                    this.context.currentObject.settings[object][parts[0]][parts[1]]+=this.context.precision*modifier;
                    this.context.currentObject.object3D.shadow[parts[0]][parts[1]]=this.context.currentObject.settings[object][parts[0]][parts[1]];
                    text.setAttribute('text','value:'+(this.context.currentObject.settings[object][parts[0]][parts[1]]).toFixed(3));
                }else{
                    this.context.currentObject.settings[object][field]+=this.context.precision*modifier;
                    this.context.currentObject.object3D[field]=this.context.currentObject.settings[object][field];
                    text.setAttribute('text','value:'+(this.context.currentObject.settings[object][field]).toFixed(3));
                }
            }else{
                if(~field.indexOf('.')){
                    let parts = field.split('.');
                    this.context.currentObject.settings[object][parts[0]][parts[1]]+=this.context.precision*modifier;
                    this.context.currentObject.object3D[object][parts[0]][parts[1]]=isDegrees?
                        THREE.Math.degToRad(this.context.currentObject.settings[object][parts[0]][parts[1]]):
                        this.context.currentObject.settings[object][parts[0]][parts[1]];
                    // this.context.currentObject.object3D.shadow[parts[0]][parts[1]]=this.context.currentObject.settings[object][parts[0]][parts[1]];
                    text.setAttribute('text','value:'+(this.context.currentObject.settings[object][parts[0]][parts[1]]).toFixed(3));
                }else{
                    this.context.currentObject.settings[object][field]+=this.context.precision*modifier;
                    this.context.currentObject.object3D[object][field]=isDegrees?
                        THREE.Math.degToRad(this.context.currentObject.settings[object][field]):
                        this.context.currentObject.settings[object][field];
                    text.setAttribute('text','value:'+(this.context.currentObject.settings[object][field]).toFixed(3));
                }
            }
            if(object==="material")material.needsUpdate = true;
        };
        let changeValue = modifier=>{
            if(textureType){
                changeTextureValue(modifier);
            }else{
                changeMaterialValue(modifier);
            }
            if(object==="geometry"){
                this.context.sceneGraph.objectFactory.resetGeometry();
                this.context.displayBox.setObject(this.context.currentObject.object3D);
                this.context.currentObject.settings.state.updated = true;
                this.context.sceneGraph.sync();
            }
        };
        upButton.addEventListener('mousedown',()=>changeValue(1));
        downButton.addEventListener('mousedown',()=>changeValue(-1));
    }

    setupRadioInput(cssClass,callback,shouldNotSync){
        this.context.content.popup.querySelector(cssClass)
            .addEventListener('ui-radio-changed',e=>{
                callback(e.detail);
                if(!shouldNotSync){
                    this.context.currentObject.settings.state.updated = true;
                    this.context.sceneGraph.sync();
                }
            })
    }

    setupSaveMap(save,inputField,property){
        let textureImage = this.context.content.popup.querySelector(inputField);
        let saveButton = this.context.content.popup.querySelector(save);
        saveButton.addEventListener('mousedown',()=> {
            let new_image = textureImage.getValue();
            if (new_image) {
                let material = this.context.currentObject.settings.material;
                let textureProperty = 'texture';
                if(property==='aoMap'||property==='lightMap'){
                    textureProperty = 'lightTexture';
                }
                material[property] = new_image;
                new THREE.TextureLoader().load(new_image,texture => {
                    texture.repeat.set(material[textureProperty].repeat.x, material[textureProperty].repeat.y);
                    texture.offset.set(material[textureProperty].offset.x, material[textureProperty].offset.y);
                    texture.wrapS = material[textureProperty].wrapping.s;
                    texture.wrapT = material[textureProperty].wrapping.t;
                    texture.minFilter = material[textureProperty].filters.min;
                    texture.magFilter = material[textureProperty].filters.mag;
                    this.context.currentObject.object3D.material[property] = texture;
                    this.context.currentObject.object3D.material[property].needsUpdate = true;
                    this.context.currentObject.object3D.material[property].needsUpdate = true;
                    this.context.currentObject.settings.state.updated = true;
                    this.context.sceneGraph.sync();
                });
            }
        });
    }

    setupSwitcheInput(object,cssClass,field){
        this.context.content.popup.querySelector(cssClass)
            .addEventListener('ui-switch-changed',e=>{
                this.context.currentObject.settings[object][field]=e.detail;
                if(object==="sound"){
                    this.context.currentObject.object3D[field]=
                        this.context.currentObject.settings.sound[field];
                }else{
                    this.context.currentObject.object3D[object][field]=
                        this.context.currentObject.settings[object][field];
                }
                if(object==="geometry"){
                    this.context.sceneGraph.objectFactory.resetGeometry();
                    this.context.displayBox.setObject(this.context.currentObject.object3D);
                }
                this.context.currentObject.settings.state.updated = true;
                this.context.sceneGraph.sync();
            })
    }
}