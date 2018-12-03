export class Models{
    constructor(context){
        this.context = context;
    }
    addModel(object){
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.modelSettings.open({
            type:"Custom",
            sub_type:object.sub_type,
            url:object.url,
            mtl_url:object.mtl_url,
            mtl_path:object.mtl_path
        },object=>this.context.sceneGraph.add(this.context.currentObject,object)
            .then(child=>{
                this.context.showObject();
                this.context.displayBox.setObject(child.object3D);
                setTimeout(()=>this.context.itemView.open(child),250);
                this.uiRenderer.modal.close();
            }));
    }
}