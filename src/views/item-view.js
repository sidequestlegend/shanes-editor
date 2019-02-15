export class ItemView {
    constructor(context) {
        this.context = context;
    }
    open(object,page) {
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.changeTopButtons(true);
        this.context.showLoader();
        this.page = page||0;
        object = object || this.context.sceneGraph.currentScene;
        this.isTop = object === this.context.sceneGraph.currentScene;
        let editor = document.getElementById('editor');
        editor.setAttribute('material','color:#ffffff');
        editor.removeAttribute('physics-helper-update');
        this.context.physicsView.hideShapeHelpers();
        this.context.breadCrumbs.make(this.context.breadCrumbs.fromObject(object));
        this.isGroup = object.settings.type==="Object3D";
        this.is3dModel = object.settings.type==="Poly"||object.settings.type==="Custom";
        this.isAframe = object.settings.type==="Aframe";
        this.isLight = object.settings.type==="Light";
        this.isSprite = object.settings.type==="Sprite";
        this.isPortal = object.settings.type==="Portal";
        this.isEffect = object.settings.type==="Effect";
        this.isSound = object.settings.type==="Sound";
        if(this.isTop){
            this.context.displayBox.hide();
            this.context.viewUtils.hideTransformOptions();
        }else{
            this.context.viewUtils.showTransformOptions(false,(this.isLight&&object.settings.geometry.type==="RectAreaLight"),this.isLight);
        }
        if(!this.isLight)this.context.sceneGraph.hideLightHelper();
        this.context.currentObject = object;
        this.context.content.loadScreen('item-view',[
            'title-section',
            'shadow-settings',
            'three-number-inputs',
            'object-stats',
            'mobile-response',
            'single-item-button',
            'double-item-button',
            'side-item-add'
        ],true)
            .then(()=>this.hideNotNeeded())
            .then(()=>this.showTransformSettings(object))
            .then(()=>this.context.viewUtils.title(this.isTop?object.metadata.name:object.settings.name,object))
            .then(()=>this.context.viewUtils.stats(object))
            .then(()=>this.showMaterialAndGeometrySettings())
            .then(()=>this.setupSavePrefab())
            .then(()=>this.context.content.compileTemplates('single-item-button',[{
                title:'Behaviours',
                description:'Add/update behaviours on the scene',
                buttonText:'BEHAVIOURS',
                descriptionHeight:0.21,
            }]))
            .then(contents=>this.context.content.addTemplateItem('#behavioursContainer',contents[0]))
            .then(()=>{
                document.querySelector('#behavioursContainer').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.behavioursModal.open(object);
                });
            })
            .then(()=>this.setupTitleSection())
            .then(()=>this.setupRemoveObject())
            .then(()=>this.show3dModelSettings())
            .then(()=>this.showAframeSettings())
            .then(()=>this.showSpriteSettings())
            .then(()=>this.setupPortalSettings())
            .then(()=>this.setupClearScene())
            .then(()=>this.setupPhysics())
            .then(()=>this.setupAudioSettings())
            .then(()=>this.setupMobileResponse())
            .then(()=>this.setupShadowSettings())
            .then(()=>this.setupLightSettings())
            .then(()=>{
                let start = this.page*10;
                let end  = start+10;
                let children = this.context.currentObject.children.slice(start,end);
                return this.context.content.compileTemplates('side-item-add',[{
                    title:'Objects',
                    buttonText:'ADD OBJECT',
                    children:children.map(c=>this.context.viewUtils.childObject(c)),
                    page:this.page
                }])
            })
            .then(contents=>this.context.content.addTemplateItem('#childObjectsContainer',contents[0],true))
            .then(()=>this.setupChildren())
            .then(()=>this.setupAddItem())
            .then(()=>this.context.content.reloadContent())
            .then(()=>this.context.hideLoader())
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>this.context.content.container.setAttribute('visible',true));
    }
    setupSavePrefab(){
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Save Prefab',
            description:'Save this scene as a prefab to import it later',
            buttonText:'SAVE PREFAB',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#savePrefab',contents[0]))
            .then(()=>{
                document.querySelector('#savePrefab').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.savePrefabModal.open();
                });
            });
    }
    setupTitleSection(){
        let itemTitle = document.getElementById('itemTitle');
        let itemTitleEdit = document.getElementById('itemTitleEdit');
        let cancelEditItemTitle = document.getElementById('cancelEditItemTitle');
        let editItemTitle = document.getElementById('editItemTitle');
        let saveItemTitle = document.getElementById('saveItemTitle');
        let showHide = (showScale,hideScale)=>{
            itemTitle.setAttribute('scale',hideScale+' '+hideScale+' '+hideScale);
            itemTitleEdit.setAttribute('scale',showScale+' '+showScale+' '+showScale);
            cancelEditItemTitle.setAttribute('scale',showScale+' '+showScale+' '+showScale);
            editItemTitle.setAttribute('scale',hideScale+' '+hideScale+' '+hideScale);
            saveItemTitle.setAttribute('scale',showScale+' '+showScale+' '+showScale);
        };
        document.getElementById('editItemTitle').addEventListener('mousedown',()=>{
            showHide(1,0.00001);
            itemTitleEdit.value(this.isTop?this.context.currentObject.metadata.name:this.context.currentObject.settings.name);
            let component = itemTitleEdit.components["ui-input-text"];
            component.text.selectionStart = component.chars.length;
            setTimeout(()=>itemTitleEdit.focus(),100);
            document.getElementById('rig').components['smooth-wasd-controls'].pause();
        });
        cancelEditItemTitle.addEventListener('mousedown',()=>showHide(0.00001,1));
        saveItemTitle.addEventListener('mousedown',()=>{
            let value = itemTitleEdit.getValue();
            if(this.isTop){
                this.context.currentObject.metadata.name = value;
            }else{
                this.context.currentObject.settings.name = value;
            }
            if(this.isPortal){
                this.context.sceneGraph.objectFactory.makePortal(this.context.currentObject.settings);
                this.context.sceneGraph.objectFactory.resetAframeContainerItem(
                    this.context.currentObject.settings.uuid,
                    this.context.currentObject.settings.aframeCode
                );
            }
            itemTitle.setAttribute('value',value);
            showHide(0.00001,1);
        });
        document.getElementById('copyUuid')
            .addEventListener('mousedown',()=>{
                UI.utils.copyToClipboard(this.context.currentObject.settings.uuid);
            });
    }
    setupRemoveObject(){
        if(this.isTop)return;
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Remove',
            description:'Remove this object from the scene.',
            buttonText:'REMOVE OBJECT',
            buttonColor:'#e57373',
            buttonFontColor:'white',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#removeObject',contents[0]))
            .then(()=>{
                document.querySelector('#removeObject').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.removeObjectModal.open();
                });
            });

    }
    showMaterialAndGeometrySettings(){
        if(this.isTop||this.isGroup||this.is3dModel||this.isAframe||this.isLight||this.isSprite||this.isPortal||this.isEffect||this.isSound)return;
        let isPrimitive = this.context.currentObject.settings.type==="Primitive";
        let material = this.context.currentObject.settings.material;
        let geometry = this.context.currentObject.settings.geometry;
        return this.context.content.compileTemplates('double-item-button',[{
            title:'Material Settings: '+material.type.substr(4,material.type.length-12),
            description:'Change settings like color and opacity',
            buttonText:'CHANGE TYPE',
            buttonTwoText:'MATERIAL SETTINGS',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#materialSettings',contents[0]+
                `<a-ui-button class="intersectable doubleButton3" text-value="MAP SETTINGS" width="1.2" height="0.2" ripple-size="1.2 0.2" wrap-count="24" ui-modal="modal:#modalRenderer;main:#mainRenderer" font-color="#009688" color="white" ripple-color="#009688"></a-ui-button>
             <a-ui-button class="intersectable doubleButton4" text-value="REPEAT & OFFSET" width="1.2" height="0.2" ripple-size="1.2 0.2" wrap-count="24" ui-modal="modal:#modalRenderer;main:#mainRenderer" font-color="#009688" color="white" ripple-color="#009688"></a-ui-button>`))
            .then(()=>{
                document.querySelector('#materialSettings').querySelector('.doubleButton1').addEventListener('mousedown',()=>{
                    this.context.materialTypeModal.open();
                });
                document.querySelector('#materialSettings').querySelector('.doubleButton2').addEventListener('mousedown',()=>{
                    this.context.materialSettingsModal.open();
                });
                document.querySelector('#materialSettings').querySelector('.doubleButton3').addEventListener('mousedown',()=>{
                    this.context.mapSettingsModal.open();
                });
                document.querySelector('#materialSettings').querySelector('.doubleButton4').addEventListener('mousedown',()=>{
                    this.context.repeatSettingsModal.open();
                });
            })
            .then(()=>this.context.content.compileTemplates('double-item-button',[{
                title:'Geometry Settings: '+(isPrimitive?geometry.type
                    .replace('Geometry','')
                    .replace('Buffer','')
                    .replace('Inverted',''):'Parametric'),
                description:'Change the geometry settings for this object',
                buttonText:'CHANGE TYPE',
                buttonTwoText:'GEOMETRY SETTINGS',
                descriptionHeight:0.21,
            }]))
            .then(contents=>this.context.content.addTemplateItem('#geometrySettings',contents[0]))
            .then(()=>{
                document.querySelector('#geometrySettings').querySelector('.doubleButton1').addEventListener('mousedown',()=>{
                    this.context.geometryTypeModal.open();
                });
                document.querySelector('#geometrySettings').querySelector('.doubleButton2').addEventListener('mousedown',()=>{
                    this.context.geometrySettingsModal.open();
                });
            })
    }
    setupLightSettings(){
        if(!this.isLight)return;
        this.context.sceneGraph.showLightHelper();
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Light Settings',
            description:'Change setting associated with this light.',
            buttonText:'LIGHT SETTINGS',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#lightSettings',contents[0]))
            .then(()=>{
                document.querySelector('#lightSettings').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    switch(this.context.currentObject.settings.geometry.type){
                        case "AmbientLight":
                            this.context.lightSettingsAmbient.open(this.context.currentObject.settings.light);
                            break;
                        case "PointLight":
                            this.context.lightSettingsPoint.open(this.context.currentObject.settings.light);
                            break;
                        case "HemisphereLight":
                            this.context.lightSettingsHemisphere.open(this.context.currentObject.settings.light);
                            break;
                        case "DirectionalLight":
                            this.context.lightSettingsDirectional.open(this.context.currentObject.settings.light);
                            break;
                        case "RectAreaLight":
                            this.context.lightSettingsRectArea.open(this.context.currentObject.settings.light);
                            break;
                        case "SpotLight":
                            this.context.lightSettingsSpot.open(this.context.currentObject.settings.light);
                            break;
                    }
                });
            });
    }
    setupShadowSettings(){
        if(this.isTop||this.isGroup||this.isAframe||this.isLight||this.isSprite||this.isPortal||this.isEffect||this.isSound)return;
        return this.context.content.compileTemplates('shadow-settings',[{
            shadow:this.context.currentObject.shadow
        }])
            .then(contents=>this.context.content.addTemplateItem('#shadowSettings',contents[0]))
            .then(()=>{
                let shadowCast = document.querySelector('.shadowCast');
                let shadowReceive = document.querySelector('.shadowReceive');
                shadowCast.addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.shadow.cast = shadowCast.getValue();
                    this.context.currentObject.object3D.castShadow = shadowCast.getValue();
                });
                shadowReceive.addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.shadow.receive = shadowReceive.getValue();
                    this.context.currentObject.object3D.receiveShadow = shadowCast.getValue();
                });
            });
    }
    setupMobileResponse(){
        if(this.isTop) return;
        return this.context.content.compileTemplates('mobile-response',[{
            hide_on_mobile:this.context.currentObject.settings.hide_on_mobile,
            hide_on_desktop:this.context.currentObject.settings.hide_on_desktop
        }])
            .then(contents=>this.context.content.addTemplateItem('#mobileSettings',contents[0]))
            .then(()=>{
                let hideOnMobile = document.querySelector('.hideOnMobile');
                let hideOnDesktop = document.querySelector('.hideOnDesktop');
                hideOnMobile.addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.hide_on_mobile = hideOnMobile.getValue();
                });
                hideOnDesktop.addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.hide_on_desktop = hideOnDesktop.getValue();
                });

            });
    }
    setupPhysics(){
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Physics Settings',
            description: 'Change physics settings and reate physics shapes on this object.',
            buttonText: 'PHYSICS SETTINGS',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#physicsSettings', contents[0]))
            .then(()=>{
                let modalButton = document.querySelector('#physicsSettings').querySelector('.singleButton');
                modalButton.removeAttribute('ui-modal');
                modalButton.addEventListener('mousedown',()=>{
                    this.context.physicsView.open();
                });
            })
    }
    setupAudioSettings(){
        if(!this.isSound) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Sound Settings',
            description: 'Change the sound settings for this sound object.',
            buttonText: 'EDIT SOUND',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#soundSettings', contents[0]))
            .then(()=>{
                document.querySelector('#soundSettings').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.soundModal.open();
                });
            })
    }
    setupPortalSettings(){
        if(!this.isPortal) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Portal Settings',
            description: 'Change the image and space for this portal.',
            buttonText: 'EDIT PORTAL',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#portalSettings', contents[0]))
            .then(()=>{
                document.querySelector('#portalSettings').querySelector('.singleButton').addEventListener('mousedown',()=>{

                    this.context.portalModal.open(this.context.currentObject.settings.portal,true,this.context.currentObject.settings.name);
                });
            })
    }
    setupClearScene(){
        if(!this.isTop) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Clear Scene',
            description: 'Clear everything out of this scene',
            buttonText: 'CLEAR EVERYTHING',
            buttonColor:'#e57373',
            buttonFontColor:'white',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#clearScene', contents[0]))
            .then(()=>{
                document.querySelector('#clearScene').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.clearSceneModal.open();
                });
            })
    }
    showTransformSettings(){
        if(this.isTop)return;
        return this.context.content.compileTemplates('single-item-button',[{
            title:'Object Transform',
            description:'Change position, rotation and scale settings',
            buttonText:'TRANSFORM SETTINGS',
            descriptionHeight:0.21,
        }])
            .then(contents=>this.context.content.addTemplateItem('#transformSettings',contents[0]))
            .then(()=>{
                document.querySelector('#transformSettings').querySelector('.singleButton').addEventListener('mousedown',()=>{
                    this.context.transformModal.open();
                });
            });
    }
    showSpriteSettings(){
        if(!this.isSprite) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Sprite Settings',
            description: 'Adjust the material settings for this sprite.',
            buttonText: 'SPRITE SETTINGS',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#spriteSettings', contents[0]))
            .then(()=>{
                document.querySelector('#spriteSettings')
                    .querySelector('.singleButton')
                    .addEventListener('mousedown',()=>this.context.spriteModalSettings.open());
            });
    }
    show3dModelSettings(){
        if(!this.is3dModel) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Model Settings',
            description: 'Adjust the urls of this model.',
            buttonText: 'MODEL SETTINGS',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#modelSettings', contents[0]))
            .then(()=>{
                document.querySelector('#modelSettings')
                    .querySelector('.singleButton')
                    .addEventListener('mousedown',()=>this.context.editModelSettings.open());
            });
    }
    showAframeSettings(){
        if(!this.isAframe) return;
        return this.context.content.compileTemplates('single-item-button', [{
            title: 'Aframe Settings',
            description: 'Update the Aframe code.',
            buttonText: 'AFRAME CODE',
            descriptionHeight: 0.21,
        }])
            .then(contents => this.context.content.addTemplateItem('#aframeSettings', contents[0]))
            .then(()=>{
                let settingsButton = document.querySelector('#aframeSettings').querySelector('.singleButton');
                settingsButton.removeAttribute('ui-modal');
                settingsButton.addEventListener('mousedown',()=>{
                    this.context.sceneEl.emit('openAframe',{
                        name:this.context.currentObject.settings.name,
                        definition:this.context.currentObject.settings.aframeCode,
                        aframe_id:this.context.currentObject.settings.uuid
                    });
                });
            });
    }
    setupAddItem(){
        let loadButton = document.querySelector('#childObjectsContainer').querySelector('.loadItem');
        loadButton.addEventListener('mousedown', e => {
            this.context.objectTypeModal.open();
        });
    }
    setupChildren(){
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
                for(let i =0; i < this.context.currentObject.children.length; i++){
                    let _child = this.context.currentObject.children[i]
                    if(_child.settings.uuid===openButton.dataset.uuid){
                        child = _child;
                    }
                }
                if(child){
                    if(child.settings.type==="Light"){
                        if(~["DirectionalLight","SpotLight","RectAreaLight","PointLight"].indexOf(this.context.currentObject.settings.geometry.type)){
                            this.context.displayBox.setObject(child.object3D);
                        }
                    }else{
                        this.context.displayBox.setObject(child.object3D);
                    }
                    this.context.itemView.open(child);
                }
            })
        }
    }
    hideNotNeeded(){
        if(this.isTop){
            this.removeSection('transformSettings');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('mobileSettings');
            this.removeSection('modelSettings');
            this.removeSection('aframeSettings');
            this.removeSection('lightSettings');
            this.removeSection('shadowSettings');
            this.removeSection('spriteSettings');
            this.removeSection('portalSettings');
        }else if(this.isGroup){
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('modelSettings');
            this.removeSection('aframeSettings');
            this.removeSection('lightSettings');
            this.removeSection('shadowSettings');
            this.removeSection('spriteSettings');
            this.removeSection('portalSettings');
        }else if(this.isAframe){
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('modelSettings');
            this.removeSection('shadowSettings');
            this.removeSection('spriteSettings');
            this.removeSection('portalSettings');
        }else if(this.isLight){
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('modelSettings');
            this.removeSection('aframeSettings');
            this.removeSection('shadowSettings');
            this.removeSection('spriteSettings');
            this.removeSection('portalSettings');
        }else if(this.is3dModel){
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('aframeSettings');
            this.removeSection('lightSettings');
            this.removeSection('spriteSettings');
            this.removeSection('portalSettings');
        }else if(this.isSprite){
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('modelSettings');
            this.removeSection('aframeSettings');
            this.removeSection('shadowSettings');
            this.removeSection('lightSettings');
            this.removeSection('portalSettings');
        }else if(this.isPortal||this.isEffect||this.isSound){
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('geometrySettings');
            this.removeSection('materialSettings');
            this.removeSection('modelSettings');
            this.removeSection('aframeSettings');
            this.removeSection('shadowSettings');
            this.removeSection('lightSettings');
            this.removeSection('spriteSettings');
        }else{
            this.removeSection('clearScene');
            this.removeSection('sceneSettings');
            this.removeSection('modelSettings');
            this.removeSection('aframeSettings');
            this.removeSection('lightSettings');
            this.removeSection('spriteSettings');
            this.removeSection('portalSettings');
        }
    }
    removeSection(id){
        let item = document.getElementById(id);
        item.parentElement.removeChild(item);
    }
}