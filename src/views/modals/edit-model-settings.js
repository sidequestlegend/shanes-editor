export class EditModelSettings{
    constructor(context){
        this.context = context;
    }
    open(){
        let object = {
            type:this.context.currentObject.settings.geometry.type,
            url:this.context.currentObject.settings.url,
            mtl_url:this.context.currentObject.settings.mtl_url,
            mtl_path:this.context.currentObject.settings.mtl_path,
            preserve:this.context.currentObject.settings.preserve_scale,
            disableAnimations:this.context.currentObject.settings.disable_animations
        };
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('edit-model-settings',[object],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                this.context.content.popup.querySelector('.cancelEditModel').addEventListener('mousedown',()=>{
                    this.uiRenderer.modal.close();
                });
                this.context.content.popup.querySelector('.saveModelButton').addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.disable_animations = this.context.content.popup.querySelector('.animationDisable').getValue();
                    this.context.currentObject.settings.preserve_scale = this.context.content.popup.querySelector('.preserveEnable').getValue();
                    this.context.currentObject.settings.url = this.context.content.popup.querySelector('#mainModelUrl').getValue();
                    let mtl_url = this.context.content.popup.querySelector('#mainMTLUrl');
                    let mtl_path = this.context.content.popup.querySelector('#mainMTLPath');
                    if(mtl_url){
                        this.context.currentObject.settings.mtl_url = mtl_url.getValue();
                    }
                    if(mtl_path){
                        this.context.currentObject.settings.mtl_path = mtl_path.getValue();
                    }
                    UI.utils.clearObject(this.context.currentObject.object3D);
                    let parent = this.context.currentObject.object3D.parent;
                    parent.remove(this.context.currentObject.object3D);
                    delete this.context.currentObject.object3D;
                    return this.context.sceneGraph.objectFactory.make(this.context.currentObject).then(object=>{
                        if(object){
                            parent.add(object);
                            this.context.currentObject.object3D = object;
                            object.userData.sceneObject = this.context.currentObject;
                            this.context.showObject();
                            this.context.displayBox.setObject(object);
                            this.uiRenderer.modal.close();
                            this.context.sceneGraph.sync();
                        }
                    });
                })
            });
    }
}