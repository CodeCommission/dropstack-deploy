import React from 'react'
import styled from 'styled-components'
import parseGitHubURL from 'parse-github-url'
import Usage from '../components/Usage'
import EventSource from 'eventsource'
import {isWebUri} from 'valid-url'

const Main = styled.div`
  font-family: Consolas, monaco, monospace;
  max-width: 800px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0;
`

const Footer = styled.footer`
  font-family: Consolas, monaco, monospace;
  box-pack: justify;
  margin-top: auto;
  margin-bottom: 40px;
  padding-top: 40px;
  display: flex;
  justify-content: space-between;
  color: rgb(102, 102, 102);
  font-size: 11px;
  color: black;
`

const PrimaryLink = styled.a`
  font-family: Consolas, monaco, monospace;
  color: black;

  :hover {
    color: black;
  }
  :visited {
    color: black;
  }
`

const DeployInput = styled.input`
  font-family: Consolas, monaco, monospace;
  border: 0px;
  border-radius: 0px;
  width: 99%;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 5px;
  height: 20px;
  border-bottom: 1px solid black;
`

const DeployEnvVarInput = styled.input`
  font-family: Consolas, monaco, monospace;
  border: 0px;
  border-radius: 0px;
  width: 46%;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 5px;
  height: 20px;
  border-bottom: 1px solid black;
`

const DeployButton = styled.button`
  font-family: Consolas, monaco, monospace;
  border-radius: 0px;
  width: 202px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 9px;
  height: 30px;
  vertical-align: middle;
  border: 1px solid black;
  background-color: white;
`

const RemoveEnvVarButton = styled.button`
  font-family: Consolas, monaco, monospace;
  border-radius: 0px;
  width: 25px;
  margin-top: 10px;
  padding: 6px;
  margin-left: 10px;
  height: 25px;
  vertical-align: middle;
  border: 1px solid black;
  background-color: white;
`

const ErrorMessage = styled.span`
  font-size: 11px;
  font-family: Consolas, monaco, monospace;
  color: red;
  display: inline-block;
`

const DeploymentBox = styled.div`
  font-size: 11px;
  font-family: Consolas, monaco, monospace;
  padding: 15px 0;
`

const DeploymentBoxLabel = styled.span`
  display: inline-block;
  width: 100px;
`

const DeploymentServiceLink = styled.a`
  font-size: 11px;
  font-family: Consolas, monaco, monospace;
  color: black;

  :hover {
    color: black;
  }
  :visited {
    color: black;
  }
`

const RepoLink = styled.a`
  font-family: Consolas, monaco, monospace;
  color: black;

  :hover {
    color: black;
  }
  :visited {
    color: black;
  }
`

const HeaderBox = styled.div`
  font-size: 12px;
  padding: 15px 0;
`

const DeploymentInputBox = styled.div`
  padding: 5px 0;
`

const DeploymentInputLabel = styled.div`
  font-size: 11px;
  font-weight: bold;
  display: inline-block;
`

export default class Index extends React.Component {
  state = {
    envVars: [],
    repo: this.props.repo,
    token: '',
    deployment: {},
    isLoading: false,
    repoError: '',
    tokenError: '',
    deployError: '',
  }

  static async getInitialProps({query}) {
    const repo = parseGitHubURL(query.repo) || {}
    return {repo}
  }

  parseGitURL (value) {
    if(!value) return this.setState({repoError: 'Missing', repo: {}})
    if(!isWebUri(value)) return this.setState({repoError: 'Invalid URL'})
    const repo = parseGitHubURL(value) || {}
    this.setState({repo, repoError: ''})
  }

  deploy () {
    if(!(this.state.repo && this.state.repo.href)) this.setState({repoError: 'Missing'})
    else this.setState({repoError: ''})

    if(!this.state.token) this.setState({tokenError: 'Missing'})
    else this.setState({tokenError: ''})

    if(!(this.state.repo && this.state.repo.href && this.state.token)) return

    this.setState({isLoading: true, deployError: ''})
    const es = new EventSource(`https://api.cloud.dropstack.run/deploys/live`, {headers: {authorization: `Bearer ${this.state.token}`, connection: 'keep-alive', 'cache-control': 'no-cache'}});

    es.onerror = e => {
      es.close()
      this.setState({deployError: 'Deployment error occurred. Retry please.', isLoading: false})
    }

    es.onmessage = e => {
      let progressState = {};
      try {
        progressState = JSON.parse(e.data)
      } catch(e) {}

      this.setState({deployment: Object.assign({}, this.state.deployment, progressState)})

      if(progressState.deployProgress === 'error') {
        es.close()
        this.setState({isLoading: false, deployError: progressState.error})
      }

      if(progressState.deployProgress === 'registrated') {
        es.close()
        this.setState({isLoading: false})
      }
    }
    es.onopen = e => {
      const serviceVariables = this.state.envVars.map(x => x.join('=')).join(',')
      fetch(`/deploy`, {body: JSON.stringify({repo: this.state.repo.href, envVars: serviceVariables, token: this.state.token, alias: this.state.alias}), method: 'POST', headers: {authorization: `Bearer ${this.state.token}`, 'content-type': 'application/json'}})
      .then(response => response.json())
      .then(data => this.setState({deployment: data}))
      .catch(error => this.setState({deployError: error.message}))
    }
  }

