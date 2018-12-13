export class EffectModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Fire',friendly_name:'Fire',image_url:'#objects_effects'},
            {name:'Explosion',friendly_name:'Explosion',image_url:'#objects_effects'},
            {name:'Fireworks',friendly_name:'Fireworks',image_url:'#objects_effects'},
            {name:'RingOfFire',friendly_name:'Ring Of Fire',image_url:'#objects_effects'},
            {name:'Smoke',friendly_name:'Smoke',image_url:'#objects_effects'},
            {name:'Fog',friendly_name:'Fog',image_url:'#objects_effects'},
            {name:'Steam',friendly_name:'Steam',image_url:'#objects_effects'},
            {name:'Fountain',friendly_name:'Fountain',image_url:'#objects_effects'},
            {name:'Rain',friendly_name:'Rain',image_url:'#objects_effects'},
            {name:'Snow',friendly_name:'Snow',image_url:'#objects_effects'},
            {name:'Sparkler',friendly_name:'Sparkler',image_url:'#objects_effects'}
        ]
    }
    open(){
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-items'])
            .then(()=>this.context.content.compileTemplates('add-items',[{items:this.types,hidePages:true}],true))
            .then(contents=>{
                this.context.content.popup.setContent(contents[0]);
            })
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=> {
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for (let i = 0; i < buttons.length; i++) {
                    let button = buttons[i];
                    button.addEventListener('mousedown', () => {
                        this.context.popupBackStack.push(() => this.open());
                        document.getElementById('backButton').setAttribute('scale', '1 1 1');
                            this.context.sceneGraph.add(this.context.currentObject,{
                                type:"Effect",
                                sub_type:button.dataset.key
                            })
                                .then(child=>{
                                    setTimeout(()=>{
                                        this.context.itemView.open(child);
                                        this.context.sceneGraph.sync();
                                    },250);
                                    this.uiRenderer.modal.close();
                                });
                    });
                }
            });
    }
}