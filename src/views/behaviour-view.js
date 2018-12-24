export class BehaviourView {
    constructor(context) {
        this.context = context;
        this.triggerElements = [
            'radio-autoEveryone','radio-autoMod','radio-autoNoMod',
            'radio-enterEveryone','radio-enterMod','radio-enterNoMod',
            'radio-clickEveryone','radio-clickMod','radio-clickNoMod',
            'radio-exitEveryone','radio-exitMod','radio-exitNoMod',
            'radio-toggleEveryone','radio-toggleMod','radio-toggleNoMod',
        ];
    }
    open(object,behaviour){
        this.object = object;
        this.behaviour = behaviour = behaviour || this.context.sceneGraph.behaviourFactory.makeBehaviour();
        this.context.content.container.setAttribute('visible',false);
        let breadcrumbs = object?this.context.breadCrumbs.fromObject(object):[{name:'My Stuff',callback:()=>this.context.sceneEl.emit('scene-list',{page:0,search:'',type:'scene'}),isTop:true}];
        breadcrumbs.push({name:'Edit Behaviour',callback:()=>{},isTop:false});
        this.context.breadCrumbs.make(breadcrumbs);
        this.settings = {
            name:behaviour.name,
            description:behaviour.description,
            image:behaviour.image,
            trigger:behaviour.trigger,
            is_public:behaviour.is_public,
            obfuscate:behaviour.obfuscate,
            sync:behaviour.sync,
        };
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadScreen('behaviour-view',['behaviour-details','behaviour-trigger-sync'],true)
            .then(()=>this.context.content.compileTemplates('behaviour-details',[{behaviour:this.settings}]))
            .then(contents=>this.context.content.addTemplateItem('#behaviourDetails',contents[0],true))
            .then(()=>this.context.content.compileTemplates('behaviour-trigger-sync',[{behaviour:this.settings}]))
            .then(contents=>this.context.content.addTemplateItem('#behaviourTrigger',contents[0],true))
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>this.context.content.reloadContent())
            .then(()=>{
                let saveButtons = document.querySelectorAll('.saveBehaviour');
                saveButtons[0].addEventListener('mousedown',()=>this.saveBehaviour());
                saveButtons[1].addEventListener('mousedown',()=>this.saveBehaviour());
                let updateTrigger = selectedTrigger=>this.settings.trigger = selectedTrigger;
                for(let i = 0; i < this.triggerElements.length; i++){
                    this.setupRadioInput('.'+this.triggerElements[i],updateTrigger);
                }
                this.setupSwitchInput('#syncTrigger',this.settings,'sync');
                this.setupSwitchInput('#isPublic',this.settings,'is_public');
                this.setupSwitchInput('#isObfuscated',this.settings,'obfuscate');
                this.setupEditButton();
            })
            .then(()=>this.context.content.container.setAttribute('visible',true));
    }
    setupEditButton(){
        if(this.behaviour.behaviours_id){
            this.context.content.container.querySelector('.editCodeButton')
                .addEventListener('mousedown',e=>{
                    this.context.sceneEl.emit('openBehaviour',this.behaviour);
                })
        }else{
            this.context.content.container.querySelector('.editCodeButton').setAttribute('scale','0.00001 0.00001 0.00001');
        }
    }
    setupRadioInput(cssClass,callback){
        this.context.content.container.querySelector(cssClass)
            .addEventListener('ui-radio-changed',e=>{
                callback(e.detail);
            })
    }
    setupSwitchInput(cssClass,behaviour,field){
        this.context.content.container.querySelector(cssClass)
            .addEventListener('ui-switch-changed',e=>{
                behaviour[field]=e.detail;
            });
    }
    saveBehaviour(){
        this.behaviour.is_public = this.settings.is_public;
        this.behaviour.obfuscate = this.settings.obfuscate;
        this.behaviour.sync = this.settings.sync;
        this.behaviour.trigger = this.settings.trigger;
        this.behaviour.name = document.getElementById('behaviourName').getValue();
        this.behaviour.description = document.getElementById('behaviourDescription').getValue();
        this.behaviour.image = document.getElementById('behaviourImage').getValue();
        this.context.sceneEl.emit('saveBehaviour',this.behaviour);
        if(this.object){
            this.context.itemView.open(this.object);
        }else{
            this.context.sceneEl.emit('scene-list',{page:0,search:'',type:'behaviour'})
        }
    }
}