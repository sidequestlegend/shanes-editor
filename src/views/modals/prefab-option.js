export class PrefabOptionModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'My Prefabs',friendly_name:'My Prefabs',image_url:'https://cdn.theexpanse.app/images/icons/objects/prefab.jpg'},
            {name:'Prefab Market',friendly_name:'Prefab Market',image_url:'https://cdn.theexpanse.app/images/icons/objects/market.jpg'}
        ]

    }
    open() {
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]));
    }
}