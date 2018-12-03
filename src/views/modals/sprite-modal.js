export class SpriteModalSettings{
    constructor(context){
        this.context = context;
    }
    open(){
        let settings = this.context.currentObject.settings.material;
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('sprite-settings',[settings],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                this.context.viewUtils.setupColorUpdate('.colorInputField','color');
                this.context.viewUtils.setupNumberUpdate('material','.rotation','rotation',true);
                this.context.viewUtils.setupSwitcheInput('material','.switch-fog','fog');
                this.context.viewUtils.setupSwitcheInput('material','.switch-lights','lights');
                this.context.content.popup.querySelector('.save').addEventListener('mousedown',()=>{
                    this.context.currentObject.settings.material.map = document.querySelector('.textureImage').getValue();

                    this.context.currentObject.object3D.material.map = this.context.currentObject.settings.material.map?new THREE.TextureLoader()
                        .load(this.context.currentObject.settings.material.map):null;
                });
                this.context.content.popup.querySelector('.cancelAddSprite').addEventListener('mousedown',()=> {
                    this.uiRenderer.modal.close();
                });
            });
    }
}