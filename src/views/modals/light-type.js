export class LightTypeModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Spot',friendly_name:'Spot',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Ambient',friendly_name:'Ambient',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Directional',friendly_name:'Directional',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'}
        ];
    }
    open() {
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]));
    }
}