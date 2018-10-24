export class ViewUtils{
    constructor(context){
        this.context = context;
        // A collection of helper methods used by many views.
    }
    title(name,uuid){
        // Set the title section of the current screen.
        return this.context.content.compileTemplates('title-section',[{name:name,uuid:uuid}],true)
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
    showTransformOptions(shouldHide){
        let scale = shouldHide?0.00001:1;
        this.scaleGizmoMenuButton('positionButton',scale);
        this.scaleGizmoMenuButton('rotationButton',scale);
        this.scaleGizmoMenuButton('scaleButton',scale);
    }
    childObject(child){
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/';
        let _child = {
            uuid:child.settings.uuid,
            image_url:icon_path+"custom.jpg",
            name:child.settings.name,
            type:child.settings.type==="Object3D"?"Group":this.context.friendly_names.show(child.settings.type)
        };
        if(child.settings.type==='Object3D'){
            _child.image_url = icon_path+"folder.jpg";
        }else if(child.settings.geometry.sub_type==='CustomGeometry'){
            _child.image_url = child.settings.geometry.image||icon_path+'parametric.jpg';
        }else if(child.settings.type==='Custom'){
            _child.image_url = icon_path+"custom.jpg";
        }else if(child.settings.type==='Poly'){
            _child.image_url = icon_path+"poly.jpg";
        }else if(child.settings.type==='Parametric'){
            _child.image_url = icon_path+"geometries/parametric/"+child.settings.geometry.sub_type
                .replace('Geometry','')
                .replace('Buffer','')
                .replace('Inverted','')+".jpg";
        }else if(child.settings.type==='Primitive'){
            _child.image_url = icon_path+"geometries/primitive/"+child.settings.geometry.type
                .replace('Geometry','')
                .replace('Buffer','')
                .replace('Inverted','')+".jpg";
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
                    this.context.currentObject.settings.material[field] = color;
                    this.context.currentObject.object3D.material[field] = new THREE.Color(color);
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
            console.log([object],[textureType],[textureProperty],[field]);
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
            this.context.currentObject.settings[object][field]+=this.context.precision*modifier;
            this.context.currentObject.object3D[object][field]=isDegrees?
                THREE.Math.degToRad(this.context.currentObject.settings[object][field]):
                this.context.currentObject.settings[object][field];

            if(object==="material")material.needsUpdate = true;
            text.setAttribute('text','value:'+(this.context.currentObject.settings[object][field]).toFixed(3));
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
            }
        };
        upButton.addEventListener('mousedown',()=>changeValue(1));
        downButton.addEventListener('mousedown',()=>changeValue(-1));
    }

    setupRadioInput(cssClass,callback){

        this.context.content.popup.querySelector(cssClass)
            .addEventListener('ui-radio-changed',e=>{
                callback(e.detail);
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
                    console.log(save,inputField,property);
                });
            }
        });
    }

    setupSwitcheInput(object,cssClass,field){

        this.context.content.popup.querySelector(cssClass)
            .addEventListener('ui-switch-changed',e=>{
                this.context.currentObject.settings[object][field]=e.detail;
                this.context.currentObject.object3D[object][field]=
                    this.context.currentObject.settings[object][field];
                if(object==="geometry"){
                    this.context.sceneGraph.objectFactory.resetGeometry();
                    this.context.displayBox.setObject(this.context.currentObject.object3D);
                }
            })
    }
}