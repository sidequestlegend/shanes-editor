export class ObjectTypeModal{
    constructor(context) {
        this.context = context;
        let icon_path = 'images/icons/objects/';
        this.types = [
            {name:'Group',friendly_name:'Group',image_url:icon_path+'folder.jpg',extra_class:'close-modal'},
            {name:'Primitive',friendly_name:'Simple',image_url:icon_path+'geometries/primitive/Box.jpg'},
            {name:'Parametric',friendly_name:'Fancy',image_url:icon_path+'geometries/parametric/Apple.jpg'},
            {name:'Prefab',friendly_name:'Prefab',image_url:icon_path+'prefab.jpg'},
            {name:'Light',friendly_name:'Light',image_url:icon_path+'lights.jpg'},
            {name:'Poly',friendly_name:'Google Poly',image_url:icon_path+'poly.jpg'},
            {name:'Sketchfab',friendly_name:'Sketchfab',image_url:icon_path+'sketchfab.jpg'},
            {name:'Kenney',friendly_name:'Kenney\'s',image_url:icon_path+'kenny-logo.jpg'},
            {name:'Avatar',friendly_name:'Avatar Models',image_url:icon_path+'custom.jpg'},
            {name:'Custom',friendly_name:'Your Model',image_url:icon_path+'custom.jpg'}
        ]
    }
    open() {
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-items'])
            .then(()=>this.context.content.compileTemplates('add-items',[{items:this.types}],true))
            .then(contents=>{
                this.context.content.popup.setContent(contents[0]);
            })
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        switch(button.dataset.key){
                            case "Primitive":
                                this.context.primitiveTypeModal.open();
                                break;
                            case "Parametric":
                                this.context.parametricTypeModal.open();
                                break;
                            case "Prefab":
                                this.context.prefabOptionModal.open();
                                break;
                            case "Light":
                                this.context.lightTypeModal.open();
                                break;
                            case "Kenney":
                                this.context.kennyCategories.open();
                                break;
                            case "Avatar":
                                this.context.avatarCategories.open();
                                break;
                            case "Group":
                                this.context.sceneGraph.add(this.context.sceneGraph.currentScene,{type:"Object3D"});
                                this.uiRenderer.modal.close();
                                break;
                        }
                    });
                }
            });
    }
}