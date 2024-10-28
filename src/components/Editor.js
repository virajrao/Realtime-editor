import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS, { CODE_CHANGE } from '../Actions';

const Editor = ({socketRef,roomId,onCodeChange}) => {
  const editorRef = useRef(null);
  // this works only for once during the
  //  initial rerendering of the components 
    useEffect(()=>{
      async function init(){
        
        editorRef.current = Codemirror.fromTextArea(
          document.getElementById('realtimeEditor'),
          {
              mode: { name: 'javascript', json: true },
              theme: 'dracula',
              autoCloseTags: true,
              autoCloseBrackets: true,
              lineNumbers: true,
              lineWrapping:true
          }
      );

      // doing the console log and getting the value from this 
        // editorRef.current.setValue(`console.log('hello world !')`);
      

        editorRef.current.on('change',
            (instance,changes)=>{
              // console.log('changes',changes);
              const {origin} = changes;
              const code = instance.getValue();

              
              // everytime it refreshes the new code 
              onCodeChange(code);

              if(origin !== 'setValue'){
                // now printing on to the console the value of the code
                    socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                    roomId,
                    code,
                });
              }
            }
          );
        }
     
     init();
     
    },[]);


    // useEffect 
    useEffect(() =>{

        if(socketRef.current){
            socketRef.current.on(ACTIONS.CODE_CHANGE,({code})=>{
                if(code !== null){
                    editorRef.current.setValue(code);
                }
            });
        }
        
        return()=>{
          socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    },
    [socketRef.current]
  );



  return (
    <div>
      <textarea id='realtimeEditor'></textarea>
    </div>
  );
  
}

export default Editor;