import {Editor} from "./app";
class Main{
    constructor(){
        let editor = new Editor(this,'http://'+window.location.host+'/');
        this.editorPanel = document.getElementById('editorContainer');
        document.getElementById('uiPanel').setAttribute('scale','1 1 1');
        this.sceneEl = document.querySelector('a-scene');
        this.sceneEl.addEventListener('modal-closed',()=>{
            this.content.popup.components['ui-scroll-pane'].setContent('');
        });
        let scenes = [
            {
                "scenes_id": 1,
                "name": "Electric",
                "short_code": "16t",
                "url": "scene/16t.json"
            },
            {
                "scenes_id": 2,
                "name": "Thirsty",
                "short_code": "gl",
                "url": "scene/gl.json"
            }
        ];
        let loadingText = document.getElementById('loadingText');
        let loadingTextBack = document.getElementById('loadingTextBack');
        let start = 0;
        this.sceneEl.addEventListener('scene-load-start',()=>{
            start = new Date().getTime();
            loadingTextBack.setAttribute('scale','1 1 1');
        });
        this.sceneEl.addEventListener('scene-loading',e=>{
            loadingText.setAttribute('value',Math.round(e.detail*100)+'%');
            if(e.detail===1){
                console.log('Scene loaded in: '+((new Date().getTime()-start)/1000)+"s");
                setTimeout(()=>{
                    loadingText.setAttribute('value','');
                    loadingTextBack.setAttribute('scale','0 0 0');
                },500)
            }
        });
        this.cameraDummy = document.getElementById('cameraDummyPosition');
        document.getElementById('menuButton').addEventListener('click',()=>this.openEditor());
        document.getElementById('closeButton').addEventListener('mousedown',()=>this.closeEditor());
    }
    closeEditor(){
        let _this = this;
        new TWEEN.Tween({x:0.5})
            .to({x:0.0000001}, 650)
            .onUpdate(function(){
                _this.editorPanel.setAttribute('scale',this.x+' '+this.x+' '+this.x);
            })
            .easing(TWEEN.Easing.Exponential.Out).start();
    }
    openEditor(){
        this.cameraDummy.object3D.position.set(0,0,-0.8);
        this.cameraDummy.object3D.updateMatrixWorld();
        let _this = this;
        new TWEEN.Tween({x:0.0000001})
            .to({x:0.5}, 650)
            .onUpdate(function(){
                _this.editorPanel.setAttribute('scale',this.x+' '+this.x+' '+this.x);
            })
            .easing(TWEEN.Easing.Exponential.Out).start();

        new TWEEN.Tween(_this.editorPanel.getAttribute('position'))
            .to(this.cameraDummy.object3D.localToWorld(new THREE.Vector3(0,0,0)), 250)
            .easing(TWEEN.Easing.Exponential.Out).start();


        let quaternion = new THREE.Quaternion();
        this.cameraDummy.object3D.updateMatrixWorld();
        this.cameraDummy.object3D.matrixWorld.decompose( new THREE.Vector3(), quaternion, new THREE.Vector3() );
        new TWEEN.Tween(this.editorPanel.object3D.quaternion).to(quaternion, 500)
            .easing(TWEEN.Easing.Exponential.Out)
            .start();
    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    document.querySelector('a-scene').addEventListener('loaded',()=>{
        window.main = new Main();
    })
});