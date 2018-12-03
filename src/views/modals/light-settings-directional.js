import {LightSettings} from "./light-settings";
export class LightSettingsDirectional extends LightSettings{
    open(lightSettings){
        lightSettings = lightSettings || this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:'DirectionalLight'});
        let _contents = this.settingsTitleWrap('Directional Light Settings');
        this.baseSettings(lightSettings)
            .then(contents=>_contents+=this.wrapSettings(contents[0]))
            .then(()=>this.context.content.compileTemplates('three-number-inputs',[{name:'Target:',vector:this.context.currentObject.object3D.target.position,className:'targetSettings'}],true))
            .then(contents=>_contents+=this.settingsTitleWrap('Light Target',55)+contents)
            .then(()=>this.shadowSettings(lightSettings))
            .then(contents=>_contents+=contents)
            .then(()=>this.context.content.popup.setContent(_contents))
            .then(()=>this.setupBaseUpdate())
            .then(()=>this.setupShadowUpdate())
            .then(()=> {
                this.setupTransformListeners(lightSettings);
                this.setupTransformButtonGroup(document.querySelector('.targetSettings'));
            });

    }
}