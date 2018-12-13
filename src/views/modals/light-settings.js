export class LightSettings{
    constructor(context){
        this.context = context;
    }
    settingsTitleWrap(title,wrapCount){
        return `<a-text font="roboto" baseLine="top" anchor="center" value="`+title+`"
        color="#212121" wrap-count="`+(wrapCount||35)+`" width="2.9" height="0.2"></a-text>
        <a-plane width="2.9" height="0.004" color="#8f8f8f" shader="flat"></a-plane>
        <a-entity width="2.9" height="0.1"></a-entity>`;
    }
    wrapSettings(contents){
        return `<a-entity width="1.4">`+contents+`</a-entity>`;
    }
    baseSettings(lightSettings){
        return this.context.content.compileTemplates('color-intensity',[{name:'Color & Intensity',color:lightSettings.color,intensity:lightSettings.intensity}],true)
    }
    setupBaseUpdate(){
        this.context.viewUtils.setupColorUpdate('.colorIntensityInput','color');
        this.context.viewUtils.setupNumberUpdate('light','.colorintensity','intensity');
    }
    shadowSettings(lightSettings){
        let _contents = '';
        return this.context.content.compileTemplates('switches',[{settings:[{name:'Cast Shadow',selected:lightSettings.castShadow}]}],true)
            .then(contents=>_contents+=this.settingsTitleWrap('Shadow',55)+this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Camera Near',number:lightSettings.camera.near}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Map Width',number:lightSettings.mapSize.width}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Camera Far',number:lightSettings.camera.far}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Map Height',number:lightSettings.mapSize.height}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Camera FOV',number:lightSettings.camera.fov}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>_contents);
    }
    setupShadowUpdate(){
        this.context.content.popup.querySelector('.switch-castshadow')
            .addEventListener('ui-switch-changed',e=>{
                this.context.currentObject.settings.light.castShadow=e.detail;
                this.context.currentObject.object3D.castShadow=
                    this.context.currentObject.settings.light.castShadow;
            });
        this.context.viewUtils.setupNumberUpdate('light','.mapwidth','mapSize.width');
        this.context.viewUtils.setupNumberUpdate('light','.mapheight','mapSize.height');
        this.context.viewUtils.setupNumberUpdate('light','.cameranear','camera.near');
        this.context.viewUtils.setupNumberUpdate('light','.camerafar','camera.far');
        this.context.viewUtils.setupNumberUpdate('light','.camerafov','camera.fov');
    }
    setupTransformButtonGroup(parent){
        this.setupTransformButton(parent,'.xInputUp','x',1);
        this.setupTransformButton(parent,'.xInputDown','x',-1);
        this.setupTransformButton(parent,'.yInputUp','y',1);
        this.setupTransformButton(parent,'.yInputDown','y',-1);
        this.setupTransformButton(parent,'.zInputUp','z',1);
        this.setupTransformButton(parent,'.zInputDown','z',-1);
        parent.querySelector('.reset-values').addEventListener('mousedown',()=>{
            let value = 0;
            this.context.currentObject.object3D.target.position.set(value,value,value);
            this.context.currentObject.object3D.target.updateMatrixWorld();
            this.lightTargetUpdate();
        });
    }
    setupTransformButton(parent,selector,axis,direction){
        let button = parent.querySelector(selector);
        button.addEventListener('mousedown',()=>{
            this.context.currentObject.object3D.target.position[axis]+=this.context.precision*direction;
            this.context.currentObject.object3D.target.updateMatrixWorld();
            this.lightTargetUpdate();
        });
    }
    setupTransformListeners(){
        let positionSettings = document.querySelector('.targetSettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.lightTargetUpdate = ()=>{
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            let position = this.context.currentObject.object3D.target.position;
            positionSettings.querySelector('.xInput').setAttribute('text','value:'+(position.x).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.yInput').setAttribute('text','value:'+(position.y).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.zInput').setAttribute('text','value:'+(position.z).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
            this.context.currentObject.settings.state.updated = true;
            this.context.sceneGraph.sync();
        };
    }
}