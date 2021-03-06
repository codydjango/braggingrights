import React from 'react'
import produce from 'immer'
import { ListContext } from '~/context'
import store from '~/services/store'

function withAggregates(list) {
    const counts = {}
    return JSON.parse(JSON.stringify(list)).map(obj => {
        if (obj.multiple) delete obj.multiple
        if (Number.isInteger(counts[obj.text])) {
            counts[obj.text] += 1
            obj.multiple = counts[obj.text]
        } else {
            counts[obj.text] = 1
        }
        return obj
    })
}

function bumpActiveIndex(list, index = 0) {
    let nextIndex, task

    // loop through the list starting at the active index until there are
    // no tasks left to be completed
    while (list.filter(i => (i.checked === false)).length > 0) {
        task = list[index]

        if (task && (task.checked === false)) {
            task.active = true
            break
        }

        index = ((index + 1) < list.length) ? (index + 1) : 0
    }

    return list
}

function activeIndex(list) {
    const index = list.indexOf(list.filter(i => i.active)[0])
    return (index !== -1) ? index : null
}

export default class ListProvider extends React.Component {
    constructor(props) {
        super(props)
        this.state = { list: [] }
        this.updateList = this.updateList.bind(this)

        this.doneRef = React.createRef()

        this.clearList = this.clearList.bind(this)
        this.setActiveListItem = this.setActiveListItem.bind(this)
        this.doneActiveListItem = this.doneActiveListItem.bind(this)
        this.undoActiveListItem = this.undoActiveListItem.bind(this)
        this.postponeActiveListItem = this.postponeActiveListItem.bind(this)
        this.addToList = this.addToList.bind(this)
        this.syncToServer = this.syncToServer.bind(this)
    }

    syncToServer() {
        setTimeout(() => { store.save() }, 100)
    }

    componentDidMount() {
        store.register('list', this)
    }

    componentWillUnmount() {
        store.register('list', this, true)
    }

    async updateList(list, save = true) {
        return await new Promise((resolve) => {
            this.setState(produce(draft => {
                draft.list = withAggregates(list)
            }), () => {
                if (save) setTimeout(() => { store.save() }, 100)
                resolve(true)
            })
        })
    }

    clearList() {
        this.setState(produce(draft => {
            draft.list = draft.list.map(i => {
                i.checked = false
                i.active = false
                return i
            })

            if (draft.list.length > 0)
                draft.list[0].active = true
        }), this.syncToServer)
    }

    addToList(item) {
        this.setState(produce(draft => {
            draft.list.push(item)

            if (activeIndex(draft.list) === null) {
                draft.list = bumpActiveIndex(draft.list)
            }

        }), this.syncToServer)
    }

    setActiveListItem(id) {
        this.setState(produce(draft => {
            draft.list = draft.list.map(i => {
                i.active = (i.id == id)
                return i
            })
        }), () => {
            if (this.doneRef.current) this.doneRef.current.focus()
            this.syncToServer()
        })
    }

    doneActiveListItem() {
        this.setState(produce(draft => {
            const index = activeIndex(draft.list)

            draft.list[index].checked = true
            draft.list[index].active = false
            draft.list = bumpActiveIndex(draft.list, index + 1)
        }), this.syncToServer)
    }

    undoActiveListItem() {
        this.setState(produce(draft => {
            draft.list.filter(i => i.active)[0].checked = false
        }), this.syncToServer)
    }

    postponeActiveListItem() {
        this.setState(produce(draft => {
            const index = activeIndex(draft.list)
            draft.list[index].active = false
            bumpActiveIndex(draft.list, index + 1)
        }), this.syncToServer)
    }

    render() {
        return (
            <ListContext.Provider
                value={{
                    ...this.state,
                    updateList: this.updateList,

                    clearList: this.clearList,
                    addToList: this.addToList,
                    setActiveListItem: this.setActiveListItem,
                    doneActiveListItem: this.doneActiveListItem,
                    undoActiveListItem: this.undoActiveListItem,
                    postponeActiveListItem: this.postponeActiveListItem,
                    doneRef: this.doneRef
                }}>
            { this.props.children }
            </ListContext.Provider>
        )
    }
}
