export class GeometryTypeModal{
    constructor(context) {
        this.context = context;
    }
    open() {
        this.isPrimitive = this.context.currentObject.settings.type==="Primitive";
        let type = this.context.currentObject.settings.geometry[this.isPrimitive?'type':'sub_type']
            .replace('Geometry','')
            .replace('Buffer','')
            .replace('Inverted','')
        this.context.content.loadTemplates(['object-type'])
            .then(()=>this.context.content.compileTemplates('object-type',[
                {type:'geometry',selected:type,options:this.context[this.isPrimitive?'primitiveTypeModal':'parametricTypeModal'].types.filter(d=>["My Fancys","Fancy Market","Create"].indexOf(d.friendly_name)===-1).map(d=>({name:d.friendly_name}))}

            ],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                if(this.isPrimitive) {
                    this.setupPrimitiveChange();
                }else{
                    this.setupParametricChange();
                }
            });
    }
    setupParametricChange(){
        let updateType = type=>{
            this.type = type.split(' ').join('')+'Geometry';
        };
        this.context.viewUtils.setupRadioInput('.radio-apple',updateType);
        this.context.viewUtils.setupRadioInput('.radio-appleinverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-fermat',updateType);
        this.context.viewUtils.setupRadioInput('.radio-spring',updateType);
        this.context.viewUtils.setupRadioInput('.radio-springinverted',updateType);
       // this.context.viewUtils.setupRadioInput('.radio-natica',updateType);
       // this.context.viewUtils.setupRadioInput('.radio-naticastellatainverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-helicoid',updateType);
        this.context.viewUtils.setupRadioInput('.radio-spiral',updateType);
        this.context.viewUtils.setupRadioInput('.radio-spiralinverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-pillow',updateType);
        this.context.viewUtils.setupRadioInput('.radio-pillowinverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-catenoid',updateType);
        this.context.viewUtils.setupRadioInput('.radio-scherk',updateType);
        this.context.viewUtils.setupRadioInput('.radio-klein',updateType);
        this.context.viewUtils.setupRadioInput('.radio-kleininverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-mobius',updateType);
        this.context.viewUtils.setupRadioInput('.radio-mobius3d',updateType);
        this.context.viewUtils.setupRadioInput('.radio-mobius3dinverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-snail',updateType);
        this.context.viewUtils.setupRadioInput('.radio-snailinverted',updateType);
        this.context.viewUtils.setupRadioInput('.radio-horn',updateType);
        this.context.viewUtils.setupRadioInput('.radio-horninverted',updateType);
        this.context.content.popup.querySelector('.right-button').addEventListener('mousedown',()=>{
            this.context.sceneGraph.objectFactory.changeGeometry(this.type);
            document.getElementById('geometrySettings').querySelector('.doubleButton1').close();
            this.context.displayBox.setObject(this.context.currentObject.object3D);
        });
    }
    setupPrimitiveChange(){
        let updateType = type=>{
            this.type = type+'Geometry';
        };
        this.context.viewUtils.setupRadioInput('.radio-circle',updateType);
        this.context.viewUtils.setupRadioInput('.radio-cone',updateType);
        this.context.viewUtils.setupRadioInput('.radio-box',updateType);
        this.context.viewUtils.setupRadioInput('.radio-cylinder',updateType);
        this.context.viewUtils.setupRadioInput('.radio-dodecahedron',updateType);
        this.context.viewUtils.setupRadioInput('.radio-icosahedron',updateType);
        this.context.viewUtils.setupRadioInput('.radio-octahedron',updateType);
        this.context.viewUtils.setupRadioInput('.radio-plane',updateType);
        this.context.viewUtils.setupRadioInput('.radio-ring',updateType);
        this.context.viewUtils.setupRadioInput('.radio-sphere',updateType);
        this.context.viewUtils.setupRadioInput('.radio-tetrahedron',updateType);
        this.context.viewUtils.setupRadioInput('.radio-torus',updateType);
        this.context.viewUtils.setupRadioInput('.radio-torusknot',updateType);
        this.context.content.popup.querySelector('.right-button').addEventListener('mousedown',()=>{
            this.context.sceneGraph.objectFactory.changeGeometry(this.type);
            let geoSettingsEl = document.getElementById('geometrySettings');
            geoSettingsEl.querySelector('.doubleButton1').close();
            geoSettingsEl.querySelector('.titleContainer').setAttribute('value','Geometry Settings: '+this.context.currentObject.settings.geometry.type
                .replace('Geometry','')
                .replace('Buffer','')
                .replace('Inverted',''));
            this.context.displayBox.setObject(this.context.currentObject.object3D);
        });
        this.context.content.popup.querySelector('.close-modal-type').addEventListener('mousedown',()=>{
            document.querySelector('#geometrySettings').querySelector('.doubleButton1').close();
        })
    }
}