import React from 'react'
import styled from 'styled-components'
import Button from '~/components/Button'
import uniqueId from '~/utilities/uniqueId'

import { StatusContext } from '~/context'

let validationErr = new Error()

const StyledDiv = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    margin-bottom: 5px;

    .button {
        margin: 0 0 0 2px;
    }

    .field {
        flex: 1;
        padding: 0px;
        margin: 0px;

        label {
            display: none;
        }

        input {
            background-color: rgb(243, 243, 0);
            border: 1px solid #e5e700;
            width: 100%;
            transition : border 500ms ease-out;
        }

        &.error {
            input {
                border-color: tomato;
            }
        }
    }
`

class FormLine extends React.Component {
    static validationError(message) {
        validationErr.message = message
        return validationErr
    }

    constructor(props) {
        super(props)
        this.id = uniqueId()

        this.inputName = `_${ this.id }`
        this.inputRef = React.createRef()

        this.state = {}
        this.state.error = false

        this.onClick = this.onClick.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
    }

    get className() {
        return `formLine ${ this.props.className }`
    }

    setError(error) {
        this.updateStatus(error)

        const resetError = () => {
            this.setState(state => {
                delete state.error
                return state
            }, () => {
                this.inputRef.current.focus()
            })
        }

        this.setState(state => {
            setTimeout(resetError, 3000)
            state.error = error
            return state
        })
    }

    onClick(e) {
        let value = this.inputRef.current.value || this.inputRef.current.placeholder
        window.inputRef = this.inputRef

        try {
            this.props.onSubmit(this.props.validators.reduce((acc, fn) => fn(acc), value))
            this.inputRef.current.value = ''
        } catch (err) {
            console.log('err', err)
            if (err === validationErr) {
                this.setError(err.message)
            } else {
                throw err
            }
        }
    }

    onKeyPress(e) {
        if (e.key === 'Enter') this.onClick(e)
    }

    render() {
        return (
            <StyledDiv>
                <div className={ `field ${ (this.state.error) ? 'error' : '' }` }>
                    <label
                        htmlFor={ this.inputName }></label>
                    <input
                        type="text"
                        ref={ this.inputRef }
                        name={ this.inputName }
                        value={ this.value }
                        onKeyPress={ this.onKeyPress }
                        placeholder={ this.props.inputPlaceholder || '' } />
                </div>
                <Button
                    text={ this.props.submitText || 'submit' }
                    action={ this.onClick } />
                { this.props.children }
            </StyledDiv>
        )
    }
}

FormLine.contextType = StatusContext

export default FormLine
