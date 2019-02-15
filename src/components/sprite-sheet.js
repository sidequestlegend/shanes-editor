
let hexUVs = [0.5,1,0.0669872984290123,0.75,0.5,0.5,0.0669872984290123,0.75,0.0669872984290123,0.25,0.5,0.5,0.0669872984290123,0.25,0.5,0,0.5,0.5,0.5,0,0.9330127239227295,0.25,0.5,0.5,0.9330127239227295,0.25,0.9330127239227295,0.75,0.5,0.5,0.9330127239227295,0.75,0.5,1,0.5,0.5];
let squareUVs = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];
module.exports = AFRAME.registerComponent('sprite-sheet', {
    schema: {
        coords:{type: 'vec4'},
        shape:{default:'hex'},
        width:{type:'int', default:1024},
        height:{type:'int', default:1024}
    },
    init(){
        this.el.addEventListener('materialtextureloaded',()=> {
            this.setUVs();
            this.isReady = true;
        });
    },
    update(){
        if(!this.isReady)return;
        this.setUVs();
        this.el.getObject3D('mesh').geometry.attributes.uv.needsUpdate = true;
    },
    setUVs(){
        let geometry = this.el.getObject3D('mesh').geometry;
        let left = this.data.coords.x/this.data.width,
            top = this.data.coords.y/this.data.height,
            width = this.data.coords.z/this.data.width,
            height = this.data.coords.w/this.data.height;
        let uvs = this.makeUvs(left,top,width, height);
        geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    },
    makeUvs(left,top,width, height){
        let uvs = new Float32Array(this.data.shape==='hex'?hexUVs:squareUVs);
        for(let i = 0 ; i < uvs.length/2; i ++){
            uvs[i*2] = (uvs[(i*2)]*width)+left;
            uvs[(i*2)+1] = 1-(top+((1-uvs[(i*2)+1])*height));
        }
        return uvs;
    }
});
