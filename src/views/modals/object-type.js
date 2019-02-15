export class ObjectTypeModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Group',friendly_name:'Group',image_url:'#small_icons',image_coords:'0 384 128 128'},
            {name:'Primitive',friendly_name:'Simple',image_url:'#small_icons',image_coords:'0 768 128 128'},
            {name:'Parametric',friendly_name:'Fancy',image_url:'#small_icons',image_coords:'640 256 128 128'},
            {name:'Sprite',friendly_name:'Sprite',image_url:'#small_icons',image_coords:'896 768 128 128'},
            {name:'Prefab',friendly_name:'Prefab',image_url:'#small_icons',image_coords:'512 896 128 128'},
            {name:'Light',friendly_name:'Light',image_url:'#small_icons',image_coords:'384 896 128 128'},
            {name:'Sound',friendly_name:'Sound',image_url:'#small_icons',image_coords:'768 768 128 128'},
            {name:'Effect',friendly_name:'Effect',image_url:'#small_icons',image_coords:'640 640 128 128'},
            {name:'Portal',friendly_name:'Portal',image_url:'#small_icons',image_coords:'640 768 128 128'},
            {name:'Aframe',friendly_name:'Aframe',image_url:'#small_icons',image_coords:'256 0 128 128'},
            {name:'Kenney',friendly_name:'Kenney\'s',image_url:'#small_icons',image_coords:'512 768 128 128'},
            {name:'Poly',friendly_name:'Google Poly',image_url:'#small_icons',image_coords:'768 640 128 128'},
            {name:'Sketchfab',friendly_name:'Sketchfab',image_url:'#small_icons',image_coords:'896 640 128 128'},
           // {name:'Avatar',friendly_name:'Avatar Models',image_url:'#small_icons',image_coords:'384 0 128 128'},
            {name:'Custom',friendly_name:'Your Model',image_url:'#small_icons',image_coords:'0 256 128 128'}
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
                            case "Effect":
                                this.context.effectModal.open();
                                break;
                            case "Sound":
                                this.context.sceneGraph.add(this.context.currentObject,{
                                    type:"Sound"
                                })
                                    .then(child=>{
                                        console.log('hi there');
                                        this.context.displayBox.setObject(child.object3D);
                                        this.context.itemView.open(child);
                                        this.context.sceneGraph.sync();
                                        setTimeout(()=>{
                                            this.uiRenderer.modal.open();
                                            this.context.soundModal.open();
                                        },1000);
                                    });
                                this.uiRenderer.modal.close();
                                break;
                            case "Aframe":
                                this.context.modelSettings.open({
                                    type:"Aframe",
                                    aframeCode:'<a-entity></a-entity>'
                                },object=>this.context.sceneGraph.add(this.context.currentObject,object)
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
                                        this.uiRenderer.modal.close();
                                    }));
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