export class SavePrefabModal{
    constructor(context) {
        this.context = context;
    }
    open() {
        this.context.content.loadTemplates(['confirm-message'])
            .then(()=>this.context.content.compileTemplates('confirm-message',[{
                title:'Save Prefab',
                message:'Are you sure save this as a prefab object?',
                leftButtonText:'CANCEL',
                rightButtonText:'SAVE',
                middleButtonText:'SAVE & PUBLISH',
            }],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                this.context.content.popup.querySelector('.close-modal').addEventListener('mousedown',()=>{
                    console.log('prefab close');
                })
            });
    }
}