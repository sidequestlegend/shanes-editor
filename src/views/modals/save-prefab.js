export class SavePrefabModal{
    constructor(context) {
        this.context = context;
    }
    open(currentPrefab,ele) {
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-prefab'])
            .then(()=>this.context.content.compileTemplates('add-prefab',[currentPrefab?currentPrefab:{
                name:this.context.namer.generateName()+' '+this.context.namer.generateName(),
                image:'https://cdn.theexpanse.app/images/icons/objects/custom.jpg',
            }],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>{
                let name = currentPrefab?currentPrefab.name:document.getElementById('prefabNameEdit').getValue(),
                    description = currentPrefab?currentPrefab.description:'',
                    image = currentPrefab?currentPrefab.image:document.getElementById('prefabImageEdit').getValue(),
                    is_public = false,
                    obfuscate = false;
                let closeEle = currentPrefab?ele:document.querySelector('#savePrefab').querySelector('.singleButton');
                this.context.content.popup.querySelector('.left-button').addEventListener('mousedown',()=>{
                    closeEle.close();
                });
                document.getElementById('isPublic').addEventListener('ui-switch-changed',({detail})=>{
                    is_public = detail;
                });
                document.getElementById('isObfuscated').addEventListener('ui-switch-changed',({detail})=>{
                    obfuscate = detail;
                });
                this.context.content.popup.querySelector('.right-button')
                    .addEventListener('mousedown',()=>{
                        name = document.getElementById('prefabNameEdit').getValue();
                        description = document.getElementById('prefabDescriptionEdit').getValue();
                        image = document.getElementById('prefabImageEdit').getValue();
                        if(currentPrefab){
                            this.context.sceneEl.emit('updatePrefab',{prefabs_id:currentPrefab.prefabs_id,description,image,is_public,obfuscate,name});
                        }else{
                            let prefab = this.context.sceneGraph.serialiser.serialiseScene(this.context.currentObject);
                            this.context.sceneEl.emit('createPrefab',{prefab,description,image,is_public,obfuscate,name});
                        }
                        closeEle.close();
                    });
            });
    }
}