export class MaterialSettingsModal{
    constructor(context) {
        this.context = context;
    }

    open(){
        this.material = this.context.currentObject.settings.material;
        this.type =  this.material.type.substr(4,this.material.type.length-12).toLowerCase();
        this.resetTemplate();
        switch(this.type){
            case "basic":
                return this.openBasic();
            case "standard":
                return this.openStandard();
            case "lambert":
                return this.openLambert();
            case "phong":
                return this.openPhong();
            case "depth":
                return this.openBasic();
            case "physical":
                return this.openStandard(true);
            case "toon":
                return this.openPhong(true);
        }

    }

    async load() {
        this.startSection = `
            <a-text font="roboto" baseLine="top" anchor="center" 
            value="`+this.type.charAt(0).toUpperCase() + this.type.substr(1)+` Material Settings"
                    color="#212121" wrap-count="26" width="1.35" height="0.15"></a-text>
            <a-plane width="2.9" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.35">`;

        this.midSection = `
            </a-entity>
            <a-plane width="0.01" height="1.6" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.35">`;

        this.endSection = '</a-entity>';

        return this.context.content.loadTemplates([
            'radios',
            'switches',
            'color',
            'color-intensity',
            'number',
            'map-settings'
        ])
    }

    async openBasic() {
        return this.load()
            .then(()=>{
                this.templates.switches.push({settings:[{name:'Wireframe',selected:this.material.wireframe}]},{settings:[{name:'Fog',selected:this.material.fog}]},{settings:[{name:'Lights',selected:this.material.lights}]});
                this.templates.color.push({color:this.material.color});
                this.templates.mapSettings.push({});
                this.templates.number.push({name:'Refraction Ratio',number:this.material.refractionRatio});
            })
            .then(()=>this.compile())
            .then(contents=>{
                let defaultContents = this.buildDefaults(contents);
                let color = contents[3].shift();
                let map = contents[4].shift();
                let refraction = contents[2].shift();
                let wireframe = contents[0].shift();
                let fog = contents[0].shift();
                let lights = contents[0].shift();
                let standardContents = color+map+refraction+fog+lights+wireframe;
                let fullContents = this.startSection+standardContents+this.midSection+defaultContents+this.endSection;
                return this.context.content.popup.setContent(fullContents);
            })
            .then(()=>{
                this.setupColorUpdate('.colorInputField','color');
                this.context.viewUtils.setupNumberUpdate('material','.refractionratio','refractionRatio');
                this.context.viewUtils.setupSwitcheInput('material','.switch-fog','fog');
                this.context.viewUtils.setupSwitcheInput('material','.switch-lights','lights');
                this.setupDefaultUpdate();
            })
    }

