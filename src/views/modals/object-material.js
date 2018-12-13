export class ObjectMaterial {
    constructor(context) {
        this.context = context;
    }
    open(newObject){
        this.context.content.loadTemplates([
            'material-options'
        ])
            .then(()=>this.context.content.compileTemplates('material-options',[{selected:'Standard',options:[
                    {name:'Basic'},
                    {name:'Standard'},
                    {name:'Lambert'},
                    {name:'Phong'},
                    {name:'Depth'},
                    {name:'Physical'},
                    {name:'Toon'},
                    //{name:'Shader'}, TODO: think of how shaders get implemented.
                ]}]))
            .then(contents=>{
                this.context.content.popup.setContent(contents[0])
            })
            .then(()=>{
                this.uiRenderer = document.getElementById('mainRenderer');
                this.type = 'MeshStandardMaterial';
                this.color = '#ffffff';
                let updateType = type=>{
                    this.type = 'Mesh'+type.charAt(0).toUpperCase() + type.substr(1)+'Material';
                };
                 this.context.viewUtils.setupRadioInput('.radio-basic',updateType,true);
                this.context.viewUtils.setupRadioInput('.radio-standard',updateType,true);
                this.context.viewUtils.setupRadioInput('.radio-lambert',updateType,true);
                this.context.viewUtils.setupRadioInput('.radio-phong',updateType,true);
                this.context.viewUtils.setupRadioInput('.radio-depth',updateType,true);
                this.context.viewUtils.setupRadioInput('.radio-physical',updateType,true);
                this.context.viewUtils.setupRadioInput('.radio-toon',updateType,true);
                //
                this.setupColorUpdate('.colorInputField');

                this.context.content.popup.querySelector('.left-button').addEventListener('mousedown',()=>{
                    this.uiRenderer.modal.close();
                });
                this.context.content.popup.querySelector('.right-button').addEventListener('mousedown',()=>{
                    newObject.mat_settings = {type:this.type,color:this.color};
                    this.context.sceneGraph
                        .add(this.context.currentObject,newObject)
                        .then(child=>{
                            this.uiRenderer.modal.close();
                            this.context.showObject();
                            this.context.displayBox.setObject(child.object3D);
                            setTimeout(()=>{
                                this.context.sceneGraph.sync(child);
                                this.context.itemView.open(child);
                            },250);
                        });
                });
            });
    }
    setupColorUpdate(cssClass){
        let colorButton = this.context.content.popup
            .querySelector(cssClass);

        let colorText = this.context.content.popup
            .querySelector(cssClass+'Text');
        colorButton.addEventListener('mousedown',()=>{
            document.getElementById('colorPicker').open()
                .then(color=>{

                    colorText.setAttribute('value',color);
                    colorButton.setAttribute('color',color);
                    this.color = color;
                });
        });
    }
}