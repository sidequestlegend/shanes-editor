export class SoundModal {
    constructor(context) {
        this.context = context;
    }

    open() {
        this.startSection = `
            <a-text font="roboto" baseLine="top" anchor="center" 
            value="Sound Settings"
                    color="#212121" wrap-count="26" width="1.35" height="0.15"></a-text>
            <a-plane width="2.9" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.35">`;

        this.midSection = `
            </a-entity>
            <a-plane width="0.01" height="1.6" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.35">`;

        this.endSection = '</a-entity>';
        this.templates = {
            url:[{url:this.context.currentObject.settings.url}],
            switches:[
                {settings:[{name:'Loop',selected:this.context.currentObject.settings.sound.loop}]},
                {settings:[{name:'Auto Play',selected:this.context.currentObject.settings.sound.autoPlay}
                ]}],
            radios:[
                {name:'Distance Model',selected:this.context.currentObject.settings.sound.distanceModel.charAt(0).toUpperCase() +
                    this.context.currentObject.settings.sound.distanceModel.substr(1),
                    settings:[{name:'Linear'},{name:'Inverse'},{name:'Exponential'}]}],
            number:[
                {name:'Max Distance',number:this.context.currentObject.settings.sound.maxDistance},
                {name:'Ref Distance',number:this.context.currentObject.settings.sound.refDistance},
                {name:'Rolloff Factor',number:this.context.currentObject.settings.sound.rolloffFactor},
                {name:'Volume',number:this.context.currentObject.settings.sound.volume},
                {name:'Inner Angle',number:THREE.Math.radToDeg(this.context.currentObject.settings.sound.innerAngle)},
                {name:'Outer Angle',number:THREE.Math.radToDeg(this.context.currentObject.settings.sound.outerAngle)},
                {name:'Outer Gain',number:this.context.currentObject.settings.sound.outerGain}
            ],
        };
        return this.context.content.loadTemplates([
            'sound-url',
            'radios',
            'switches',
            'number'
        ])
            .then(()=>this.compile())
            .then(contents=>{
                let loop = contents[0].shift();
                let autoPlay = contents[0].shift();
                let distanceModel = contents[1].shift();
                let maxDistance = contents[2].shift();
                let refDistance = contents[2].shift();
                let rolloffFactor = contents[2].shift();
                let volume = contents[2].shift();
                let innerAngle = contents[2].shift();
                let outerAngle = contents[2].shift();
                let outerGain = contents[2].shift();
                let soundUrl = contents[3].shift();
                let fullContents = this.startSection+soundUrl+autoPlay+loop+volume+rolloffFactor+
                    this.midSection+distanceModel+maxDistance+refDistance+innerAngle+outerAngle+outerGain+this.endSection;
                return this.context.content.popup.setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('sound','.maxdistance','maxDistance');
                this.context.viewUtils.setupNumberUpdate('sound','.refdistance','refDistance');
                this.context.viewUtils.setupNumberUpdate('sound','.rollofffactor','rolloffFactor');
                this.context.viewUtils.setupNumberUpdate('sound','.innerangle','innerAngle');
                this.context.viewUtils.setupNumberUpdate('sound','.outerangle','outerAngle');
                this.context.viewUtils.setupNumberUpdate('sound','.outergain','outerGain');
                this.context.viewUtils.setupNumberUpdate('sound','.volume','volume');
                let updateDistanceModel = model=>{
                    model = model.toLowerCase();
                    this.context.currentObject.settings.sound.distanceModel = model;
                    this.context.currentObject.object3D.setDistanceModel(model);
                };
                this.context.viewUtils.setupRadioInput('.radio-linear',updateDistanceModel);
                this.context.viewUtils.setupRadioInput('.radio-inverse',updateDistanceModel);
                this.context.viewUtils.setupRadioInput('.radio-exponential',updateDistanceModel);
                this.context.viewUtils.setupSwitcheInput('sound','.switch-loop','loop');
                this.context.viewUtils.setupSwitcheInput('sound','.switch-autoplay','autoPlay');
                this.context.content.popup.querySelector('.load-audio').addEventListener('mousedown',()=>{
                    this.context.popupBackStack.push(()=>this.open());
                    document.getElementById('backButton').setAttribute('scale','1 1 1');
                    this.context.loadAudioModal.open();
                });
                this.context.content.popup.querySelector('.save-audio').addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.url = this.context.content.popup.querySelector('.audioUrl').getValue();
                    this.context.sceneGraph.objectFactory.resetSound(this.context.currentObject.object3D);
                });
                this.context.content.popup.querySelector('.play-audio').addEventListener('mousedown',()=>{
                    if(!this.context.currentObject.object3D.isPlaying)this.context.currentObject.object3D.play();
                });
                this.context.content.popup.querySelector('.stop-audio').addEventListener('mousedown',()=>{
                    if(this.context.currentObject.object3D.isPlaying)this.context.currentObject.object3D.stop();
                });

            })
    }
    async compile(){
        return Promise.all([
            this.context.content.compileTemplates('switches',this.templates.switches),
            this.context.content.compileTemplates('radios',this.templates.radios),
            this.context.content.compileTemplates('number',this.templates.number),
            this.context.content.compileTemplates('sound-url',this.templates.url),
        ]);
    }
}