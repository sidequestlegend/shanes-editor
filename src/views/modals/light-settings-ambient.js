import {LightSettings} from "./light-settings";
export class LightSettingsAmbient extends LightSettings{
    open(lightSettings){
        lightSettings = lightSettings || this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:'AmbientLight'});
        this.baseSettings(lightSettings)
            .then(contents=>this.context.content.popup.setContent(this.settingsTitleWrap('Ambient Light Settings')+contents[0]))
            .then(()=>this.setupBaseUpdate())
            .then(()=> {

            });

    }
}