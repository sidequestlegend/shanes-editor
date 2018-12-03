export class KennyCategoriesModal{
    constructor(context) {
        this.context = context;
        /*
        "castle-kit-1.0":{name:'Castle Kit',mtl_path:'Models/',image: 'Preview.png'},
        "racing-kit-1.2":{name:'Racing',mtl_path:'Models/',image: 'Preview.png'},
        "space-kit-1.0":{name:'Space',mtl_path:'Models/',image: 'Preview.png'},
         */
        this.types = [
            {name:'3d-nature-pack',friendly_name:'3D Nature',image_url:'#kenny_3d_nature_pack'},
            {name:'3d-road-pack',friendly_name:'3D Roads',image_url:'#kenny_3d_road_pack'},
            {name:'castle-kit-1.0',friendly_name:'Castle Kit',image_url:'#kenny_castle_kit'},
            {name:'kenney_furniturepack',friendly_name:'Furniture',image_url:'#kenny_furniturepack'},
            {name:'kenney_holidaypack',friendly_name:'Holiday',image_url:'#kenny_holidaypack'},
            {name:'medieval-town-base',friendly_name:'Medieval',image_url:'#kenny_medieval_town_base'},
            {name:'modular-buildings-100-assets',friendly_name:'Buildings',image_url:'#kenny_modular_buildings'},
            {name:'naturepack_extended',friendly_name:'Nature',image_url:'#kenny_naturepack_extended'},
            {name:'racing-kit-1.2',friendly_name:'Racing',image_url:'#kenny_racing_kit'},
            {name:'space-kit-1.0',friendly_name:'Space',image_url:'#kenny_space_kit'},
            {name:'watercraftpack_kenney',friendly_name:'Water Craft',image_url:'#kenny_watercraftpack'},
            {name:'weaponpack_assets',friendly_name:'Weapons',image_url:'#kenny_weaponpack'}
        ];
    }
    open() {
        this.context.content.compileTemplates('add-items',[{top_image_url:'https://cdn.theexpanse.app/images/kenney/kenny_banner.png',items:this.types,hidePages:true}],true)
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