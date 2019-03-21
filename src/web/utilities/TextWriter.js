
function easeInOutQuad(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
}

function easeOutQuad(t, b, c, d) {
    return -c * (t/=d)*(t-2) + b;
}

function easeInQuad(t, b, c, d) {
    return c*(t/=d)*t + b;
}


class TextWriter {
    constructor(id) {
        this._root = document.getElementById(id)
        this._processString = this._processString.bind(this)

        this._root.setAttribute('style', 'max-width: 100%; width: 100%;')
    }

    writeWithEasing(str) {
        let time = 100;

        const diff = str.length;
        const minTime = 80;
        const maxTime = 1000;

        this._str = str

        this.pEnd = new Promise((resolve, reject) => {
            for( let i = 0, len = diff; i <= len; i++ ) {
                setTimeout(() => {
                    this._processString()
                    if (i === diff) resolve(true)
                }, time)
                time = easeOutQuad(i, minTime, maxTime, diff);
            }

            this.resolve = resolve
            this.reject = reject
        })

        return this.pEnd
    }

    startWriting(str) {
        return this.writeWithEasing(str)
    }

    add(str) {
        return this.startWriting(`${ str.trim() }... `)
    }

    async end(time = 3000) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this._root.parentNode.removeChild(this._root)
                resolve(true)
            }, time)
        })
    }

    _processString() {
        try {
            this.writeChar()
            this.check()
        } catch (err) {
            this.end()
            this.reject(err)
        }
    }

    writeChar() {
        if (this._str[0] !== undefined) {
            this._root.innerText += this._str[0]
        }

        this._str = this._str.substring(1, (this._str.length))
    }

    check() {
        if (this._str.length === 0) {
            this.resolve(true)
        }
    }
}

export default TextWriter
