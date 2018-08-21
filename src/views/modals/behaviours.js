export class BehavioursModal{
    constructor(context) {
        this.context = context;
    }
    open() {
        this.context.content.loadTemplates(['confirm-message'])
            .then(()=>this.context.content.compileTemplates('confirm-message',[{
                title:'Behaviours',
                message:'Select a behaviour to edit.',
                leftButtonText:'CANCEL',
                rightButtonText:'EDIT',
            }],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]));
    }
}