export class ViewUtils{
    constructor(context){
        this.context = context;
    }
    title(name,uuid){
        return this.context.content.compileTemplates('title-section',[{name:name,uuid:uuid}],true)
            .then(contents=>this.context.content.addTemplateItem('#titleSection',contents[0]))
    }
    async stats(object){
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
    showTransformOptions(shouldHide){
        document.getElementById('positionButton').parentElement.setAttribute('visible',!!!shouldHide);
        document.getElementById('rotationButton').parentElement.setAttribute('visible',!!!shouldHide);
        document.getElementById('scaleButton').parentElement.setAttribute('visible',!!!shouldHide);
    }
    childObject(child){
        let icon_path = 'images/icons/objects/';
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

    setupNumberUpdate(object,cssClass,field,isDegrees){
        let upButton = this.context.content.popup.querySelector(cssClass)
            .querySelector('.xInputUp');
        let downButton = this.context.content.popup.querySelector(cssClass)
            .querySelector('.xInputDown');
        let text = this.context.content.popup.querySelector(cssClass)
            .querySelector('.xText');
        upButton.addEventListener('mousedown',()=>{
            this.context.currentObject.settings[object][field]+=this.context.precision;
            this.context.currentObject.object3D[object][field]=isDegrees?
                THREE.Math.degToRad(this.context.currentObject.settings[object][field]):
                this.context.currentObject.settings[object][field];

            text.setAttribute('text','value:'+(this.context.currentObject.settings[object][field]).toFixed(3));
            if(object==="geometry"){
                this.context.sceneGraph.objectFactory.resetGeometry();
                this.context.displayBox.setObject(this.context.currentObject.object3D);
            }
        });
        downButton.addEventListener('mousedown',()=>{

            this.context.currentObject.settings[object][field]-=this.context.precision;
            this.context.currentObject.object3D[object][field]=
                this.context.currentObject.settings[object][field];

            text.setAttribute('text','value:'+(this.context.currentObject.settings[object][field]).toFixed(3));
            if(object==="geometry"){
                this.context.sceneGraph.objectFactory.resetGeometry();
                this.context.displayBox.setObject(this.context.currentObject.object3D);
            }
        });
    }

    setupRadioInput(cssClass,callback){

        this.context.content.popup.querySelector(cssClass)
            .addEventListener('ui-radio-changed',e=>{
                callback(e.detail);
            })
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