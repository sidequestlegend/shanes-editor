export class TransformModal{
    constructor(context){
        this.context = context;
        this.startSection = `
            <a-text font="roboto" baseLine="top" anchor="center" 
            value="Object Transform Settings"
                    color="#212121" wrap-count="26" width="1.35" height="0.15"></a-text>
            <a-plane width="2.9" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="2.9">`;

        this.endSection = '</a-entity>';

    }
    open(){
        let object = this.context.currentObject;
        let rotation = object.settings.transform.rotation;


        this.context.content.compileTemplates('three-number-inputs',[
            {name:'Position',vector:object.settings.transform.position,className:'positionSettings'},
            {name:'Rotation',vector:{x:THREE.Math.radToDeg(rotation.x),y:THREE.Math.radToDeg(rotation.y),z:THREE.Math.radToDeg(rotation.z)},className:'rotationSettings'},
            {name:'Scale',vector:object.settings.transform.scale,className:'scaleSettings'}
        ])
            .then(contents=>{
                this.context.content.popup.setContent(this.startSection+contents[0]+contents[1]+contents[2]+this.endSection);
                this.setupTransformListeners();
                this.setupTransformButtons();
            })
    }
    setupTransformButtons(){

        let positionSettings = document.querySelector('.positionSettings');
        let rotationSettings = document.querySelector('.rotationSettings');
        let scaleSettings = document.querySelector('.scaleSettings');
        this.setupTransformButtonGroup(positionSettings,'position');
        this.setupTransformButtonGroup(rotationSettings,'rotation');
        this.setupTransformButtonGroup(scaleSettings,'scale');
    }
    setupTransformButtonGroup(parent,type){
        this.setupTransformButton(parent,'.xInputUp','x',1,type);
        this.setupTransformButton(parent,'.xInputDown','x',-1,type);
        this.setupTransformButton(parent,'.yInputUp','y',1,type);
        this.setupTransformButton(parent,'.yInputDown','y',-1,type);
        this.setupTransformButton(parent,'.zInputUp','z',1,type);
        this.setupTransformButton(parent,'.zInputDown','z',-1,type);
        parent.querySelector('.reset-values').addEventListener('mousedown',()=>{
            let value = 0;
            if(type==="scale"){
                value = 1
            }
            this.context.currentObject.settings.transform[type] = {x:value,y:value,z:value};
            this.context.currentObject.object3D[type].set(value,value,value);
            this.context.transformUpdate();
            this.context.displayBox.setObject(this.context.currentObject.object3D);
        });
    }
    setupTransformButton(parent,selector,axis,direction,type){
        let button = parent.querySelector(selector);
        button.addEventListener('mousedown',()=>{
            let value = this.context.precision*direction;
            if(type==="rotation"){
                value = THREE.Math.degToRad(value);
            }
            this.context.currentObject.settings.transform[type][axis]+=value;
            this.context.currentObject.object3D[type][axis]+=value;
            this.context.transformUpdate();
            this.context.displayBox.setObject(this.context.currentObject.object3D);
        });
    }
    setupTransformListeners(){
        let positionSettings = document.querySelector('.positionSettings');
        let rotationSettings = document.querySelector('.rotationSettings');
        let scaleSettings = document.querySelector('.scaleSettings');
        let extraTextSettings = ';color:#212121;wrapCount:12;align:center';
        this.context.transformUpdate = ()=>{
            UI.utils.isChanging(this.context.sceneEl,this.context.currentObject.settings.uuid);
            let position = this.context.currentObject.settings.transform.position,
                rotation = this.context.currentObject.settings.transform.rotation,
                scale = this.context.currentObject.settings.transform.scale;

            positionSettings.querySelector('.xInput').setAttribute('text','value:'+(position.x).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.yInput').setAttribute('text','value:'+(position.y).toFixed(3)+extraTextSettings);
            positionSettings.querySelector('.zInput').setAttribute('text','value:'+(position.z).toFixed(3)+extraTextSettings);
            rotationSettings.querySelector('.xInput')
                .setAttribute('text','value:'+(THREE.Math.radToDeg(rotation.x)).toFixed(3)+extraTextSettings);
            rotationSettings.querySelector('.yInput')
                .setAttribute('text','value:'+(THREE.Math.radToDeg(rotation.y)).toFixed(3)+extraTextSettings);
            rotationSettings.querySelector('.zInput')
                .setAttribute('text','value:'+(THREE.Math.radToDeg(rotation.z)).toFixed(3)+extraTextSettings);


            scaleSettings.querySelector('.xInput').setAttribute('text','value:'+(scale.x).toFixed(3)+extraTextSettings);
            scaleSettings.querySelector('.yInput').setAttribute('text','value:'+(scale.y).toFixed(3)+extraTextSettings);
            scaleSettings.querySelector('.zInput').setAttribute('text','value:'+(scale.z).toFixed(3)+extraTextSettings);
            UI.utils.stoppedChanging(this.context.currentObject.settings.uuid);
        };
    }
}