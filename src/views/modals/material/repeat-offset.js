export class RepeatSettingsModal {
    constructor(context) {
        this.context = context;
    }

    open() {
        this.material = this.context.currentObject.settings.material;
        this.startSection = `
            <a-text font="roboto" baseLine="top" anchor="center" 
            value="Material Repeat, Offset & Other Settings"
                    color="#212121" wrap-count="34" width="1.95" height="0.15"></a-text>
            <a-plane width="2.9" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="3.0">
            <a-entity width="1.4">
            <a-text font="roboto" baseLine="top" anchor="center" 
                    value="1st UV Channel"
                    color="#212121" wrap-count="16" width="0.8" height="0.15"></a-text>`;

        this.midSection = `
            </a-entity>
            <a-plane width="0.01" height="3" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.4">
            <a-text font="roboto" baseLine="top" anchor="center" 
                    value="2nd UV Channel"
                    color="#212121" wrap-count="16" width="0.8" height="0.15"></a-text>`;


        this.endSection = '</a-entity>\n            </a-entity>';
        this.setupDisplayValues()
        Promise.all([
            this.context.content.compileTemplates('number',
                [
                    {name:'Repeat X 1',number:this.material.texture.repeat.x},
                    {name:'Repeat Y 1',number:this.material.texture.repeat.y},
                    {name:'Offset X 1',number:this.material.texture.offset.x},
                    {name:'Offset Y 1',number:this.material.texture.offset.y},

                    {name:'Repeat X 2',number:this.material.lightTexture.repeat.x},
                    {name:'Repeat Y 2',number:this.material.lightTexture.repeat.y},
                    {name:'Offset X 2',number:this.material.lightTexture.offset.x},
                    {name:'Offset Y 2',number:this.material.lightTexture.offset.y},
                ]
            ),
            this.context.content.compileTemplates('radios',[
                {
                    name:'Filter Minification 1',
                    selected:this.displayValues.min[this.material.texture.filters.min],
                    settings:[{name:'Nearest'},{name:'Linear'}]
                },
                {
                    name:'Filter Magnification 1',
                    selected:this.displayValues.mag[this.material.texture.filters.mag],
                    settings:[
                        {name:'Nearest'},{name:'Nearest Nearest'},{name:'Nearest Linear'},
                        {name:'Linear'},{name:'Linear Nearest'},{name:'Linear Linear'},
                    ]
                },
                {
                    name:'Wrapping S 1',
                    selected:this.displayValues.wrap[this.material.texture.wrapping.s],
                    settings:[
                        {name:'Repeat'},{name:'Clamp'},{name:'Mirrored Repeat'},
                    ]
                },
                {
                    name:'Wrapping T 1',
                    selected:this.displayValues.wrap[this.material.texture.wrapping.t],
                    settings:[
                        {name:'Repeat'},{name:'Clamp'},{name:'Mirrored Repeat'},
                    ]
                },


                {
                    name:'Filter Minification 2',
                    selected:this.displayValues.min[this.material.texture.filters.min],
                    settings:[{name:'Nearest'},{name:'Linear'}]
                },
                {
                    name:'Filter Magnification 2',
                    selected:this.displayValues.mag[this.material.texture.filters.mag],
                    settings:[
                        {name:'Nearest'},{name:'Nearest Nearest'},{name:'Nearest Linear'},
                        {name:'Linear'},{name:'Linear Nearest'},{name:'Linear Linear'},
                    ]
                },
                {
                    name:'Wrapping S 2',
                    selected:this.displayValues.wrap[this.material.texture.wrapping.s],
                    settings:[
                        {name:'Repeat'},{name:'Clamp'},{name:'Mirrored Repeat'},
                    ]
                },
                {
                    name:'Wrapping T 2',
                    selected:this.displayValues.wrap[this.material.texture.wrapping.t],
                    settings:[
                        {name:'Repeat'},{name:'Clamp'},{name:'Mirrored Repeat'},
                    ]
                },
            ])
        ])
            .then(contents=>{
                let repeatxSettings = contents[0][0];
                let repeatySettings = contents[0][1];
                let offsetxSettings = contents[0][2];
                let offsetySettings = contents[0][3];
                let minSetting = contents[1][0];
                let magSetting = contents[1][1];
                let wrapS = contents[1][2];
                let wrapT = contents[1][3];

                let repeatxSettingsLight = contents[0][4];
                let repeatySettingsLight = contents[0][5];
                let offsetxSettingsLight = contents[0][6];
                let offsetySettingsLight = contents[0][7];
                let minSettingLight = contents[1][4];
                let magSettingLight = contents[1][5];
                let wrapSLight = contents[1][6];
                let wrapTLight = contents[1][7];

                return this.context.content.popup.setContent(
                    this.startSection+
                    repeatxSettings+repeatySettings+
                    offsetxSettings+offsetySettings+
                    minSetting+magSetting+
                    wrapS+wrapT+
                    this.midSection+
                    repeatxSettingsLight+repeatySettingsLight+
                    offsetxSettingsLight+offsetySettingsLight+
                    minSettingLight+magSettingLight+
                    wrapSLight+wrapTLight+
                    this.endSection
                );
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('material','.repeatx1','x',false,'texture','repeat');
                this.context.viewUtils.setupNumberUpdate('material','.repeaty1','y',false,'texture','repeat');
                this.context.viewUtils.setupNumberUpdate('material','.offsetx1','x',false,'texture','offset');
                this.context.viewUtils.setupNumberUpdate('material','.offsety1','y',false,'texture','offset');


                this.context.viewUtils.setupNumberUpdate('material','.repeatx2','x',false,'lightTexture','repeat');
                this.context.viewUtils.setupNumberUpdate('material','.repeaty2','y',false,'lightTexture','repeat');
                this.context.viewUtils.setupNumberUpdate('material','.offsetx2','x',false,'lightTexture','offset');
                this.context.viewUtils.setupNumberUpdate('material','.offsety2','y',false,'lightTexture','offset');
            })
    }
    setupDisplayValues(){
        this.displayValues = {
            min:{
                Nearest:THREE.NearestFilter,
                Linear:THREE.LinearFilter
            },
            mag:{
                Nearest:THREE.NearestFilter,
                "Nearest Nearest":THREE.NearestMipMapNearestFilter,
                "Nearest Linear":THREE.NearestMipMapLinearFilter,
                Linear:THREE.LinearFilter,
                "Linear Nearest":THREE.LinearMipMapNearestFilter,
                "Linear Linear":THREE.LinearMipMapLinearFilter,
            },
            wrap:{
                Repeat:THREE.RepeatWrapping,
                Clamp:THREE.ClampToEdgeWrapping,
                "Mirrored Repeat":THREE.MirroredRepeatWrapping
            }
        };
        this.displayValues.min[THREE.NearestFilter] = 'Nearest';
        this.displayValues.min[THREE.LinearFilter] = 'Linear';

        this.displayValues.mag[THREE.NearestFilter] = 'Nearest';
        this.displayValues.mag[THREE.NearestMipMapNearestFilter] = 'Nearest Nearest';
        this.displayValues.mag[THREE.NearestMipMapLinearFilter] = 'Nearest Linear';
        this.displayValues.mag[THREE.LinearFilter] = 'Linear';
        this.displayValues.mag[THREE.LinearMipMapNearestFilter] = 'Linear Nearest';
        this.displayValues.mag[THREE.LinearMipMapLinearFilter] = 'Linear Linear';

        this.displayValues.wrap[THREE.RepeatWrapping] = 'Repeat';
        this.displayValues.wrap[THREE.ClampToEdgeWrapping] = 'Clamp';
        this.displayValues.wrap[THREE.MirroredRepeatWrapping] = 'Mirrored Repeat';
    }
}