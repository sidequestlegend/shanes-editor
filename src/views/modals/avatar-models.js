export class AvatarModalsModal{
    constructor(context) {
        this.context = context;
        this.maskTypes = [
            "black-white",
            "blood-moon",
            "blue-blush",
            "blue-white",
            "copper",
            "forest",
            "white-orange"
        ];
        this.maskTypes = [
            {name:"black-white",coords:'0 0 128 128',image_url:'avatar_icons_01'},
            {name:"blood-moon",coords:'128 0 128 128',image_url:'avatar_icons_01'},
            {name:"blue-blush",coords:'0 128 128 128',image_url:'avatar_icons_01'},
            {name:"blue-white",coords:'128 128 128 128',image_url:'avatar_icons_01'},
            {name:"copper",coords:'256 0 128 128',image_url:'avatar_icons_01'},
            {name:"forest",coords:'256 128 128 128',image_url:'avatar_icons_01'},
            {name:"white-orange",coords:'384 0 128 128',image_url:'avatar_icons_01'},
        ];


        this.types = {
            "Food":[
                {name:"Cake",coords:'0 0 128 128',image_url:'avatar_icons_01'},
                {name:"Donuts",coords:'128 0 128 128',image_url:'avatar_icons_01'},
                {name:"HamEgg",coords:'128 128 128 128',image_url:'avatar_icons_01'},
                {name:"Hamburger",coords:'0 128 128 128',image_url:'avatar_icons_01'},
                {name:"IceCream",coords:'256 0 128 128',image_url:'avatar_icons_01'},
                {name:"Milk",coords:'256 128 128 128',image_url:'avatar_icons_01'},
                {name:"Waffle",coords:'384 0 128 128',image_url:'avatar_icons_01'}
            ],
            "Hair":[
                {name:"Hair1",coords:'0 128 128 128',image_url:'avatar_icons_05'},
                {name:"Hair2",coords:'128 128 128 128',image_url:'avatar_icons_05'},
                {name:"Hair3",coords:'256 0 128 128',image_url:'avatar_icons_05'},
                {name:"Hair4",coords:'256 128 128 128',image_url:'avatar_icons_05'},
                {name:"Hair5",coords:'384 0 128 128',image_url:'avatar_icons_05'}
            ],
            "Hats":[
                {name:"BikeHelmet",coords:'384 128 128 128',image_url:'avatar_icons_01'},
                {name:"BlueHelmet",coords:'0 256 128 128',image_url:'avatar_icons_01'},
                {name:"BucketHat",coords:'0 384 128 128',image_url:'avatar_icons_01'},
                {name:"ChristmasHat",coords:'128 256 128 128',image_url:'avatar_icons_01'},
                {name:"ConeOfShame",coords:'256 256 128 128',image_url:'avatar_icons_01'},
                {name:"DrinkingHat",coords:'128 384 128 128',image_url:'avatar_icons_01'},
                {name:"FancyHat",coords:'256 384 128 128',image_url:'avatar_icons_01'},
                {name:"FlopHat",coords:'384 256 128 128',image_url:'avatar_icons_01'},
                {name:"FootballHelmet",coords:'384 384 128 128',image_url:'avatar_icons_01'},
                {name:"FrenchPolicemanHat",coords:'512 0 128 128',image_url:'avatar_icons_01'},
                {name:"GraduationHat",coords:'640 0 128 128',image_url:'avatar_icons_01'},
                {name:"LadyHat",coords:'512 128 128 128',image_url:'avatar_icons_01'},
                {name:"NavyParadeHat",coords:'768 0 128 128',image_url:'avatar_icons_01'},
                {name:"PaperBag",coords:'640 128 128 128',image_url:'avatar_icons_01'},
                {name:"PartyHat",coords:'512 256 128 128',image_url:'avatar_icons_01'},
                {name:"PropellorHat",coords:'640 256 128 128',image_url:'avatar_icons_01'},
                {name:"SailorsHat",coords:'512 384 128 128',image_url:'avatar_icons_01'},
                {name:"SleepingHat",coords:'768 128 128 128',image_url:'avatar_icons_01'},
                {name:"SoldierHelmet",coords:'896 0 128 128',image_url:'avatar_icons_01'},
                {name:"SunHat",coords:'896 128 128 128',image_url:'avatar_icons_01'},
                {name:"SweatBand",coords:'768 256 128 128',image_url:'avatar_icons_01'},
                {name:"TrafficCone",coords:'640 384 128 128',image_url:'avatar_icons_01'},
                {name:"UmbrellaHat",coords:'768 384 128 128',image_url:'avatar_icons_01'},
                {name:"ValkyreHelmet",coords:'896 256 128 128',image_url:'avatar_icons_01'},
                {name:"WeldingMask",coords:'896 384 128 128',image_url:'avatar_icons_01'},
                {name:"WinterHat",coords:'0 512 128 128',image_url:'avatar_icons_01'}
            ],
            "Masks-Mask1":this.maskTypes,
            "Masks-Mask2":this.maskTypes,
            "Masks-Mask3":this.maskTypes,
            "Masks-Mask4":this.maskTypes,
            "Masks-Mask5":this.maskTypes,
            "Masks-Mask6":this.maskTypes,
            "Masks-Mask7":this.maskTypes,
            "Masks-Mask8":this.maskTypes,
            "Weapons-pack1":[
                "arrow-explosive","arrow-piercing","arrow-regular","bomb","bow","crossbow","dagger","potion-berserk",
                "potion-generic","potion-health","potion-mana","potion-stamina","shield","smoke-grenade","sulfur-grenade","sword"],
            "Weapons-pack2":["axe1","axe2","hammer","spear","sword1","sword2","sword3","sword4","sword5"],
            "Weapons-pack3":["angelblade","moonandstarblade","moonandstarsword","wingblade","wingsword"],
            "Weapons-pack4":["arrow","axe","bow","darksword","demonstaff","goldsword",
                "naturestaff","shield","spiked-club", "stonesword"],
            "Weapons-pack5":["ak47","barettm107","coltm4","gatling","handgun","rocket-shells","shotgun","smaw","uzi"]
        };
    }
    open(category) {
        let namedItems = [];
        for(let i = 0; i < this.types[category].length; i++){
            namedItems.push({
                name:this.types[category][i],
                friendly_name:this.types[category][i],
                image_url:this.types[category][i].image_url,
                image_coords:this.types[category][i].coords
            });
        }
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('add-items',[{items:namedItems}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        let url = this.context.rootUrl+'models/avatars/'+category.replace('-','/')+'/'+button.dataset.key+"/scene.gltf";
                        this.context.modelSettings.open({
                            type:"Custom",
                            sub_type:'GLTF2',
                            url:url,
                        },object=>this.context.sceneGraph.add(this.context.currentObject,object)
                            .then(child=>{
                                this.context.showObject();
                                this.context.displayBox.setObject(child.object3D);
                                setTimeout(()=>{
                                    this.context.itemView.open(child);
                                    this.context.sceneGraph.sync();
                                },250);
                                this.uiRenderer.modal.close();
                            }));
                    });
                }
            });
    }
}