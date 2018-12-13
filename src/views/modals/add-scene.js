export class CreateSceneModal{
    constructor(context) {
        this.context = context;
    }
    open(scenes_id,name){
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-scene'])
            .then(()=>this.context.content.compileTemplates('add-scene',[{title:scenes_id?'Save Scene':'Create Scene',scenes_id,name:name?name:this.context.namer.generateName()+' '+this.context.namer.generateName()}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>{
                document.querySelector('.cancelAddScene').addEventListener('mousedown',()=>this.uiRenderer.modal.close());
                document.querySelector('.createSceneConfirm').addEventListener('mousedown',()=>{
                    let name = document.querySelector('.sceneName').getValue();
                    let scene = scenes_id?this.context.sceneGraph.serialiser.serialiseScene():this.context.sceneGraph.createNew();
                    scene.settings.name = name;
                    scene.behaviours = {};
                    this.context.sceneEl.emit(scenes_id?'saveScene':'createScene',scenes_id?{scene,name,scenes_id}:{scene,name});
                    this.uiRenderer.modal.close();
                });
                let copyScene = document.querySelector('.copySceneConfirm');
                if(copyScene && scenes_id){
                    copyScene.addEventListener('mousedown',()=>{
                        let name = document.querySelector('.sceneName').getValue();
                        let scene = this.context.sceneGraph.serialiser.serialiseScene();
                        scene.settings.name = name;
                        scene.behaviours = {};
                        this.context.sceneEl.emit('createScene',{scene,name});
                        this.uiRenderer.modal.close();
                    })
                }
            });
    }
}
