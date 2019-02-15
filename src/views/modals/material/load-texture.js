export class LoadTextureModal {
    constructor(context) {
        this.context = context;
        this.setupTextures();
    }
    open(){
        this.uiRenderer = document.getElementById('mainRenderer');
        let items = [];
        for(let key in this.textures){
            items.push({name:key,friendly_name:key,image_url:'https://cdn.theexpanse.app/images/3DTextures-128/'+key+'/'+this.textures[key][0].name+'/'+this.textures[key][0].image});
        }
        this.context.content.compileTemplates('add-items',[{items:items}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        this.openFolder(button.dataset.key);
                    });
                }
            });
    }
    openFolder(folder){
        let items = [];
        for(let i = 0;i < this.textures[folder].length; i++){
            let texture = this.textures[folder][i];
            items.push({name:texture.name+'/'+texture.image,friendly_name:texture.name,image_url:'https://cdn.theexpanse.app/images/3DTextures-128/'+folder+'/'+texture.name+'/'+texture.image});
        }
        this.context.content.compileTemplates('add-items',[{items:items}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        this.openImage(folder,button.dataset.key);
                    });
                }
            });
    }
    openImage(folder,image){
        this.context.content.compileTemplates('add-items',[{items:
                window.location.host==='shaneharris.github.io'?
                    [{name:"128",friendly_name:'0.128K Image',image_url:'#small_icons',image_coords:'128 0 128 128'}]:[
                {name:"1024",friendly_name:'1K Image',image_url:'#small_icons',image_coords:'0 0 128 128'},
                {name:"512",friendly_name:'0.5K Image',image_url:'#small_icons',image_coords:'128 128 128 128'},
                {name:"256",friendly_name:'0.25K Image',image_url:'#small_icons',image_coords:'0 128 128 128'},
                {name:"128",friendly_name:'0.128K Image',image_url:'#small_icons',image_coords:'128 0 128 128'}
            ]}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        this.setTextures(folder,image,button.dataset.key)
                    });
                }
            });
    }
    setTextures(folder,image,size){
        let map = 'https://cdn.theexpanse.app/images/3DTextures-'+size+'/'+folder+'/'+image;
        let disp = 'https://cdn.theexpanse.app/images/3DTextures-'+size+'/'+folder+'/'+image.replace('COLOR.jpg','DISP.jpg');
        let normal = 'https://cdn.theexpanse.app/images/3DTextures-'+size+'/'+folder+'/'+image.replace('COLOR.jpg','NRM.jpg');
        let occ = 'https://cdn.theexpanse.app/images/3DTextures-'+size+'/'+folder+'/'+image.replace('COLOR.jpg','OCC.jpg');
       // let spec = 'https://cdn.theexpanse.app/images/3DTextures-'+size+'/'+folder+'/'+image.replace('COLOR.jpg','SPEC.jpg');
        this.setTexture(map,'map');
        this.setTexture(disp,'displacementMap');
        this.context.currentObject.settings.material.displacementScale =
            this.context.currentObject.object3D.material.displacementScale = 0.1;
        this.setTexture(normal,'normalMap');
        this.setTexture(occ,'aoMap');
        this.uiRenderer.modal.close();
       // this.setTexture(spec,'specularMap');
    }
    setTexture(url,type){
        let material = this.context.currentObject.settings.material;
        if(material.hasOwnProperty(type)){
            let textureProperty = 'texture';
            if(type==='aoMap'||type==='lightMap'){
                textureProperty = 'lightTexture';
            }
            material[type] = url;
            new THREE.TextureLoader().load(url,texture => {
                texture.repeat.set(material[textureProperty].repeat.x, material[textureProperty].repeat.y);
                texture.offset.set(material[textureProperty].offset.x, material[textureProperty].offset.y);
                texture.wrapS = material[textureProperty].wrapping.s;
                texture.wrapT = material[textureProperty].wrapping.t;
                texture.minFilter = material[textureProperty].filters.min;
                texture.magFilter = material[textureProperty].filters.mag;
                this.context.currentObject.object3D.material[type] = texture;
                this.context.currentObject.object3D.material[type].needsUpdate = true;
                this.context.currentObject.object3D.material.needsUpdate = true;
                this.context.currentObject.settings.state.updated = true;
                this.context.sceneGraph.sync();
            });
        }
    }
    setupTextures(){
        this.textures = {
            "Abstract": [
                {
                    "name": "Abstract_001",
                    "image": "Abstract_001_COLOR.jpg"
                },
                {
                    "name": "Abstract_002",
                    "image": "Abstract_002_COLOR.jpg"
                },
                {
                    "name": "Abstract_003",
                    "image": "Abstract_003_COLOR.jpg"
                },
                {
                    "name": "Abstract_004_SD",
                    "image": "Abstract_004_COLOR.jpg"
                },
                {
                    "name": "Abstract_005_SD",
                    "image": "Abstract_005_COLOR.jpg"
                },
                {
                    "name": "Abstract_006_SD",
                    "image": "Abstract_006_COLOR.jpg"
                },
                {
                    "name": "Abstract_007_SD",
                    "image": "Abstract_007_COLOR.jpg"
                },
                {
                    "name": "Organic_Abstract_001_SD",
                    "image": "Organic_abstract_001_COLOR.jpg"
                }
            ],
            "Asphalt": [
                {
                    "name": "Asphalt 001",
                    "image": "Asphalt_001_COLOR.jpg"
                },
                {
                    "name": "Asphalt_002_SD",
                    "image": "Asphalt_002_COLOR.jpg"
                },
                {
                    "name": "Asphalt_003_SD",
                    "image": "Asphalt_003_COLOR.jpg"
                },
                {
                    "name": "Asphalt_004_SD",
                    "image": "Asphalt_004_COLOR.jpg"
                },
                {
                    "name": "Asphalt_005_SD",
                    "image": "Asphalt_005_COLOR.jpg"
                }
            ],
            "Bark": [
                {
                    "name": "Bark_001_SD",
                    "image": "Bark_001_COLOR.jpg"
                },
                {
                    "name": "Bark_002_SD",
                    "image": "Bark_002_COLOR.jpg"
                }
            ],
            "Brick_wall": [
                {
                    "name": "Brick Wall 001",
                    "image": "Brick_Wall_001_COLOR.jpg"
                },
                {
                    "name": "Brick_wall_002",
                    "image": "Brick_wall_002_COLOR.jpg"
                },
                {
                    "name": "Brick_Wall_008_SD",
                    "image": "Brick_wall_008_COLOR.jpg"
                },
                {
                    "name": "Brick_Wall_009_SD",
                    "image": "Brick_Wall_009_COLOR.jpg"
                },
                {
                    "name": "Brick_Wall_010_SD",
                    "image": "Brick_Wall_010_COLOR.jpg"
                },
                {
                    "name": "Brick_Wall_011_SD",
                    "image": "Brick_Wall_011_COLOR.jpg"
                },
                {
                    "name": "Brick_wall_012_SD",
                    "image": "Brick_Wall_012_COLOR.jpg"
                },
                {
                    "name": "Brick_Wall_013_SD",
                    "image": "Brick_Wall_013_COLOR.jpg"
                },
                {
                    "name": "Old_Graffiti_Wall_001_SD",
                    "image": "Old_Graffiti_Wall_001_COLOR.jpg"
                }
            ],
            "Bronze": [
                {
                    "name": "Bronze 001",
                    "image": "Bronze_001_COLOR.jpg"
                },
                {
                    "name": "Bronze 002",
                    "image": "Bronze_002_COLOR.jpg"
                },
                {
                    "name": "Bronze 003",
                    "image": "Bronze_003_COLOR.jpg"
                },
                {
                    "name": "Bronze 004",
                    "image": "Bronze_004_COLOR.jpg"
                },
                {
                    "name": "Bronze 005",
                    "image": "Bronze_005_COLOR.jpg"
                }
            ],
            "Concrete": [
                {
                    "name": "Concrete 001",
                    "image": "Concrete_001_COLOR.jpg"
                },
                {
                    "name": "Concrete 002",
                    "image": "Concrete_002_COLOR.jpg"
                },
                {
                    "name": "Concrete 003",
                    "image": "Concrete_003_COLOR.jpg"
                },
                {
                    "name": "Concrete 004",
                    "image": "Concrete_004_COLOR.jpg"
                },
                {
                    "name": "Concrete 005",
                    "image": "Concrete_005_COLOR.jpg"
                },
                {
                    "name": "Concrete 006",
                    "image": "Concrete_006_COLOR.jpg"
                },
                {
                    "name": "Concrete_007",
                    "image": "Concrete_007_COLOR.jpg"
                },
                {
                    "name": "Concrete_008_SD",
                    "image": "Concrete_008_COLOR.jpg"
                },
                {
                    "name": "Concrete_009_SD",
                    "image": "Concrete_009_COLOR.jpg"
                },
                {
                    "name": "Concrete_010_SD",
                    "image": "Concrete_010_COLOR.jpg"
                },
                {
                    "name": "Concrete_Damaged_001_SD",
                    "image": "Concrete_Damaged_001_COLOR.jpg"
                },
                {
                    "name": "Concrete_panels_001_SD",
                    "image": "Concrete_Panels_001_COLOR.jpg"
                }
            ],
            "Dirt": [
                {
                    "name": "Dirt 001",
                    "image": "Dirt_001_COLOR.jpg"
                },
                {
                    "name": "Dirt_002",
                    "image": "Dirt_002_COLOR.jpg"
                },
                {
                    "name": "Dirt_003",
                    "image": "Dirt_003_COLOR.jpg"
                },
                {
                    "name": "Dirt_004_SD",
                    "image": "Dirt_004_COLOR.jpg"
                },
                {
                    "name": "Ground_Dirt_005_SD",
                    "image": "Ground_Dirt_005_COLOR.jpg"
                }
            ],
            "Fabric": [
                {
                    "name": "Camouflage_fabric_002_SD",
                    "image": "Camouflage_fabric_002_COLOR.jpg"
                },
                {
                    "name": "Camo_001",
                    "image": "Camo_001_COLOR.jpg"
                },
                {
                    "name": "Denim_001",
                    "image": "Denim_001_COLOR.jpg"
                },
                {
                    "name": "Knited_Fabric_001_SD",
                    "image": "Knited_Fabric_001_COLOR.jpg"
                },
                {
                    "name": "Padded_fabric_001",
                    "image": "Padded_fabric_001_COLOR.jpg"
                },
                {
                    "name": "Rug_001",
                    "image": "Rug_001_COLOR.jpg"
                },
                {
                    "name": "Rug_002",
                    "image": "Rug_002_COLOR.jpg"
                },
                {
                    "name": "Striped Fabric 001",
                    "image": "Striped_Fabric_001_COLOR.jpg"
                },
                {
                    "name": "Tweed_001_SD",
                    "image": "Tweed_001_COLOR.jpg"
                }
            ],
            "Flooring": [
                {
                    "name": "Cobblestone_001_SD",
                    "image": "Cobblestone_001_COLOR.jpg"
                },
                {
                    "name": "Pavement_Brick_001_SD",
                    "image": "Pavement_Brick_001_COLOR.jpg"
                },
                {
                    "name": "Portuguese Flor 001_SD",
                    "image": "Portuguese_Floor_001_COLOR.jpg"
                },
                {
                    "name": "Slate Flooring 001_SD",
                    "image": "Slate Flooring 001_COLOR.jpg"
                },
                {
                    "name": "Stone_Floor_002_SD",
                    "image": "Stone_Floor_002_COLOR.jpg"
                },
                {
                    "name": "Stone_Floor_003_SD",
                    "image": "Stone_Floor_003_COLOR.jpg"
                },
                {
                    "name": "Stone_Tiles_001_SD",
                    "image": "Stone_Tiles_001_COLOR.jpg"
                },
                {
                    "name": "Stone_Tiles_002_SD",
                    "image": "Stone_Tiles_002_COLOR.jpg"
                },
                {
                    "name": "Terracota_floor_tiles_001_SD",
                    "image": "Terracota_floor_tiles_001_COLOR.jpg"
                }
            ],
            // "Foliage Project_Freebies": [
            //     {
            //         "name": "Leaf test_001",
            //         "image": "Leaf test_001_COLOR.jpg"
            //     },
            //     {
            //         "name": "Potato_leaf_001",
            //         "image": "Potato_leaf_001_COLOR.jpg"
            //     }
            // ],
            "Gems": [
                {
                    "name": "Crystal_001_SD",
                    "image": "Crystal_001_COLOR.jpg"
                },
                {
                    "name": "Crystal_002_SD",
                    "image": "Crystal_002_COLOR.jpg"
                },
                {
                    "name": "Crystal_003_SD",
                    "image": "Crystal_003_COLOR.jpg"
                },
                {
                    "name": "Crystal_Metal_001_SD",
                    "image": "Crystal_Metal_001_COLOR.jpg"
                },
                {
                    "name": "Incrusted_Gems_001_SD",
                    "image": "Incrusted_Gems_001_COLOR.jpg"
                },
                {
                    "name": "Lapis_Lazuli_001_SD",
                    "image": "Lapis_Lazuli_001_COLOR.jpg"
                },
                {
                    "name": "Volcanic Glass 001",
                    "image": "Volcanic_glass_001_COLOR.jpg"
                }
            ],
            "Granite": [
                {
                    "name": "Granite_001_SD",
                    "image": "Granite_001_COLOR.jpg"
                },
                {
                    "name": "Granite_002_SD",
                    "image": "Granite_002_COLOR.jpg"
                }
            ],
            "Lava": [
                {
                    "name": "Lava 001",
                    "image": "Lava_001_COLOR.jpg"
                },
                {
                    "name": "Lava 002",
                    "image": "Lava_002_COLOR.jpg"
                },
                {
                    "name": "Lava 003",
                    "image": "Lava_003_COLOR.jpg"
                },
                {
                    "name": "Lava_004_SD",
                    "image": "Lava_004_COLOR.jpg"
                }
            ],
            "Leather": [
                {
                    "name": "Leather_001",
                    "image": "Leather_001_COLOR.jpg"
                },
                {
                    "name": "Leather_002",
                    "image": "Leather_002_COLOR.jpg"
                },
                {
                    "name": "Leather_003",
                    "image": "Leather_003_COLOR.jpg"
                },
                {
                    "name": "Leather_004",
                    "image": "Leather_004_COLOR.jpg"
                }
            ],
            "Marble": [
                {
                    "name": "Black_Marble_001",
                    "image": "Black_Marble_001_COLOR.jpg"
                },
                {
                    "name": "Blue_Marble_001",
                    "image": "Blue_Marble_001_COLOR.jpg"
                },
                {
                    "name": "Blue_Marble_002_SD",
                    "image": "Blue_Marble_002_COLOR.jpg"
                },
                {
                    "name": "Marble Colored 001",
                    "image": "marble_coloured_001_COLOR.jpg"
                },
                {
                    "name": "Red_Marble_001",
                    "image": "Red_Marble_001_COLOR.jpg"
                },
                {
                    "name": "Red_Marble_002",
                    "image": "Red_Marble_002_COLOR.jpg"
                },
                {
                    "name": "Rough_Marble_001",
                    "image": "Rough_Marble_001_COLOR.jpg"
                },
                {
                    "name": "White_Marble_001",
                    "image": "White_Marble_001_COLOR.jpg"
                },
                {
                    "name": "White_Marble_002",
                    "image": "White_Marble_002_COLOR.jpg"
                },
                {
                    "name": "White_Marble_003",
                    "image": "White_Marble_003_COLOR.jpg"
                },
                {
                    "name": "White_Marble_004_SD",
                    "image": "White_Marble_004_COLOR.jpg"
                }
            ],
            "Metal": [
                {
                    "name": "Alien_Metal_002_SD",
                    "image": "Alien_Metal_002_COLOR.jpg"
                },
                {
                    "name": "Coin_Stack_001_SD",
                    "image": "Coin_stack_001_COLOR.jpg"
                },
                {
                    "name": "Corrugated_Metal_001_SD",
                    "image": "Corrugated_Metal_001_COLOR.jpg"
                },
                {
                    "name": "Corrugated_Metal_002_SD",
                    "image": "Corrugated_Metal_002_COLOR.jpg"
                },
                {
                    "name": "Corrugated_Metal_003_SD",
                    "image": "Corrugated_Metal_003_COLOR.jpg"
                },
                {
                    "name": "Corrugated_Metal_004_SD",
                    "image": "Corrugated_Metal_004_COLOR.jpg"
                },
                {
                    "name": "Gold_Nugget_001_SD",
                    "image": "Gold_Nugget_001_COLOR.jpg"
                },
                {
                    "name": "Gun_Metal_Scratched_001_SD",
                    "image": "Gun_Metal_Scratched_001_COLOR.jpg"
                },
                {
                    "name": "Metal Alien 001",
                    "image": "Metal_Alien_001_COLOR.jpg"
                },
                {
                    "name": "Metal Panel 002_SD",
                    "image": "Metal_panel_002_COLOR.jpg"
                },
                {
                    "name": "Metal Panel 003_SD",
                    "image": "Metal_Panel_003_COLOR.jpg"
                },
                {
                    "name": "Metal Panel 004_SD",
                    "image": "Metal_Panel_004_COLOR.jpg"
                },
                {
                    "name": "Metal Panel 005_SD",
                    "image": "Metal_Panel_005_COLOR.jpg"
                },
                {
                    "name": "Metal_Crystals_001_SD",
                    "image": "Metal_Crystals_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Crystals_002_SD",
                    "image": "Metal_Crystals_002_COLOR.jpg"
                },
                {
                    "name": "Metal_dented_001",
                    "image": "Metal_dented_001_COLOR.jpg"
                },
                {
                    "name": "Metal_galvanized_001",
                    "image": "Metal_galvanized_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Panel_001_SD",
                    "image": "Metal_Panel_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_008_SD",
                    "image": "Metal_Plate_008_COLOR.jpg"
                },
                {
                    "name": "Metal_scratched_001",
                    "image": "Metal_scratched_001_COLOR.jpg"
                },
                {
                    "name": "Metal_scratched_002",
                    "image": "Metal_scratched_002_COLOR.jpg"
                },
                {
                    "name": "Metal_scratched_003",
                    "image": "Metal_scratched_003_COLOR.jpg"
                },
                {
                    "name": "Metal_scratched_004",
                    "image": "Metal_scratched_004_COLOR.jpg"
                },
                {
                    "name": "Metal_scratched_005",
                    "image": "Metal_scratched_005_COLOR.jpg"
                },
                {
                    "name": "Metal_scratched_006",
                    "image": "Metal_scratched_006_COLOR.jpg"
                }
            ],
            "Metal Armor": [
                {
                    "name": "Metal_weave_001",
                    "image": "Metal_weave_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Weave_002_SD",
                    "image": "Metal_Weave_002_COLOR.jpg"
                }
            ],
            "Metal Grunge": [
                {
                    "name": "Metal_grunge_001",
                    "image": "Metal_grunge_001_COLOR.jpg"
                },
                {
                    "name": "Metal_grunge_002",
                    "image": "Metal_grunge_002_COLOR.jpg"
                },
                {
                    "name": "Metal_grunge_003",
                    "image": "Metal_grunge_003_COLOR.jpg"
                },
                {
                    "name": "Metal_Grunge_004_SD",
                    "image": "Metal_Grunge_004_COLOR.jpg"
                }
            ],
            "Metal Pattern": [
                {
                    "name": "Engraved_Metal_001_SD",
                    "image": "Engraved_Metal_001_COLOR.jpg"
                },
                {
                    "name": "Engraved_Metal_002_SD",
                    "image": "Engraved_Metal_002_COLOR.jpg"
                },
                {
                    "name": "Engraved_Metal_003_SD",
                    "image": "Engraved_Metal_003_COLOR.jpg"
                },
                {
                    "name": "Metal_Diamond_001_SD",
                    "image": "Metal_Diamond_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Grill_001_SD",
                    "image": "Metal_Grill_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Mesh_001_SD",
                    "image": "Metal_Mesh_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Pattern_001_SD",
                    "image": "Metal_Pattern_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_001",
                    "image": "Metal_plate_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_002_SD",
                    "image": "Metal_Plate_002_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_003_SD",
                    "image": "Metal_Plate_003_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_004",
                    "image": "Metal_Plate_004_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_005_SD",
                    "image": "Metal_plate_005_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_006_SD",
                    "image": "Metal_plate_006_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_007_SD",
                    "image": "Metal_Plate_007_COLOR.jpg"
                },
                {
                    "name": "Metal_Plate_009_SD",
                    "image": "Metal_Plate_009_COLOR.jpg"
                },
                {
                    "name": "Metal_Scales_001_SD",
                    "image": "Metal_Scales_001_COLOR.jpg"
                }
            ],
            "Metal Rusted": [
                {
                    "name": "Metal_Rusted_001",
                    "image": "Metal_Rusted_001_COLOR.jpg"
                },
                {
                    "name": "Metal_Rusted_002",
                    "image": "Metal_Rusted_002_COLOR.jpg"
                },
                {
                    "name": "Metal_Rusted_003",
                    "image": "Metal_Rusted_003_COLOR.jpg"
                },
                {
                    "name": "Metal_Rusted_004",
                    "image": "Metal_Rusted_004_COLOR.jpg"
                },
                {
                    "name": "Metal_Rusted_005",
                    "image": "Metal_Rusted_005_COLOR.jpg"
                },
                {
                    "name": "Metal_Rusted_006",
                    "image": "Metal_Rusted_006_COLOR.jpg"
                },
                {
                    "name": "Metal_Rusted_007",
                    "image": "Metal_Rusted_007_COLOR.jpg"
                }
            ],
            "Metal Rusted Painted Peeling": [
                {
                    "name": "Metal_rusted_painted_001",
                    "image": "Metal_rusted_painted_001_COLOR.jpg"
                },
                {
                    "name": "Metal_rusted_painted_002",
                    "image": "Metal_rusted_painted_002_COLOR.jpg"
                },
                {
                    "name": "Metal_rusted_painted_003",
                    "image": "Metal_rusted_painted_003_COLOR.jpg"
                },
                {
                    "name": "Metal_rusted_painted_004",
                    "image": "Metal_rusted_painted_004_COLOR.jpg"
                },
                {
                    "name": "Metal_rusted_painted_005",
                    "image": "Metal_rusted_painted_005_COLOR.jpg"
                }
            ],
            "Misc": [
                {
                    "name": "Cereals_001_SD",
                    "image": "Cereals_001_COLOR.jpg"
                },
                {
                    "name": "Hazard_Paint_001_SD",
                    "image": "Hazard_Paint_001_COLOR.jpg"
                },
                {
                    "name": "Strawberry_milkshake_foam_001_SD",
                    "image": "Strawberry_milkshake_foam_001_COLOR.jpg"
                },
                {
                    "name": "Sushi_Rice_001",
                    "image": "Sushi_Rice_001_COLOR.jpg"
                }
            ],
            "Mud": [
                {
                    "name": "Cracked_Mud_001_SD",
                    "image": "Cracked_Mud_001_COLOR.jpg"
                }
            ],
            "Organic Animal": [
                {
                    "name": "Alien Flesh 002",
                    "image": "Alien_flesh_002_COLOR.jpg"
                },
                {
                    "name": "Alien_Flesh_001",
                    "image": "Alien_Flesh_001_COLOR.jpg"
                },
                {
                    "name": "Alien_Muscle_001_SD",
                    "image": "Alien_Muscle_001_COLOR.jpg"
                },
                {
                    "name": "Bacteria_001_SD",
                    "image": "Bacteria_001_COLOR.jpg"
                },
                {
                    "name": "Bone_structure_001",
                    "image": "Bone_structure_001_COLOR.jpg"
                },
                {
                    "name": "Brain_Matter_001_SD",
                    "image": "Brain_Matter_001_COLOR.jpg"
                },
                {
                    "name": "Human_skin_001",
                    "image": "Human_skin_001_COLOR.jpg"
                },
                {
                    "name": "Organic_Matter_001_SD",
                    "image": "Organic_Matter_001_COLOR.jpg"
                }
            ],
            "Organic Vegetable": [
                {
                    "name": "Avocado_skin_SD",
                    "image": "Avocado_skin_COLOR.jpg"
                },
                {
                    "name": "Basket_weave_001_SD",
                    "image": "Basket_weave_001_COLOR.jpg"
                },
                {
                    "name": "Cork 001",
                    "image": "Cork_001_COLOR.jpg"
                },
                {
                    "name": "Dead_leaves_001",
                    "image": "Dead_leaves_001_COLOR.jpg"
                },
                {
                    "name": "Grass_001",
                    "image": "Grass_001_COLOR.jpg"
                },
                {
                    "name": "Grass_001_SD",
                    "image": "Grass_001_COLOR.jpg"
                },
                {
                    "name": "Grass_002",
                    "image": "Grass_002_COLOR.jpg"
                },
                {
                    "name": "Grass_003_SD",
                    "image": "Grass_003_COLOR.jpg"
                },
                {
                    "name": "Grass_004_SD",
                    "image": "Grass_004_COLOR.jpg"
                },
                {
                    "name": "Orange_001_SD",
                    "image": "Orange_001_COLOR.jpg"
                },
                {
                    "name": "Wood_bits_001",
                    "image": "Wood_bits_001_COLOR.jpg"
                }
            ],
            "Pebbles": [
                {
                    "name": "Pebbles 001",
                    "image": "Pebbles_001_COLOR.jpg"
                },
                {
                    "name": "Pebbles 002",
                    "image": "Pebbles_002_COLOR.jpg"
                },
                {
                    "name": "Pebbles_003_SD",
                    "image": "Pebbles_003_COLOR.jpg"
                },
                {
                    "name": "Pebbles_004_SD",
                    "image": "Pebbles_004_COLOR.jpg"
                },
                {
                    "name": "Rubble_001_SD",
                    "image": "Rubble_001_COLOR.jpg"
                }
            ],
            "Plaster": [
                {
                    "name": "Plaster_001_SD",
                    "image": "Plaster_001_COLOR.jpg"
                },
                {
                    "name": "Plaster_002_SD",
                    "image": "Plaster_002_COLOR.jpg"
                }
            ],
            // "Plastic": [
            //     {
            //         "name": "Plastic_001_SD",
            //         "image": "Plastic_001_COLOR.jpg"
            //     }
            // ],
            "Roof Tiles": [
                {
                    "name": "Wood Roof Tiles 001_SD",
                    "image": "Wood_Roof_Tiles_001_COLOR.jpg"
                }
            ],
            "Rough_stones": [
                {
                    "name": "Canyon_Rock_001_SD",
                    "image": "Canyon_Rock_001_COLOR.jpg"
                },
                {
                    "name": "Moon_001_SD",
                    "image": "Moon_001_COLOR.jpg"
                },
                {
                    "name": "Rock_023_SD",
                    "image": "Rock_023_COLOR.jpg"
                },
                {
                    "name": "Rock_Ore_001_SD",
                    "image": "Rock_Ore_001_COLOR.jpg"
                },
                {
                    "name": "Rock_Ore_002_SD",
                    "image": "Rock_Ore_002_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 001",
                    "image": "Rough_rock_001_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 002",
                    "image": "Rough_Rock_002_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 003",
                    "image": "Rough_rock_003_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 004",
                    "image": "Rough_rock_004_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 005",
                    "image": "Rough_rock_005_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 006",
                    "image": "Rough_Rock_006_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 007",
                    "image": "Rough_Rock_007_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 008",
                    "image": "Rough_Rock_008_COLOR.jpg"
                },
                {
                    "name": "Rough Rock 009",
                    "image": "Rough_rock_009_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_011",
                    "image": "Rough_rock_011_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_012",
                    "image": "Rough_rock_012_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_013",
                    "image": "Rough_rock_013_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_014",
                    "image": "Rough_rock_014_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_015",
                    "image": "Rough_rock_015_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_017",
                    "image": "Rough_rock_017_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_018",
                    "image": "Rough_rock_018_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_019",
                    "image": "Rough_rock_019_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_020",
                    "image": "Rough_rock_020_COLOR.jpg"
                },
                {
                    "name": "Rough_rock_021",
                    "image": "Rough_rock_021_COLOR.jpg"
                },
                {
                    "name": "Rough_Rock_022_SD",
                    "image": "Rough_Rock_022_COLOR.jpg"
                }
            ],
            "Sand": [
                {
                    "name": "Sand 001",
                    "image": "Sand_001_COLOR.jpg"
                },
                {
                    "name": "Sand 002",
                    "image": "Sand 002_COLOR.jpg"
                },
                {
                    "name": "Sand_003_SD",
                    "image": "Sand_003_COLOR.jpg"
                }
            ],
            "Sandstone_rock": [
                {
                    "name": "Sandstone 001",
                    "image": "Sandstone_rock_001_COLOR.jpg"
                },
                {
                    "name": "Sandstone 002",
                    "image": "Sandstone_rock_002_COLOR.jpg"
                }
            ],
            "Snow": [
                {
                    "name": "Snow_001_SD",
                    "image": "Snow_001_COLOR.jpg"
                },
                {
                    "name": "Snow_002_SD",
                    "image": "Snow_002_COLOR.jpg"
                },
                {
                    "name": "Snow_003_SD",
                    "image": "Snow_003_COLOR.jpg"
                }
            ],
            "Soil": [
                {
                    "name": "Dried_Soil_001",
                    "image": "Dried_Soil_001_COLOR.jpg"
                }
            ],
            "Stone Floor": [
                {
                    "name": "Flooring_Stone_001",
                    "image": "Flooring_Stone_001_COLOR.jpg"
                },
                {
                    "name": "Stone Floor 002",
                    "image": "Stone_Floor_002_COLOR.jpg"
                },
                {
                    "name": "Stone Floor 003",
                    "image": "Stone_Floor_003_COLOR.jpg"
                },
                {
                    "name": "Stone_Floor_004",
                    "image": "Stone_Floor_004_COLOR.jpg"
                }
            ],
            "Tiles": [
                {
                    "name": "Azulejos_001_2K",
                    "image": "Azulejos_001_COLOR.jpg"
                },
                {
                    "name": "Azulejos_002_SD",
                    "image": "Azulejos_002_COLOR.jpg"
                },
                {
                    "name": "Azulejos_003_SD",
                    "image": "Azulejos_003_COLOR.jpg"
                },
                {
                    "name": "Subway_tiles_001_SD",
                    "image": "Subway_tiles_001_COLOR.jpg"
                },
                {
                    "name": "Tiles 001",
                    "image": "Tiles_001_COLOR.jpg"
                },
                {
                    "name": "Tiles 002",
                    "image": "Tiles_002_COLOR.jpg"
                },
                {
                    "name": "Tiles 003",
                    "image": "Tiles_003_COLOR.jpg"
                },
                {
                    "name": "Tiles 004",
                    "image": "Tiles_004_COLOR.jpg"
                },
                {
                    "name": "Tiles 007",
                    "image": "Tiles 007_COLOR.jpg"
                },
                {
                    "name": "Tiles_006",
                    "image": "Tiles_006_COLOR.jpg"
                },
                {
                    "name": "Tiles_008_SD",
                    "image": "Tiles_008_COLOR.jpg"
                },
                {
                    "name": "Tiles_009_SD",
                    "image": "Tiles_009_COLOR.jpg"
                },
                {
                    "name": "Tiles_010_SD",
                    "image": "Tiles_010_COLOR.jpg"
                },
                {
                    "name": "Tiles_012_SD",
                    "image": "Tiles_012_COLOR.jpg"
                },
                {
                    "name": "Tiles_013_SD",
                    "image": "Tiles_013_COLOR.jpg"
                },
                {
                    "name": "Tiles_014_SD",
                    "image": "Tiles_014_COLOR.jpg"
                },
                {
                    "name": "Tiles_011_SD",
                    "image": "Tiles_011_COLOR.jpg"
                }
            ],
            "Wall Brick": [
                {
                    "name": "Brick_wall_006",
                    "image": "Brick_wall_006_COLOR.jpg"
                },
                {
                    "name": "Brick_wall_007",
                    "image": "Brick_wall_007_COLOR.jpg"
                }
            ],
            "Wall Damaged": [
                {
                    "name": "Wall Damaged 001",
                    "image": "Wall_damaged_001_COLOR.jpg"
                }
            ],
            "Wall Painted": [
                {
                    "name": "Rough_Painted_Wall_001_SD",
                    "image": "Rough_Painted_Wall_001_COLOR.jpg"
                }
            ],
            "Wall paper": [
                {
                    "name": "Wallpaper_001",
                    "image": "Wallpaper_001_COLOR.jpg"
                }
            ],
            "Wall Stone": [
                {
                    "name": "Stone Wall 001",
                    "image": "Stone_Wall_001_COLOR.jpg"
                },
                {
                    "name": "Stone Wall 002",
                    "image": "Stone_Wall_002_COLOR.jpg"
                },
                {
                    "name": "Stone Wall 003",
                    "image": "Stone_Wall_003_COLOR.jpg"
                },
                {
                    "name": "Stone Wall 004",
                    "image": "Stone_Wall_004_COLOR.jpg"
                },
                {
                    "name": "Stone_Wall_005_SD",
                    "image": "Stone_Wall_005_COLOR.jpg"
                },
                {
                    "name": "Stone_Wall_006_SD",
                    "image": "Stone_Wall_006_COLOR.jpg"
                },
                {
                    "name": "Stone_Wall_007_SD",
                    "image": "Stone_Wall_007_COLOR.jpg"
                },
                {
                    "name": "Stone_wall_008_SD",
                    "image": "Stone_Wall_008_COLOR.jpg"
                },
                {
                    "name": "Stone_Wall_009_SD",
                    "image": "Stone_Wall_009_COLOR.jpg"
                }
            ],
            "Water and Ice": [
                {
                    "name": "Ice_001",
                    "image": "Ice_001_COLOR.jpg"
                },
                {
                    "name": "Ice_002_SD",
                    "image": "Ice_002_COLOR.jpg"
                },
                {
                    "name": "Water_001_SD",
                    "image": "Water_001_COLOR.jpg"
                }
            ],
            "Wood": [
                {
                    "name": "Aspen_bark_001_SD",
                    "image": "Aspen_bark_001_COLOR.jpg"
                },
                {
                    "name": "Bamboo_001",
                    "image": "Bamboo_001_COLOR.jpg"
                },
                {
                    "name": "Burnt_wood_001_SD",
                    "image": "Burnt_wood_001_COLOR.jpg"
                },
                {
                    "name": "Grainy_Wood_001_SD",
                    "image": "Grainy_Wood_001_COLOR.jpg"
                },
                {
                    "name": "Old_Wood_001_SD",
                    "image": "Old_Wood_001_COLOR.jpg"
                },
                {
                    "name": "Particle Board 001_SD",
                    "image": "Particle_Board_001_COLOR.jpg"
                },
                {
                    "name": "Stylized_Bark_001_SD",
                    "image": "Stylized_Bark_001_COLOR.jpg"
                },
                {
                    "name": "Stylized_Bark_002_SD",
                    "image": "Stylized_Bark_002_COLOR.jpg"
                },
                {
                    "name": "Wood_001_SD",
                    "image": "Wood_001_COLOR.jpg"
                },
                {
                    "name": "Wood_002_SD",
                    "image": "Wood_002_COLOR.jpg"
                },
                {
                    "name": "Wood_003_SD",
                    "image": "Wood_003_COLOR.jpg"
                },
                {
                    "name": "Wood_004_SD",
                    "image": "Wood_004_COLOR.jpg"
                },
                {
                    "name": "Wood_005_SD",
                    "image": "Wood_005_COLOR.jpg"
                },
                {
                    "name": "Wood_Wall_001_SD",
                    "image": "Wood_Wall_001_COLOR.jpg"
                }
            ],
            "Wood floor": [
                {
                    "name": "Wood Floor 001",
                    "image": "Wood_Floor_001_COLOR.jpg"
                },
                {
                    "name": "Wood Floor 002",
                    "image": "Wood_Floor_002_COLOR.jpg"
                },
                {
                    "name": "Wood Floor 003",
                    "image": "Wood_Floor_003_COLOR.jpg"
                },
                {
                    "name": "Wood Floor 004",
                    "image": "Wood_Floor_004_COLOR.jpg"
                },
                {
                    "name": "Wood Floor 005_SD",
                    "image": "Wood_Floor_005_COLOR.jpg"
                },
                {
                    "name": "Wood Floor_006_SD",
                    "image": "Wood_Floor_006_COLOR.jpg"
                },
                {
                    "name": "Wood Floor_007_SD",
                    "image": "Wood_Floor_007_COLOR.jpg"
                },
                {
                    "name": "Wood Floor_008_SD",
                    "image": "Wood_Floor_008_COLOR.jpg"
                }
            ],
            "Wood Plancks": [
                {
                    "name": "Wood_plancks_003",
                    "image": "Wood_plancks_003_COLOR.jpg"
                },
                {
                    "name": "Wood_plancks_004",
                    "image": "Wood_plancks_004_COLOR.jpg"
                },
                {
                    "name": "Wood_plancks_005_SD",
                    "image": "Wood_plancks_005_COLOR.jpg"
                },
                {
                    "name": "Wood_plancks_006_SD",
                    "image": "Wood_plancks_006_COLOR.jpg"
                },
                {
                    "name": "Wood_Planks_008_SD",
                    "image": "Wood_Planks_008_COLOR.jpg"
                },
                {
                    "name": "Wood_Planks_009_SD",
                    "image": "Wood_Planks_009_COLOR.jpg"
                },
                {
                    "name": "Wood_plank_007_SD",
                    "image": "Wood_plank_007_COLOR.jpg"
                }
            ]
        }
    }
}
