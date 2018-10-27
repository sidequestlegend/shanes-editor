export class AddPrefabList{
    constructor(context){
        this.context = context;
    }
    open(page){
        page = page || 0;
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
                    button.addEventListener('click',()=>{
                        for(let i = 0; i < this.prefabs.length; i++){
                            if(this.prefabs[i].prefabs_id === Number(button.dataset.prefab)){
                                let prefab = this.prefabs[i];
                                fetch(this.context.rootUrl+prefab.url)
                                    .then(response=>response.json())
                                    .then(_prefab=>{
                                        console.log(_prefab);
                                        if(Object.keys(_prefab.behaviours).length){

                                        }else{

                                        }
                                    });
                            }
                        }
                    });
                }
            });
    }
}