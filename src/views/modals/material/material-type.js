export class MaterialTypeModal{
    constructor(context) {
        this.context = context;
    }
    open() {
        let material = this.context.currentObject.settings.material;
        console.log(material.type.substr(4,material.type.length-12));
        this.context.content.loadTemplates(['object-type'])
            .then(()=>this.context.content.compileTemplates('object-type',[{type:'material',selected:material.type.substr(4,material.type.length-12),options:[
                    {name:'Basic'},
                    {name:'Standard'},
                    {name:'Lambert'},
                    {name:'Phong'},
                    {name:'Depth'},
                    {name:'Physical'},
                    {name:'Toon'},
                    //{name:'Shader'}, TODO: think of how shaders get implemented.
                ]}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let updateType = type=>{
                    this.type = 'Mesh'+type.charAt(0).toUpperCase() + type.substr(1)+'Material';
                };
                this.context.viewUtils.setupRadioInput('.radio-basic',updateType);
                this.context.viewUtils.setupRadioInput('.radio-standard',updateType);
                this.context.viewUtils.setupRadioInput('.radio-lambert',updateType);
                this.context.viewUtils.setupRadioInput('.radio-phong',updateType);
                this.context.viewUtils.setupRadioInput('.radio-depth',updateType);
                this.context.viewUtils.setupRadioInput('.radio-physical',updateType);
                this.context.viewUtils.setupRadioInput('.radio-toon',updateType);
                this.context.content.popup.querySelector('.right-button').addEventListener('mousedown',()=>{
                    this.context.sceneGraph.objectFactory.changeMaterial(this.type);
                    let matSettingsEl = document.getElementById('materialSettings');
                    matSettingsEl.querySelector('.doubleButton1').close();
                    let material = this.context.currentObject.settings.material;
                    matSettingsEl.querySelector('.titleContainer').setAttribute('value','Material Settings: '+material.type.substr(4,material.type.length-12));
                });
            });
    }
}