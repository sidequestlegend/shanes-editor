export class KennyCategoriesModal{
    constructor(context) {
        this.context = context;
        /*
        "castle-kit-1.0":{name:'Castle Kit',mtl_path:'Models/',image: 'Preview.png'},
        "racing-kit-1.2":{name:'Racing',mtl_path:'Models/',image: 'Preview.png'},
        "space-kit-1.0":{name:'Space',mtl_path:'Models/',image: 'Preview.png'},

        <!--Preview1 = 0 256 256 128-->
        <!--Preview2 = 0 384 256 128-->
        <!--Preview3 = 256 256 256 128-->
        <!--Preview4 = 256 384 256 128-->
        <!--Preview5 = 512 0 256 128-->
        <!--Preview6 = 512 128 256 128-->
        <!--Preview7 = 768 0 256 128-->
        <!--Preview8 = 512 256 256 128-->
        <!--Preview9 = 512 384 256 128-->
        <!--Preview10 = 768 128 256 128-->
        <!--Preview11 = 768 256 256 128-->
        <!--Preview12 = 0 0 512 256-->


        <!--3d-nature-pack = 128 256 128 128-->
        <!--3d-road-pack = 256 256 128 128-->
        <!--castle-kit-1.0 = 128 384 128 128-->
        <!--kenney_furniturepack = 256 384 128 128-->
        <!--kenney_holidaypack = 384 256 128 128-->
        <!--medieval-town-base = 384 384 128 128-->
        <!--modular-buildings-100-assets = 512 0 128 128-->
        <!--naturepack_extended = 640 0 128 128-->
        <!--racing-kit-1.2 = 512 128 128 128-->
        <!--space-kit-1.0 = 768 0 128 128-->
        <!--watercraftpack_kenney = 640 128 128 128-->
        <!--weaponpack_assets = 512 256 128 128-->
         */
        this.types = [
            {name:'3d-nature-pack',friendly_name:'3D Nature',image_url:'#small_icons',image_coords:'128 256 128 128'},
            {name:'3d-road-pack',friendly_name:'3D Roads',image_url:'#small_icons',image_coords:'256 256 128 128'},
            {name:'castle-kit-1.0',friendly_name:'Castle Kit',image_url:'#small_icons',image_coords:'128 384 128 128'},
            {name:'kenney_furniturepack',friendly_name:'Furniture',image_url:'#small_icons',image_coords:'256 384 128 128'},
            {name:'kenney_holidaypack',friendly_name:'Holiday',image_url:'#small_icons',image_coords:'384 256 128 128'},
            {name:'medieval-town-base',friendly_name:'Medieval',image_url:'#small_icons',image_coords:'384 384 128 128'},
            {name:'modular-buildings-100-assets',friendly_name:'Buildings',image_url:'#small_icons',image_coords:'512 0 128 128'},
            {name:'naturepack_extended',friendly_name:'Nature',image_url:'#small_icons',image_coords:'640 0 128 128'},
            {name:'racing-kit-1.2',friendly_name:'Racing',image_url:'#small_icons',image_coords:'512 128 128 128'},
            {name:'space-kit-1.0',friendly_name:'Space',image_url:'#small_icons',image_coords:'768 0 128 128'},
            {name:'watercraftpack_kenney',friendly_name:'Water Craft',image_url:'#small_icons',image_coords:'640 128 128 128'},
            {name:'weaponpack_assets',friendly_name:'Weapons',image_url:'#small_icons',image_coords:'512 256 128 128'}
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