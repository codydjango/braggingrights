import React from 'react'
import Task from '~/components/Task'
import getKey from '~/utilities/getKey'
import throttle from '~/utilities/throttle'
import produce from 'immer'

function aggregates(list) {
    const counts = {}

    return list.slice(0).map(i => {
        delete i.multiple
        if (Number.isInteger(counts[i.text])) {
            counts[i.text] += 1
            i.multiple = counts[i.text]
        } else {
            counts[i.text] = 1
        }
        return i
    })
}

export default props => {
    const normalTask = item => <Task tabIndex="0" handleAction={ props.onClick } item={ item } />
    const editTask = item => <Task handleAction={ () => {} } item={ item } />

    const onDragStart = (e, i) => {
        let list = props.list
        let dragged = props.list[i]

        e.dataTransfer.effectAllowed = 'move'
        e.target.parentNode.classList.add('dragged')
        e.dataTransfer.setData('text/html', e.target.parentNode)
        e.dataTransfer.setDragImage(e.target.parentNode, 20, 20)

        props.onUpdate({ list, dragged })
    }

    const onDragEnd = e => {
        e.target.parentNode.classList.remove('dragged')

        let list = props.list
        let dragged = null

        props.onUpdate({ list, dragged })
    }

    const onDragOver = i => {
        if (props.dragged === props.list[i]) return

        let dragged = props.dragged
        let list = props.list.filter(i => i.id != props.dragged.id)
        list.splice(i, 0, props.dragged)

        props.onUpdate({ list, dragged })
    }

    const onClick = i => {
        // delete
        let dragged = props.dragged
        let list = produce(props.list, draft => {
            if (draft.splice(i, 1)[0].active && draft.length > 0) {
                draft[0].active = true
            }
        })

        props.onUpdate({ list, dragged })
    }

    const calculatedList = aggregates(props.list)
    return (props.edit)
        ? (<ul className={'list taskList edit'}>
                { calculatedList.map((item, i) => {
                    return (<li
                        onDragOver={ () => { throttle(onDragOver, 100)(i) } }
                        key={ getKey(item) }>
                        <div className="drag"
                            draggable
                            onDragStart={ e => { onDragStart(e, i) }}
                            onDragEnd={ e => { onDragEnd(e) }}
                            onClick={ e => onClick(i) }>
                            { editTask(item) }
                        </div>
                    </li>)
                })}
            </ul>)
        : (<ul className={'list taskList'}>
                { calculatedList.map((item, i) => (<li
                    className={ (props.edit) ? 'drag': '' }
                    key={ getKey(item) }>
                    { normalTask(item) }
                </li>))}
            </ul>)
}
