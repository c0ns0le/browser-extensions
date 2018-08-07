// We want to polyfill first.
// prettier-ignore
import '../../app/util/polyfill'

import { ExtensionsList } from '@sourcegraph/extensions-client-common/lib/extensions/manager/ExtensionsList'
import * as React from 'react'
import { render } from 'react-dom'
import { Route } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Subscription } from 'rxjs'
import { clientSettingsUpdates, createExtensionsContextController } from '../../app/backend/extensions'
import storage from '../../extension/storage'

const x = createExtensionsContextController()

interface State {
    clientSettings: string
}

class BrowserSettingsEditor extends React.Component<{}, State> {
    private subscriptions = new Subscription()

    constructor(props) {
        super(props)
        this.state = {
            clientSettings: 'Loading...',
        }
    }

    public componentDidMount(): void {
        this.subscriptions.add(
            clientSettingsUpdates.subscribe(clientSettings => this.setState(() => ({ clientSettings })))
        )
    }

    private saveLocalSettings = () => {
        storage.setSync({ clientSettings: this.state.clientSettings })
    }

    private onSettingsChanged = event => {
        const value = event.target.value
        this.setState(() => ({ clientSettings: value }))
    }

    public render(): JSX.Element | null {
        return (
            <div className="options__section">
                <div className="options__section-header">Client settings</div>
                <div className="options__section-contents">
                    <FormGroup>
                        <Label className="options__input">
                            <Input
                                className="options__input-textarea"
                                type="textarea"
                                value={this.state.clientSettings}
                                onChange={this.onSettingsChanged}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                            />
                        </Label>
                        <Button className="options__cta" color="primary" onClick={this.saveLocalSettings}>
                            Save
                        </Button>{' '}
                    </FormGroup>
                </div>
            </div>
        )
    }
}

const renderExtensionsList = routeComponentProps => (
    <>
        <ExtensionsList {...routeComponentProps} subject={'Client'} extensions={x} />
        <BrowserSettingsEditor />
    </>
)

const inject = () => {
    const injectDOM = document.createElement('div')
    injectDOM.id = 'sourcegraph-options-menu'
    document.body.appendChild(injectDOM)
    render(
        <BrowserRouter key={0}>
            <Route path={'/cxp.html'} render={renderExtensionsList} />
        </BrowserRouter>,
        injectDOM
    )
}

document.addEventListener('DOMContentLoaded', () => {
    inject()
})