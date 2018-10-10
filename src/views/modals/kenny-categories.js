export class KennyCategoriesModal{
    constructor(context) {
        this.context = context;
        /*
        "castle-kit-1.0":{name:'Castle Kit',mtl_path:'Models/',image: 'Preview.png'},
        "racing-kit-1.2":{name:'Racing',mtl_path:'Models/',image: 'Preview.png'},
        "space-kit-1.0":{name:'Space',mtl_path:'Models/',image: 'Preview.png'},
         */
        this.types = [
            //{name:'3d-minigolf-pack',friendly_name:'3D Minigolf',image_url:'https://cdn.theexpanse.app/images/kenney/3d-minigolf-pack/Sample.png'},
            {name:'3d-nature-pack',friendly_name:'3D Nature',image_url:'https://cdn.theexpanse.app/images/kenney/3d-nature-pack/Sample.png'},
            {name:'3d-road-pack',friendly_name:'3D Roads',image_url:'https://cdn.theexpanse.app/images/kenney/3d-road-pack/Sample.png'},
           // {name:'blockycharacters',friendly_name:'Avatars',image_url:'https://cdn.theexpanse.app/images/kenney/blockycharacters/Sample.png'},
            {name:'castle-kit-1.0',friendly_name:'Castle Kit',image_url:'https://cdn.theexpanse.app/images/kenney/castle-kit-1.0/Sample.png'},
            {name:'kenney_furniturepack',friendly_name:'Furniture',image_url:'https://cdn.theexpanse.app/images/kenney/kenney_furniturepack/Sample.png'},
            {name:'kenney_holidaypack',friendly_name:'Holiday',image_url:'https://cdn.theexpanse.app/images/kenney/kenney_holidaypack/Sample.png'},
            {name:'medieval-town-base',friendly_name:'Medieval',image_url:'https://cdn.theexpanse.app/images/kenney/medieval-town-base/Sample.png'},
            {name:'modular-buildings-100-assets',friendly_name:'Buildings',image_url:'https://cdn.theexpanse.app/images/kenney/modular-buildings-100-assets/Sample.png'},
            {name:'naturepack_extended',friendly_name:'Nature',image_url:'https://cdn.theexpanse.app/images/kenney/naturepack_extended/Sample.png'},
            {name:'racing-kit-1.2',friendly_name:'Racing',image_url:'https://cdn.theexpanse.app/images/kenney/racing-kit-1.2/Sample.png'},
            {name:'space-kit-1.0',friendly_name:'Space',image_url:'https://cdn.theexpanse.app/images/kenney/space-kit-1.0/Sample.png'},
            {name:'watercraftpack_kenney',friendly_name:'Water Craft',image_url:'https://cdn.theexpanse.app/images/kenney/watercraftpack_kenney/Sample.png'},
            {name:'weaponpack_assets',friendly_name:'Weapons',image_url:'https://cdn.theexpanse.app/images/kenney/weaponpack_assets/Sample.png'}
        ];
    }
    open() {
        this.context.content.compileTemplates('add-items',[{top_image_url:'https://cdn.theexpanse.app/images/kenney/kenny_banner.png',items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        this.context.kennyModelsModal.open(button.dataset.key);
                    });
                }
            });
    }
}