export class AvatarModalsModal{
    constructor(context) {
        this.context = context;
        this.maskTypes = ["black-white","blood-moon","blue-blush","blue-white","copper","forest","white-orange"];
        this.types = {
            "Food":["Cake","Donuts","HamEgg","Hamburger","IceCream","Milk","Waffle"],
            "Hair":["Hair1","Hair2","Hair3","Hair4","Hair5"],
            "Hats":["BikeHelmet","BlueHelmet","BucketHat","ChristmasHat","ConeOfShame","DrinkingHat","FancyHat","FlopHat","FootballHelmet","FrenchPolicemanHat","GraduationHat","LadyHat","NavyParadeHat","PaperBag","PartyHat","PropellorHat","SailorsHat","SleepingHat","SoldierHelmet","SunHat","SweatBand","TrafficCone","UmbrellaHat","ValkyreHelmet","WeldingMask","WinterHat"],
            "Masks-Mask1":this.maskTypes,
            "Masks-Mask2":this.maskTypes,
            "Masks-Mask3":this.maskTypes,
            "Masks-Mask4":this.maskTypes,
            "Masks-Mask5":this.maskTypes,
            "Masks-Mask6":this.maskTypes,
            "Masks-Mask7":this.maskTypes,
            "Masks-Mask8":this.maskTypes,
            "Weapons-pack1":["arrow-explosive","arrow-piercing","arrow-regular","bomb","bow","crossbow","dagger","potion-berserk","potion-generic","potion-health","potion-mana","potion-stamina","shield","smoke-grenade","sulfur-grenade","sword"],
            "Weapons-pack2":["axe1","axe2","hammer","spear","sword1","sword2","sword3","sword4","sword5"],
            "Weapons-pack3":["angelblade","moonandstarblade","moonandstarsword","wingblade","wingsword"],
            "Weapons-pack4":["arrow","axe","bow","darksword","demonstaff","goldsword","naturestaff","shield","spiked-club","stonesword"],
            "Weapons-pack5":["ak47","barettm107","coltm4","gatling","handgun","rocket-shells","shotgun","smaw","uzi"]
        };
    }
    open(category) {
        let namedItems = [];
        for(let i = 0; i < this.types[category].length; i++){
            namedItems.push({name:this.types[category][i],friendly_name:this.types[category][i],image_url:'#avatar_'+category.toLowerCase().replace('-','_')+"_"+this.types[category][i].toLowerCase().replace('-','_')});
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