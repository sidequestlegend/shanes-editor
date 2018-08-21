export class SceneListView{
    constructor(context){
        this.context = context;
    }
    open(){
        this.context.breadCrumbs.make([
            {name:'My Scenes',callback:()=>this.open(),isTop:true}
        ]);
        this.context.content.loadScreen('scene-list-view',['scene-item'],true)
            .then(()=>this.context.content.compileTemplates('scene-item',[{scenes:this.context.session.userData.scenes}]))
            .then(contents=>{
                for(let i = 0; i < contents.length;i++){
                    this.context.content.addTemplateItem('#sceneList',contents[i]);
                }
            })
            .then(()=>this.context.content.reloadContent())
            .then(()=>this.setupLoadButtons());
    }
    setupLoadButtons(){
        let loadButtons = document.querySelector('#sceneList').querySelectorAll('.loadScene');
        for(let i = 0; i < loadButtons.length; i++){
            let loadButton = loadButtons[i];
            loadButton.addEventListener('mousedown',e=>{
                let scene;
                for(let j = 0; j < this.context.session.userData.scenes.length; j++) {
                    let _scene = this.context.session.userData.scenes[j];
                    if(_scene.scene_id === Number(loadButton.dataset.scene)){
                        scene = _scene;
                        break;
                    }
                }
                if(scene){
                    scene.view_only = loadButton.dataset.view_only==="true";
                    this.context.sceneGraph.load(scene)
                        .then(() => this.context.itemView.open())
                        .then(()=>{
                            if(!scene.view_only){
                                return this.context.sceneGraph.open()
                            }
                        });
                }
            })
        }
    }
}