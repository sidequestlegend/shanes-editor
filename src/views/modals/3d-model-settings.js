export class ModelSettings{
    constructor(context){
        this.context = context;
    }
    open(object,callback){
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('3d-model-settings',[{}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                this.context.content.popup.querySelector('.cancelAddCustom').addEventListener('mousedown',()=> {
                    this.uiRenderer.modal.close();
                });
                this.context.content.popup.querySelector('.addToSceneButton').addEventListener('mousedown',()=>{
                    object.disable_animations = this.context.content.popup.querySelector('.animationDisable').getValue();
                    object.preserve_scale = this.context.content.popup.querySelector('.preserveEnable').getValue();
                    callback(object);
                })
            });
    }
}