    async openStandard(isPhysical) {
        return this.load()
            .then(()=>{
                this.templates.switches.push({settings:[{name:'Wireframe',selected:this.material.wireframe}]});
                this.templates.color.push({color:this.material.color});
                this.templates.colorIntensity.push({name:'Emissiveness',color:this.material.emissive,intensity:this.material.emissiveIntensity});
                this.templates.mapSettings.push({});
                this.templates.number.push(
                    {name:'Metalness',number:this.material.metalness},
                    {name:'Roughness',number:this.material.roughness},
                    {name:'Refraction Ratio',number:this.material.refractionRatio}
                    );
                if(isPhysical){
                    this.templates.number.push(
                        {name:'Clear Coat',number:this.material.clearCoat},
                        {name:'Clear Coat Roughness',number:this.material.clearCoatRoughness},
                        {name:'Reflectivity',number:this.material.reflectivity},
                        );
                }
            })
            .then(()=>this.compile())
            .then(contents=>{
                let defaultContents = this.buildDefaults(contents);
                let color = contents[3].shift();
                let map = contents[5].shift();
                let emissive = contents[4].shift();
                let metal = contents[2].shift();
                let rough = contents[2].shift();
                let refraction = contents[2].shift();
                let physicalExtra = '';
                if(isPhysical){
                    physicalExtra+=contents[2].shift();
                    physicalExtra+=contents[2].shift();
                    physicalExtra+=contents[2].shift();
                }
                let wireframe = contents[0].shift();
                let standardContents = color+map+emissive+metal+rough+physicalExtra+refraction+wireframe;
                let fullContents = this.startSection+standardContents+this.midSection+defaultContents+this.endSection;
                return this.context.content.popup.setContent(fullContents);
            })
            .then(()=>{
                this.setupColorUpdate('.colorInputField','color');
                this.setupEmissiveUpdate();
                this.context.viewUtils.setupNumberUpdate('material','.metalness','metalness');
                this.context.viewUtils.setupNumberUpdate('material','.opacity','opacity');
                this.context.viewUtils.setupNumberUpdate('material','.alphatest','alphaTest');
                this.context.viewUtils.setupNumberUpdate('material','.refractionratio','refractionRatio');
                this.context.viewUtils.setupNumberUpdate('material','.roughness','roughness');
                if(isPhysical){
                    this.context.viewUtils.setupNumberUpdate('material','.clearcoat','clearCoat');
                    this.context.viewUtils.setupNumberUpdate('material','.clearcoatroughness','clearCoatRoughness');
                    this.context.viewUtils.setupNumberUpdate('material','.reflectivity','reflectivity');
                }
                this.setupDefaultUpdate();
            });
    }

    setupDefaultUpdate(){
        this.context.viewUtils.setupNumberUpdate('material','.opacity','opacity');
        this.context.viewUtils.setupSwitcheInput('material','.switch-wireframe','wireframe');
        this.context.viewUtils.setupSwitcheInput('material','.switch-visible','visible');
        this.context.viewUtils.setupSwitcheInput('material','.switch-transparent','transparent');
        let updateSide = side=>{
            this.material.side = side==='Front'?THREE.FrontSide:side==='Back'?THREE.BackSide:THREE.DoubleSide;
            this.context.currentObject.object3D.material.side = this.material.side;
        };
        this.context.viewUtils.setupRadioInput('.radio-front',updateSide);
        this.context.viewUtils.setupRadioInput('.radio-back',updateSide);
        this.context.viewUtils.setupRadioInput('.radio-double',updateSide);
    }

    setupColorUpdate(cssClass,field){
        let colorButton = this.context.content.popup
            .querySelector(cssClass);

        let colorText = this.context.content.popup
            .querySelector(cssClass+'Text');
            colorButton.addEventListener('mousedown',()=>{
                document.getElementById('colorPicker').open()
                    .then(color=>{
                        colorText.setAttribute('value',color);
                        colorButton.setAttribute('color',color);
                        this.context.currentObject.settings.material[field] = color;
                        this.context.currentObject.object3D.material[field] = new THREE.Color(color);
                    });
            });
    }

    setupEmissiveUpdate(){
        this.setupColorUpdate('.colorIntensityInput','emissive');
        this.context.viewUtils.setupNumberUpdate('material','.emissiveness','emissiveIntensity');
    }

    async openPhong() {
        return this.load()
            .then(()=>{
                this.templates.switches.push({settings:[{name:'Wireframe',selected:this.material.wireframe}]});
                this.templates.color.push({color:this.material.color},{color:this.material.color,colorName:'Specular',colorButtonClass:'specularInput',colorButtonTextClass:'specularInputText'});
                this.templates.colorIntensity.push({name:'Emissiveness',color:this.material.emissive,intensity:this.material.emissiveIntensity});
                this.templates.mapSettings.push({});

                this.templates.number.push(
                    {name:'Reflectivity',number:this.material.reflectivity},
                    {name:'Refraction Ratio',number:this.material.refractionRatio},
                    {name:'Shininess',number:this.material.shininess}
                    );
            })
            .then(()=>this.compile())
            .then(contents=>{

                let defaultContents = this.buildDefaults(contents);
                let color = contents[3].shift();
                let map = contents[5].shift();
                let emissive = contents[4].shift();
                let reflectivity = contents[2].shift();
                let refraction = contents[2].shift();
                let shininess = contents[2].shift();
                let specular = contents[3].shift();
                let wireframe = contents[0].shift();
                let standardContents = color+map+emissive+shininess+specular+reflectivity+refraction+wireframe;
                let fullContents = this.startSection+standardContents+this.midSection+defaultContents+this.endSection;
                return this.context.content.popup.setContent(fullContents);
            }).then(()=>{
                this.setupColorUpdate('.colorInputField','color');
                this.setupColorUpdate('.specularInput','specular');
                this.setupEmissiveUpdate();
                this.context.viewUtils.setupNumberUpdate('material','.reflectivity','reflectivity');
                this.context.viewUtils.setupNumberUpdate('material','.refractionratio','refractionRatio');
                this.context.viewUtils.setupNumberUpdate('material','.shininess','shininess');
                this.setupDefaultUpdate();
            })
    }

