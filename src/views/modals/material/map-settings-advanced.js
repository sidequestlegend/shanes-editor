export class MapSettingsModal {
    constructor(context) {
        this.context = context;
    }
    open(hideBack){
        this.material = this.context.currentObject.settings.material;
        this.type =  this.material.type.substr(4,this.material.type.length-12).toLowerCase();

        this.startSection = `
            <a-text font="roboto" baseLine="top" anchor="center" 
            value="`+this.type.charAt(0).toUpperCase() + this.type.substr(1)+` Material Map Settings"
                    color="#212121" wrap-count="34" width="1.95" height="0.15"></a-text>
            <a-ui-button class="intersectable repeatSettings" text-value="REPEAT & OFFSET"
                 width="0.72" height="0.14" ripple-size="0.72 0.14" wrap-count="18"></a-ui-button>
            <a-plane width="2.9" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="3.0">
            <a-entity width="1.4">
            <a-text font="roboto" baseLine="top" anchor="center" 
                    value="1st UV Channel"
                    color="#212121" wrap-count="16" width="0.8" height="0.15"></a-text>`;

        this.midSection = `
            </a-entity>
            <a-plane width="0.01" height="1.6" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.4">
            <a-text font="roboto" baseLine="top" anchor="center" 
                    value="2nd UV Channel"
                    color="#212121" wrap-count="16" width="0.8" height="0.15"></a-text>`;

        this.endSection = '</a-entity>\n            </a-entity>';
        this.context.popupBackStack.push(()=>this.context.materialSettingsModal.open());
        document.getElementById('backButton').setAttribute('scale','1 1 1');
        return this.context.content.loadTemplates([
            'map-settings-advanced'
        ]).then(()=>{
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
        })
    }
    openStandard(){
        this.context.content.compileTemplates('map-settings-advanced',[
            {name:'Base Map',url:this.material.map},
            {name:'Environment Map',url:this.material.envMap,hasNumber:true,number:this.material.envMapIntensity,numberName:'Intensity'},
            {name:'Alpha Map',url:this.material.alphaMap},
            {name:'Bump Map',url:this.material.bumpMap,hasNumber:true,number:this.material.bumpScale,numberName:'Bump Scale'},
            {
                name:'Displacement Map',
                url:this.material.displacementMap,
                hasNumber:true,
                number:this.material.displacementScale,
                numberName:'Displacement Scale',
                hasNumber2:true,
                number2:this.material.displacementBias,
                numberName2:'Displacement Bias'
            },
            {name:'Emissive Map',
                url:this.material.emissiveMap,
                hasNumber:true,
                number:this.material.emissiveIntensity,
                numberName:'Intensity',
                hasColor:true,
                color:this.material.emissive,
                colorName:'Emissive Color'
            },
            {name:'Roughness Map',url:this.material.roughnessMap,hasNumber:true,number:this.material.roughness,numberName:'Roughness'},
            {name:'Metalness Map',url:this.material.metalnessMap,hasNumber:true,number:this.material.metalness,numberName:'Metalness'},
            {name:'Normal Map',url:this.material.normalMap
                ,hasNumber:true,number:this.material.normalScale.x,numberName:'Normal Scale X'
                ,hasNumber2:true,number2:this.material.normalScale.y,numberName2:'Normal Scale Y'
            },
            {name:'Light Map',url:this.material.lightMap,hasNumber:true,number:this.material.lightMapIntensity,numberName:'Intensity'},
            {name:'Ambient Occlusion Map',url:this.material.aoMap,hasNumber:true,number:this.material.aoMapIntensity,numberName:'Intensity'},
        ],true)
            .then(contents=>{
                let mapSettings = contents[0];
                let envSettings = contents[1];
                let alphaSettings = contents[2];
                let bumpSettings = contents[3];
                let displacementSettings = contents[4];
                let emissiveSettings = contents[5];
                let roughnessSettings = contents[6];
                let metalnessSettings = contents[7];
                let normalSettings = contents[8];
                let lightSettings = contents[9];
                let aoSettings = contents[10];
                this.context.content.popup.setContent(
                    this.startSection+
                    mapSettings+envSettings+alphaSettings+emissiveSettings+
                    roughnessSettings+metalnessSettings+
                    bumpSettings+displacementSettings+normalSettings+
                    this.midSection+
                    lightSettings+aoSettings+
                    this.endSection
                );
            })
            .then(()=>{
                this.setupRepeatButton();
                this.context.viewUtils.setupNumberUpdate('material','.lightmapNumber1','lightMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.ambientocclusionmapNumber1','aoMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.environmentmapNumber1','envMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.roughnessmapNumber1','roughness');
                this.context.viewUtils.setupNumberUpdate('material','.metalnessmapNumber1','metalness');
                this.context.viewUtils.setupNumberUpdate('material','.emissivemapNumber1','emissiveIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.bumpmapNumber1','bumpScale');
                this.context.viewUtils.setupNumberUpdate('material','.displacementmapNumber1','displacementScale');
                this.context.viewUtils.setupNumberUpdate('material','.displacementmapNumber2','displacementBias');



                this.context.viewUtils.setupNumberUpdate('material','.bumpmapNumber1','bumpScale');

                this.context.viewUtils.setupColorUpdate('.emissivemapColorInputField','emissive');

                this.context.viewUtils.setupNumberUpdate('material','.normalmapNumber1','normalScale.x');
                this.context.viewUtils.setupNumberUpdate('material','.normalmapNumber2','normalScale.y');
                this.context.viewUtils.setupSaveMap('.normalmapSave','.normalmapInput','normalMap');
                this.context.viewUtils.setupSaveMap('.basemapSave','.basemapInput','map');
                this.context.viewUtils.setupSaveMap('.roughnessmapSave','.roughnessmapInput','roughnessMap');
                this.context.viewUtils.setupSaveMap('.metalnessmapSave','.metalnessmapInput','metalnessMap');
                this.context.viewUtils.setupSaveMap('.emissivemapSave','.emissivemapInput','emissiveMap');
                this.context.viewUtils.setupSaveMap('.environmentmapSave','.environmentmapInput','envMap');
                this.context.viewUtils.setupSaveMap('.alphamapSave','.alphamapInput','alphaMap');
                this.context.viewUtils.setupSaveMap('.displacementmapSave','.displacementmapInput','displacementMap');
                this.context.viewUtils.setupSaveMap('.lightmapSave','.lightmapInput','lightMap');
                this.context.viewUtils.setupSaveMap('.ambientocclusionmapSave','.ambientocclusionmapInput','aoMap');
            });
    }
    setupRepeatButton(){
        this.context.content.popup.querySelector('.repeatSettings')
            .addEventListener('mousedown',()=>{
                this.context.popupBackStack.push(()=>this.open());
                document.getElementById('backButton').setAttribute('scale','1 1 1');
                this.context.repeatSettingsModal.open();
            });
    }
    openBasic(){
        this.context.content.compileTemplates('map-settings-advanced',[
            //{name:'Base Map',number:1,color:'#ffffff',numberName:'Intensity',colorName:''}
            {name:'Base Map',url:this.material.map},
            {name:'Environment Map',url:this.material.envMap},
            {name:'Alpha Map',url:this.material.alphaMap},
            {name:'Specular Map',url:this.material.specularMap},
            {name:'Light Map',url:this.material.lightMap,hasNumber:true,number:this.material.lightMapIntensity,numberName:'Intensity'},
            {name:'Ambient Occlusion Map',url:this.material.aoMap,hasNumber:true,number:this.material.aoMapIntensity,numberName:'Intensity'},
        ],true)
            .then(contents=>{
                let mapSettings = contents[0];
                let envSettings = contents[1];
                let alphaSettings = contents[2];
                let specularSettings = contents[3];
                let lightSettings = contents[4];
                let aoSettings = contents[5];
                this.context.content.popup.setContent(
                    this.startSection+
                    mapSettings+envSettings+alphaSettings+specularSettings+
                    this.midSection+
                    lightSettings+aoSettings+
                    this.endSection
                );
            })
            .then(()=>{
                this.setupRepeatButton();
                this.context.viewUtils.setupNumberUpdate('material','.lightmapNumber1','lightMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.ambientocclusionmapNumber1','aoMapIntensity');
                this.context.viewUtils.setupSaveMap('.basemapSave','.basemapInput','map');
                this.context.viewUtils.setupSaveMap('.environmentmapSave','.environmentmapInput','envMap');
                this.context.viewUtils.setupSaveMap('.alphamapSave','.alphamapInput','alphaMap');
                this.context.viewUtils.setupSaveMap('.specularmapSave','.specularmapInput','specularMap');
                this.context.viewUtils.setupSaveMap('.lightmapSave','.lightmapInput','lightMap');
                this.context.viewUtils.setupSaveMap('.ambientocclusionmapSave','.ambientocclusionmapInput','aoMap');

            });
    }
    openLambert(){
        this.context.content.compileTemplates('map-settings-advanced',[
            {name:'Base Map',url:this.material.map},
            {name:'Environment Map',url:this.material.envMap},
            {name:'Alpha Map',url:this.material.alphaMap},
            {name:'Specular Map',url:this.material.specularMap},
            {name:'Emissive Map',
                url:this.material.emissiveMap,
                hasNumber:true,
                number:this.material.emissiveIntensity,
                numberName:'Intensity',
                hasColor:true,
                color:this.material.emissive,
                colorName:'Emissive Color'
            },
            {name:'Light Map',url:this.material.lightMap,hasNumber:true,number:this.material.lightMapIntensity,numberName:'Intensity'},
            {name:'Ambient Occlusion Map',url:this.material.aoMap,hasNumber:true,number:this.material.aoMapIntensity,numberName:'Intensity'},
        ],true)
            .then(contents=>{
                let mapSettings = contents[0];
                let envSettings = contents[1];
                let alphaSettings = contents[2];
                let specularSettings = contents[3];
                let emissiveSettings = contents[4];
                let lightSettings = contents[5];
                let aoSettings = contents[6];
                this.context.content.popup.setContent(
                    this.startSection+
                    mapSettings+envSettings+alphaSettings+emissiveSettings+specularSettings+
                    this.midSection+
                    lightSettings+aoSettings+
                    this.endSection
                );
            })
            .then(()=>{
                this.setupRepeatButton();
                this.context.viewUtils.setupNumberUpdate('material','.lightmapNumber1','lightMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.ambientocclusionmapNumber1','aoMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.emissivemapNumber1','emissiveIntensity');

                this.context.viewUtils.setupColorUpdate('.emissivemapColorInputField','emissive');

                this.context.viewUtils.setupSaveMap('.emissivemapSave','.emissivemapInput','emissiveMap');
                this.context.viewUtils.setupSaveMap('.basemapSave','.basemapInput','map');
                this.context.viewUtils.setupSaveMap('.environmentmapSave','.environmentmapInput','envMap');
                this.context.viewUtils.setupSaveMap('.alphamapSave','.alphamapInput','alphaMap');
                this.context.viewUtils.setupSaveMap('.specularmapSave','.specularmapInput','specularMap');
                this.context.viewUtils.setupSaveMap('.lightmapSave','.lightmapInput','lightMap');
                this.context.viewUtils.setupSaveMap('.ambientocclusionmapSave','.ambientocclusionmapInput','aoMap');
            });
    }
    openPhong(){
        this.context.content.compileTemplates('map-settings-advanced',[
            {name:'Base Map',url:this.material.map},
            {name:'Environment Map',url:this.material.envMap},
            {name:'Alpha Map',url:this.material.alphaMap},
            {name:'Bump Map',url:this.material.bumpMap,hasNumber:true,number:this.material.bumpScale,numberName:'Bump Scale'},
            {
                name:'Displacement Map',
                url:this.material.displacementMap,
                hasNumber:true,
                number:this.material.displacementScale,
                numberName:'Displacement Scale',
                hasNumber2:true,
                number2:this.material.displacementBias,
                numberName2:'Displacement Bias'
            },
            {name:'Emissive Map',
                url:this.material.emissiveMap,
                hasNumber:true,
                number:this.material.emissiveIntensity,
                numberName:'Intensity',
                hasColor:true,
                color:this.material.emissive,
                colorName:'Emissive Color'
            },
            {
                name:'Specular Map',
                url:this.material.specularMap,
                hasColor:true,
                color:this.material.specular,
                colorName:'Specular Color'
            },
            {name:'Normal Map',url:this.material.normalMap
                ,hasNumber:true,number:this.material.normalScale.x,numberName:'Normal Scale X'
                ,hasNumber2:true,number2:this.material.normalScale.y,numberName2:'Normal Scale Y'
            },
            {name:'Light Map',url:this.material.lightMap,hasNumber:true,number:this.material.lightMapIntensity,numberName:'Intensity'},
            {name:'Ambient Occlusion Map',url:this.material.aoMap,hasNumber:true,number:this.material.aoMapIntensity,numberName:'Intensity'},
        ],true)
            .then(contents=>{
                let mapSettings = contents[0];
                let envSettings = contents[1];
                let alphaSettings = contents[2];
                let bumpSettings = contents[3];
                let displacementSettings = contents[4];
                let emissiveSettings = contents[5];
                let lightSettings = contents[6];
                let aoSettings = contents[7];
                this.context.content.popup.setContent(
                    this.startSection+
                    mapSettings+envSettings+alphaSettings+emissiveSettings+
                    bumpSettings+displacementSettings+
                    this.midSection+
                    lightSettings+aoSettings+
                    this.endSection
                );
            })
            .then(()=>{
                this.setupRepeatButton();
                this.context.viewUtils.setupNumberUpdate('material','.lightmapNumber1','lightMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.ambientocclusionmapNumber1','aoMapIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.emissivemapNumber1','emissiveIntensity');
                this.context.viewUtils.setupNumberUpdate('material','.bumpmapNumber1','bumpScale');
                this.context.viewUtils.setupNumberUpdate('material','.displacementmapNumber1','displacementScale');
                this.context.viewUtils.setupNumberUpdate('material','.displacementmapNumber2','displacementBias');
                this.context.viewUtils.setupNumberUpdate('material','.bumpmapNumber1','bumpScale');

                this.context.viewUtils.setupColorUpdate('.emissivemapColorInputField','emissive');
                this.context.viewUtils.setupColorUpdate('.specularmapColorInputField','specular');


                this.context.viewUtils.setupNumberUpdate('material','.normalmapNumber1','normalScale.x');
                this.context.viewUtils.setupNumberUpdate('material','.normalmapNumber2','normalScale.y');
                this.context.viewUtils.setupSaveMap('.normalmapSave','.normalmapInput','normalMap');

                this.context.viewUtils.setupSaveMap('.basemapSave','.basemapInput','map');
                this.context.viewUtils.setupSaveMap('.emissivemapSave','.emissivemapInput','emissiveMap');
                this.context.viewUtils.setupSaveMap('.environmentmapSave','.environmentmapInput','envMap');
                this.context.viewUtils.setupSaveMap('.alphamapSave','.alphamapInput','alphaMap');
                this.context.viewUtils.setupSaveMap('.specularmapSave','.specularmapInput','specularMap');
                this.context.viewUtils.setupSaveMap('.lightmapSave','.lightmapInput','lightMap');
                this.context.viewUtils.setupSaveMap('.ambientocclusionmapSave','.ambientocclusionmapInput','aoMap');

            });
    }
}