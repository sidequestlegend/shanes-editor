export class AddPrefabList{
    constructor(context){
        this.context = context;
    }
    open(page){
        page = page || 0;
        this.uiRenderer = document.getElementById('mainRenderer');
        return new Promise(resolve=>this.context.sceneEl.emit('list-add-prefab',{page,resolve}))
            .then(prefabs=>{
                this.prefabs = prefabs;
                return this.context.content.compileTemplates('add-prefab-list',[{prefabs,page}],true)
            })
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.loadPrefab');
                for(let i = 0 ; i <  buttons.length; i++) {
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        for(let i = 0; i < this.prefabs.length; i++){
                            if(this.prefabs[i].prefabs_id === Number(button.dataset.prefab)){
                                let prefab = this.prefabs[i];
                                this.context.sceneGraph.add(this.context.currentObject,{
                                    type:"Prefab",
                                    prefab
                                })
                                    .then(child=>{
                                        this.context.showObject();
                                        this.context.displayBox.setObject(child.object3D);
                                        setTimeout(()=>this.context.itemView.open(child),250);
                                    });
                                this.uiRenderer.modal.close();
                            }
                        }
                    });
                }
            });
    }
}