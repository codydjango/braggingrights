import React, { useState } from 'react'
import Theirs from '~/components/Theirs'
import Mine from '~/components/Mine'
import Next from '~/components/Next'
import storage from '~/storage'

import { TASKS, DEFAULTLIST } from '~/settings'

window.setState = (state) => {
    setTimeout(() => {
        window.everyday.setState(state)
    }, 1)
}

class App extends React.Component {
    constructor(props) {
        super(props)

        let state
        try {
            state = storage.load()
        } catch (err) {
            state = { mine: this.aggregates(this.flatten(DEFAULTLIST))}
        }

        window.everyday = this

        this.state = state
        this.handleReset = this.handleReset.bind(this)
        this.handleClearDone = this.handleClearDone.bind(this)
        this.handleSetActive = this.handleSetActive.bind(this)
    }

    getTask(taskId) {
        return TASKS[taskId - 1]
    }

    flatten(list) {
        return list.map(i => {
            i.task = this.getTask(i.taskId)
            return i
        })
    }

    aggregates(list) {
        const counts = {}
        return list.map(i => {
            if (counts[i.taskId]) {
                counts[i.taskId] += 1
                i.multiple = counts[i.taskId]
            } else {
                counts[i.taskId] = 1
            }

            return i
        })
    }

    handleClearDone() {
        let list = this.state.mine.map(i => {
            i.checked = false
            i.active = false
            return i
        })

        list[0].active = true

        this.setState({ mine: list})
    }

    handleReset() {
        this.setState({ mine: this.aggregates(this.flatten(DEFAULTLIST)) })
    }

    handleSetActive(id) {
        this.setState((state) => {
            return { mine: state.mine.map(i => {
                i.active = (i.id == id)
                return i
            })}
        })
    }

    render() {
        storage.save({ mine: this.state.mine })

        return (
            <div className="app">
                <h1>everyday</h1>
                <div className="container">
                    <Next list={ this.state.mine } />
                    <Mine list={ this.state.mine } handleAction={ this.handleSetActive } handleClearDone={ this.handleClearDone }/>
                    <Theirs list={ TASKS } />
                </div>
            </div>
        )
    }
}

export default App
