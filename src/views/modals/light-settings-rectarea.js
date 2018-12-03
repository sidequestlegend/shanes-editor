import {LightSettings} from "./light-settings";
export class LightSettingsRectArea extends LightSettings{
    open(lightSettings){
        lightSettings = lightSettings || this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:'RectAreaLight'});
        let _contents = this.settingsTitleWrap('Rectangle Area Light Settings');
        this.baseSettings(lightSettings)
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Width',number:lightSettings.width}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('number',[{name:'Height',number:lightSettings.height}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.popup.setContent(_contents))
            .then(()=>this.setupBaseUpdate())
            .then(()=> {
                this.context.viewUtils.setupNumberUpdate('light','.width','width');
                this.context.viewUtils.setupNumberUpdate('light','.height','height');
                this.setupTransformListeners(lightSettings);
            });

    }
}