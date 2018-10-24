export class ImportBehavioursModal{
    constructor(context) {
        this.context = context;
    }
    open(behaviours,existingIds){
        this.openCloseModal();
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['import-behaviour'])
            .then(()=>this.context.content.compileTemplates('import-behaviour',[{behaviours:behaviours}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>{
                document.querySelector('.cancelImportBehaviours').addEventListener('click',()=>{
                    this.removeBehaviours(behaviours);
                    this.openCloseModal(true);
                });
                document.querySelector('.close-modal').addEventListener('click',()=>{
                    this.removeBehaviours(behaviours);
                    this.openCloseModal(true);
                });
                document.querySelector('.importBehaviours').addEventListener('click',()=>{
                    this.save(behaviours);
                    this.openCloseModal(true);
                });
            });
    }
    removeBehaviours(behaviours){
        this.context.sceneGraph.behaviourFactory.cancelImportBehaviours(behaviours);
    }
    save(behaviours){
        let saveBehaviours = [];
        let removeBehaviours = [];
        for(let i = 0; i < behaviours.length; i++){
            let uiSwitch = document.querySelector('.switch-'+behaviours[i].behaviours_id);
            if(uiSwitch.getValue()){
                saveBehaviours.push(behaviours[i]);
            }else{
                removeBehaviours.push(behaviours[i]);
            }
        }
        if(saveBehaviours.length){
            this.context.sceneEl.emit('import-behaviours',saveBehaviours);
        }
        if(removeBehaviours.length){
            this.removeBehaviours(removeBehaviours);
        }
    }
    openCloseModal(isClose){
        document.querySelector('[ui-modal]')[isClose?'close':'open']();
    }
}