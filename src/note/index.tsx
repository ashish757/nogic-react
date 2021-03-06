import React, { useContext, useEffect, useRef, useState } from "react";
import './styles.css'
import { Delete } from "../Icons";
import ColorPallete from "../colorPallete";
import Alert from "../alert";
import globalContext from "../globalState";

const Note = React.forwardRef(({note: original , abc }: any, ref: any,) => {
    const {dispatch} = useContext(globalContext)
    const [isDeleted, setIsDeleted] = useState<{ is: Boolean, timeoutId: any }>({ is: false, timeoutId: null })
    const [isEditing, SetIsEditing] = useState(false)
    const [note, setNote] = useState(original)

    const titleNode: any = useRef(null)
    const descNode: any = useRef(null)

    useEffect(() => {
        if (isDeleted.is) { abc() }

        if (isEditing) {
            const cover = ref.current
            const endEditing = (e: any) => {

                if (note.title !== titleNode.current.innerText || note.description !== descNode.current.innerText) {
                    fetch(process.env.REACT_APP_API_DOMAIN+ "edit_note.php", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: note.id,
                            title: titleNode.current.innerText,
                            description: descNode.current.innerText,
                        })
                    }).then(data => data.json()).then(() => {

                        // setNote({...note, title: titleNode.current.innerText, description: descNode.current.innerText})
                        // let notes: any = sessionStorage.getItem("notes")
                        // const newUpdatedNotes = JSON.parse(notes).map((n: any) => {
                        //     if (n.id === note.id) {
                        //       return { ...n, title: titleNode.current.innerText, description: descNode.current.innerText }
                        //     }
                        //     return n
                        //   })
                    
                        //   sessionStorage.setItem('notes', JSON.stringify(newUpdatedNotes))
                          dispatch({type: "UPDATE_NOTE", id: note.id, title: titleNode.current.innerText, description: descNode.current.innerText})
                    });
                }

                e.target.classList.remove("active")
                SetIsEditing(false)
            }

            cover.addEventListener('click', endEditing)
            return () => {
                cover.removeEventListener('click', endEditing)
            }
        }

    })


    const editNote = () => {
        ref.current.classList.add("active")
        SetIsEditing(true)
    }
    const deleteNoteTimeout = () => {
        setIsDeleted({ is: true, timeoutId: null });
        fetch(process.env.REACT_APP_API_DOMAIN+ "delete_note.php?id=" + note.id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(data => data.json()).then(res => {
            console.log(res)
            dispatch({type: "DELETE_NOTE", id: note.id})
        });

    }
    const deleteNote = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isEditing) {
            ref.current.classList.remove("active")
            SetIsEditing(false)
        }
        let deleteSetTimeoutId: any = setTimeout(deleteNoteTimeout, 3000)
        setIsDeleted({ is: true, timeoutId: deleteSetTimeoutId })
    }
    // UNDO
    const alertHandler1 = () => {
        clearTimeout(isDeleted.timeoutId)
        setIsDeleted({ is: false, timeoutId: null })
    }
    // OK
    const alertHandler2 = () => {
        clearTimeout(isDeleted.timeoutId)
        deleteNoteTimeout()
    }

    const colorBtnCallback = (color: string,colorCode: string) => {
        setNote({...note, color: color, colorCode: colorCode})
        fetch(process.env.REACT_APP_API_DOMAIN+ "edit_note_color.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: note.id,
                color: color,
            })
        }).then(data => data.json()).then(res => {
            console.log(res)
            dispatch({type: "UPDATE_NOTE_COLOR", id: note.id, color: color, colorCode: colorCode})
        });
    }
    let date = new Date(note.dateModified ? note.dateModified : note.dateCreated)

    console.count('NOTE RENDERED');
    return (
        <>
            <div className={"wrapper" + (isEditing ? " editing" : '') + (isDeleted.is ? " deleted" : '')}>

                <div className={"note"} onClick={editNote} style={{ background: note.colorCode }}>

                    <div ref={titleNode} contentEditable={isEditing} className="title" suppressContentEditableWarning={true}>{note.title}</div>
                    <div ref={descNode} contentEditable={isEditing} className="description" suppressContentEditableWarning={true}>{note.description}</div>

                    <div className="info">
                            <p>
                                {note.dateModified ? "last edited " : "created at "} 
                                {date.toLocaleTimeString('en-us', { minute: 'numeric', hour: 'numeric' })} {" "}
                                {date.toLocaleDateString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>

                    </div>
                    <div className="btns">
                        <Delete clickHandler={deleteNote} />
                        <ColorPallete callback={colorBtnCallback} activeColor={note.color} />
                    </div>
                </div>
            </div>
            {/* here using timeout bocz the isDeleted.is attribute is set to true after deleting so the note dont appear again but timoutid is removed after deleting the note */}
            {isDeleted.timeoutId ? <Alert title={`Deleted ${note.title}`} handler1={alertHandler1} handler2={alertHandler2} btn1={"UNDO"} btn2={"OK"} /> : ''}

        </>
    )
})

export default Note