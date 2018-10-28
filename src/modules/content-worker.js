import Handlebars from 'handlebars/dist/handlebars.min';
import './handlebars-helpers';
export class ContentWorker{
    constructor(){
        self.addEventListener('message', event => {
            let response = {reqId:event.data.reqId};
            switch(event.data.type){
                case "compile":
                    response.data = event.data.elements.map(e=>Handlebars.compile(e.text)(e.data));
                    break;
            }
            self.postMessage(response);
        });
    }
}