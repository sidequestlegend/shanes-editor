import {LightSettings} from "./light-settings";
export class LightSettingsPoint extends LightSettings{
    open(lightSettings){
        lightSettings = lightSettings || this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:'PointLight'});
        let _contents = this.settingsTitleWrap('Point Light Settings');
        this.baseSettings(lightSettings)
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Distance',number:lightSettings.distance}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Decay',number:lightSettings.decay}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.shadowSettings(lightSettings))
            .then(contents=>_contents+=contents)
            .then(()=>this.context.content.popup.setContent(_contents))
            .then(()=>this.setupBaseUpdate())
            .then(()=>this.setupShadowUpdate())
            .then(()=> {
                this.context.viewUtils.setupNumberUpdate('light','.distance','distance');
                this.context.viewUtils.setupNumberUpdate('light','.decay','decay');
                this.setupTransformListeners(lightSettings);
            });

    }
}