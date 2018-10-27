export class LightTypeModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Ambient',friendly_name:'Ambient',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Directional',friendly_name:'Directional',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Hemisphere',friendly_name:'Hemisphere',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Point',friendly_name:'Point',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Rectangle Area',friendly_name:'RectArea',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
            {name:'Spot',friendly_name:'Spot',image_url:'https://cdn.theexpanse.app/images/icons/objects/lights.jpg'},
        ];
    }
    open() {
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++) {
                    let button = buttons[i];
                    button.addEventListener('click', () => {
                        console.log(button.dataset.key);
                    });
                }
            });
    }
}