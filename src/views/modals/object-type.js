export class ObjectTypeModal{
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/';
        this.types = [
            {name:'Group',friendly_name:'Group',image_url:'#objects_folder',extra_class:'close-modal'},
            {name:'Primitive',friendly_name:'Simple',image_url:'#geometry_box'},
            {name:'Parametric',friendly_name:'Fancy',image_url:'#geometry_apple'},
            {name:'Sprite',friendly_name:'Sprite',image_url:'#objects_sprite'},
            {name:'Prefab',friendly_name:'Prefab',image_url:'#objects_prefab'},
            {name:'Light',friendly_name:'Light',image_url:'#objects_lights'},
            {name:'Portal',friendly_name:'Portal',image_url:'#objects_portal'},
            {name:'Aframe',friendly_name:'Aframe',image_url:'#objects_aframe'},
            {name:'Kenney',friendly_name:'Kenney\'s',image_url:'#objects_kenny'},
            {name:'Poly',friendly_name:'Google Poly',image_url:'#objects_poly'},
            {name:'Sketchfab',friendly_name:'Sketchfab',image_url:'#objects_sketchfab'},
            {name:'Avatar',friendly_name:'Avatar Models',image_url:'#objects_avatar'},
            {name:'Custom',friendly_name:'Your Model',image_url:'#objects_custom'}
        ]
    }
    open() {
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-items'])
            .then(()=>this.context.content.compileTemplates('add-items',[{items:this.types,hidePages:true}],true))
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
                            case "Portal":
                                this.context.portalModal.open();
                                break;
                            case "Aframe":
                                this.context.sceneGraph.add(this.context.currentObject,{
                                    type:"Aframe",
                                    aframeCode:'<a-entity></a-entity>'
                                })
                                    .then(child=>{
                                        this.context.displayBox.setObject(child.object3D);
                                        setTimeout(()=>{
                                            this.context.itemView.open(child);
                                            this.context.sceneEl.emit('openAframe',{
                                                name:this.context.currentObject.settings.name,
                                                definition:this.context.currentObject.settings.aframeCode,
                                                aframe_id:this.context.currentObject.settings.uuid
                                            });
                                            this.context.sceneGraph.sync();
                                        },100);
                                    });
                                this.uiRenderer.modal.close();
                                break;
                            case "Sprite":
                                this.context.sceneGraph.add(this.context.currentObject,{
                                    type:"Sprite",
                                    mat_settings:this.context.sceneGraph.objectFactory.spriteDefaults({})
                                })
                                    .then(child=>{
                                        this.context.displayBox.setObject(child.object3D);
                                        this.context.itemView.open(child);
                                        this.context.showObject();
                                        this.context.sceneGraph.sync();
                                    });
                                this.uiRenderer.modal.close();
                                break;
                            case "Kenney":
                                this.context.kennyCategories.open();
                                break;
                            case "Sketchfab":
                                this.context.sceneEl.emit('open-sketchfab');
                                break;
                            case "Poly":
                                this.context.sceneEl.emit('open-poly');
                                break;
                            case "Custom":
                                this.context.customModal.open('GLTF2');
                                break;
                            case "Avatar":
                                this.context.avatarCategories.open();
                                break;
                            case "Group":
                                this.context.sceneGraph.add(this.context.currentObject,{type:"Object3D"})
                                    .then(child=>{
                                        this.context.displayBox.setObject(child.object3D);
                                        setTimeout(()=>{
                                            this.context.itemView.open(child);
                                            this.context.sceneGraph.sync();
                                        },250);
                                    });
                                this.uiRenderer.modal.close();
                                break;
                        }
                    });
                }
            });
    }
}