  addEnvVarKey(key, index) {
    this.state.envVars[index] = [key, '']
    this.setState({envVars: this.state.envVars})
  }

  addEnvVarValue(value, index) {
    this.state.envVars[index] = [this.state.envVars[index][0], value]
    this.setState({envVars: this.state.envVars})
  }

  removeEnvVar(index) {
    delete this.state.envVars[index];
    this.setState({envVars: this.state.envVars});
  }

  render() {
    const {branch, owner, name, repository, href, path} = this.state.repo

    return (
      <Main>
        <h1># dropstack deploy</h1>
        <small>&gt; One click deploys to <PrimaryLink href="https://dropstack.run" target="_blank">dropstack|cloud</PrimaryLink></small>
        <HeaderBox>
          <h2>## deploying</h2>
          <div>{repository ? `${path} directory in ` : ''}{branch ? `${branch} branch of ` : ''}<RepoLink href={href} target="_blank">{name}</RepoLink></div>
        </HeaderBox>
        <div>
          <DeploymentInputBox>
            <DeploymentInputLabel>URL to a GitHub repo</DeploymentInputLabel>&nbsp;{this.state.repoError && <ErrorMessage>{this.state.repoError}</ErrorMessage>}
            <DeployInput type="text" placeholder="https://github.com/CodeCommission/dropstack-examples/tree/master/html-example" defaultValue={href} onBlur={e => this.parseGitURL(e.target.value)} />
          </DeploymentInputBox>
          <DeploymentInputBox>
            <DeploymentInputLabel>API JSON Web Token (JWT)</DeploymentInputLabel>&nbsp;{this.state.tokenError && <ErrorMessage>{this.state.tokenError}</ErrorMessage>}
            <DeployInput type="text" placeholder="API JWT" defaultValue={this.state.token} onBlur={e => this.setState({token: e.target.value})}/>
          </DeploymentInputBox>
          <DeploymentInputBox>
            <DeploymentInputLabel>Alias</DeploymentInputLabel>
            <DeployInput type="text" placeholder="my-service.example.com" defaultValue={this.state.alias} onBlur={e => this.setState({alias: e.target.value})}/>
          </DeploymentInputBox>
          <DeploymentInputBox>
            <DeploymentInputLabel>Environment Variables</DeploymentInputLabel>
            {
              this.state.envVars.map((x, i) =>
                <div key={i}>
                  <DeployEnvVarInput type="text" placeholder={`ENV_VAR_${i}`} onBlur={e => this.addEnvVarKey(e.target.value, i)} />=<DeployEnvVarInput type="text" placeholder="value" onBlur={e => this.addEnvVarValue(e.target.value, i)}/>
                  <RemoveEnvVarButton onClick={() => this.removeEnvVar(i)}>-</RemoveEnvVarButton>
                </div>
              )
            }
          </DeploymentInputBox>
          <DeployButton onClick={() => this.setState({envVars: this.state.envVars.concat([''])})}>Add environment variable</DeployButton>
        </div>
        <div>
          <DeployButton disabled={this.state.isLoading} onClick={() => this.deploy()}><strong>DEPLOY</strong></DeployButton>
        </div>
        <DeploymentBox>
          <div>
            <DeploymentBoxLabel>State</DeploymentBoxLabel>
            {
              this.state.deployError
              ? <ErrorMessage>{this.state.deployError}</ErrorMessage>
              : <span>{this.state.deployment.deployProgress || '-'}</span>
            }
          </div>
          <div><DeploymentBoxLabel>Name</DeploymentBoxLabel><span>{this.state.deployment.serviceName || '-'}</span></div>
          <div><DeploymentBoxLabel>Type</DeploymentBoxLabel><span>{this.state.deployment.serviceType || '-'}</span></div>
          <div><DeploymentBoxLabel>Instances</DeploymentBoxLabel><span>{this.state.deployment.serviceInstances || '-'}</span></div>
          <div>
            <DeploymentBoxLabel>Alias</DeploymentBoxLabel>
            {
              this.state.deployment.serviceAlias
              ? <DeploymentServiceLink href={`https://${this.state.deployment.serviceAlias}`} target="_blank">{`https://${this.state.deployment.serviceAlias}`}</DeploymentServiceLink>
              : <span>-</span>
            }
          </div>
          <div>
            <DeploymentBoxLabel>URL</DeploymentBoxLabel>
            {
              this.state.deployment.serviceUrl
              ? <DeploymentServiceLink href={`https://${this.state.deployment.serviceUrl}`} target="_blank">{`https://${this.state.deployment.serviceUrl}`}</DeploymentServiceLink>
              : <span>-</span>
            }
          </div>
        </DeploymentBox>
        <Usage repo={this.state.repo} />
        <Footer>
          <span>
            built by <PrimaryLink href="https://github.com/mikebild">@mikebild</PrimaryLink>
            {' '}&{' '}
            <PrimaryLink href="https://github.com/codecommission">@codecommission</PrimaryLink>
          </span>
          <span>
            powered by <PrimaryLink href="https://www.dropstack.run">dropstack</PrimaryLink>
            {' '}|{' '}
            <PrimaryLink href="https://github.com/codecommission/dropstack-deploy">source</PrimaryLink>
          </span>
        </Footer>
      </Main>
    )
  }
}