import {LightSettings} from "./light-settings";
export class LightSettingsHemisphere extends LightSettings{
    open(lightSettings){
        lightSettings = lightSettings || this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:'HemisphereLight'});
        let _contents = this.settingsTitleWrap('Hemisphere Light Settings');
        this.baseSettings(lightSettings)
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('color',[{name:'Sky Color',number:lightSettings.color}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('color',[{
                name:'Ground Color',
                number:lightSettings.groundColor,
                colorButtonClass:'groundInputField',
                colorButtonTextClass:'groundInputFieldText'}],true))
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.popup.setContent(_contents))
            .then(()=>this.setupBaseUpdate())
            .then(()=> {
                this.context.viewUtils.setupColorUpdate('.colorInputField','color');
                this.context.viewUtils.setupColorUpdate('.groundInputField','groundColor');
            });

    }
}