    async openLambert() {

        return this.load()
            .then(()=>{
                this.templates.switches.push({settings:[{name:'Wireframe',selected:this.material.wireframe}]});
                this.templates.color.push({color:this.material.color});
                this.templates.colorIntensity.push({name:'Emissiveness',color:this.material.emissive,intensity:this.material.emissiveIntensity});
                this.templates.mapSettings.push({});
                this.templates.number.push({name:'Reflectivity',number:this.material.reflectivity},{name:'Refraction Ratio',number:this.material.refractionRatio});
            })
            .then(()=>this.compile())
            .then(contents=>{
                let defaultContents = this.buildDefaults(contents);
                let color = contents[3].shift();
                let map = contents[5].shift();
                let emissive = contents[4].shift();
                let reflectivity = contents[2].shift();
                let refraction = contents[2].shift();
                let wireframe = contents[0].shift();
                let standardContents = color+map+emissive+reflectivity+refraction+wireframe;
                let fullContents = this.startSection+standardContents+this.midSection+defaultContents+this.endSection;
                return this.context.content.popup.setContent(fullContents);
            })
            .then(()=>{
                this.setupColorUpdate('.colorInputField','color');
                this.setupEmissiveUpdate();
                this.context.viewUtils.setupNumberUpdate('material','.reflectivity','reflectivity');
                this.context.viewUtils.setupNumberUpdate('material','.refractionratio','refractionRatio');
                this.setupDefaultUpdate();
            })
    }

    async compile(){
        let toBeCompiled = [
            this.context.content.compileTemplates('switches',this.templates.switches),
            this.context.content.compileTemplates('radios',this.templates.radios),
            this.context.content.compileTemplates('number',this.templates.number),
        ];
        if(this.templates.color.length){
            toBeCompiled.push(this.context.content.compileTemplates('color',this.templates.color));
        }
        if(this.templates.colorIntensity.length){
            toBeCompiled.push(this.context.content.compileTemplates('color-intensity',this.templates.colorIntensity));
        }
        if(this.templates.mapSettings.length){
            toBeCompiled.push(this.context.content.compileTemplates('map-settings',this.templates.mapSettings));
        }
        return Promise.all(toBeCompiled);
    }

    buildDefaults(contents){
        let side = contents[1].shift();
        let visibleTransparent = contents[0].shift();
        let opacity = contents[2].shift();
        let alpha = contents[2].shift();
        return side+visibleTransparent+opacity+alpha;
    }


    resetTemplate(){
        let displaySide = this.material.side===THREE.FrontSide?'Front':this.material.side===THREE.BackSide?'Back':'Double';
        this.templates = {
            switches:[
                {settings:[{name:'Visible',selected:this.material.visible},{name:'Transparent',selected:this.material.transparent}]},
            ],
            radios:[{name:'Side',selected:displaySide,settings:[{name:'Front'},{name:'Back'},{name:'Double'}]}],
            number:[{name:'Opacity',number:this.material.opacity},{name:'Alpha Test',number:this.material.alphaTest}],
            color:[],
            colorIntensity:[],
            mapSettings:[],
        };
    }
}