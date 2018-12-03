import {LightSettings} from "./light-settings";
export class LightSettingsSpot extends LightSettings{
    open(lightSettings){
        lightSettings = lightSettings || this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:'SpotLight'});
        let _contents = this.settingsTitleWrap('Spot Light Settings');
        this.baseSettings(lightSettings)
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Distance',number:lightSettings.distance}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Angle',number:lightSettings.angle}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Penumbra',number:lightSettings.penumbra}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Decay',number:lightSettings.decay}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('three-number-inputs',[{name:'Target:',vector:this.context.currentObject.object3D.target.position,className:'targetSettings'}],true))
            .then(contents=>_contents+=this.settingsTitleWrap('Light Target',55)+contents)
            .then(()=>this.shadowSettings(lightSettings))
            .then(contents=>_contents+=contents)
            .then(()=>this.context.content.popup.setContent(_contents))
            .then(()=>this.setupBaseUpdate())
            .then(()=>this.setupShadowUpdate())
            .then(()=> {
                this.context.viewUtils.setupNumberUpdate('light','.distance','distance');
                this.context.viewUtils.setupNumberUpdate('light','.angle','angle');
                this.context.viewUtils.setupNumberUpdate('light','.penumbra','penumbra');
                this.context.viewUtils.setupNumberUpdate('light','.decay','decay');
                this.setupTransformListeners(lightSettings);
                this.setupTransformButtonGroup(document.querySelector('.targetSettings'));
            });

    }
}