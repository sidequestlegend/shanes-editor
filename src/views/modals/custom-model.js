export class CustomModal {
    constructor(context) {
        this.context = context;
    }
    open(type) {
        this.type = type||"GLTF2";
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.loadTemplates(['custom-model'])
            .then(()=>this.context.content.compileTemplates('custom-model',[{type:this.type}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.setupCustomMenu())
            .then(()=>this.setUnderline(this.type))
            .then(()=>{
                document.querySelector('.cancelAddCustom').addEventListener('mousedown',()=>{
                    this.uiRenderer.modal.close();
                });
                document.querySelector('.createCustomConfirm').addEventListener('mousedown',()=>{
                    let addObject;
                    switch(this.type) {
                        case "GLTF2":
                        case "DAE":
                        case "FBX":
                            addObject = {
                                type:"Custom",
                                sub_type:this.type,
                                url:document.getElementById('mainModelUrl').getValue()
                            };
                            break;
                        case "OBJ":
                            addObject = {
                                type:"Custom",
                                sub_type:'OBJ',
                                url:document.getElementById('mainModelUrl').getValue(),
                                mtl_url:document.getElementById('mainMTLUrl').getValue(),
                                mtl_path:document.getElementById('mainMTLPath').getValue()
                            };
                            break;
                    }
                    if(addObject){
                        this.context.modelSettings.open(addObject,object=>this.context.sceneGraph.add(this.context.currentObject,object)
                            .then(child=>{
                                this.context.showObject();
                                this.context.displayBox.setObject(child.object3D);
                                setTimeout(()=>{
                                    this.context.itemView.open(child);
                                    this.context.sceneGraph.sync();
                                },250);
                                this.uiRenderer.modal.close();
                            }));
                    }
                })
            })
    }
    setupCustomMenu(){
        let sceneMenuButtons = document.querySelectorAll('.model-menu-button');
        let sceneMenuUnderline = document.querySelector('.model-under-line');
        let _this = this;
        for(let i = 0; i < sceneMenuButtons.length; i++){
            let sceneMenuButton = sceneMenuButtons[i];
            sceneMenuButton.addEventListener('mousedown',function(){
                let position = this.dataset.position_x;
                let type = this.dataset.type;
                sceneMenuUnderline.setAttribute('width',this.dataset.line_width);
                new TWEEN.Tween(sceneMenuUnderline.getAttribute('position'))
                    .to(new THREE.Vector3(position,-0.18,0.001), 350)
                    .onComplete(()=>_this.open(type))
                    .easing(TWEEN.Easing.Exponential.Out).start();

            })
        }
    }
    setUnderline(type){
        let position = '1.2 -0.18 0.001';
        let width = '0.27';
        switch(type) {
            case "DAE":
                position = '1.7 -0.18 0.0001';
                width = '0.4';
                break;
            case "FBX":
                position = '2.15 -0.18 0.0001';
                width = '0.2';
                break;
            case "OBJ":
                position = '2.6 -0.18 0.0001';
                width = '0.45';
                break;
        }
        let underline = document.querySelector('.model-under-line');
        underline.setAttribute('position',position);
        underline.setAttribute('width',width);
    }
}