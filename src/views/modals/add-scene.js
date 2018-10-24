export class CreateSceneModal{
    constructor(context) {
        this.context = context;
    }
    open(){
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-scene'])
            .then(()=>this.context.content.compileTemplates('add-scene',[{name:this.context.namer.generateName()+' '+this.context.namer.generateName()}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>{
                let closeElement = document.querySelector('.createScene');
                document.querySelector('.cancelAddScene').addEventListener('click',()=>closeElement.close());
                document.querySelector('.createSceneConfirm').addEventListener('click',()=>{
                    let name = document.querySelector('.sceneName').getValue();
                    let scene = this.context.sceneGraph.createNew();
                    scene.settings.name = name;
                    this.context.sceneEl.emit('createScene',{scene,name});
                    closeElement.close();
                });

            });
    }
}
