import React from 'react'
import styled from 'styled-components'
import parseGitHubURL from 'parse-github-url'
import Usage from '../components/Usage'

const Main = styled.div`
  font-family: Consolas, monaco, monospace;
  max-width: 800px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0;
`

const Footer = styled.footer`
  -webkit-box-pack: justify;
  margin-top: auto;
  margin-bottom: 40px;
  padding-top: 40px;
  display: flex;
  justify-content: space-between;
  color: rgb(102, 102, 102);
  font-size: 11px;
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

export default class Index extends React.Component {
  state = {
    envVars: [],
  }

  static async getInitialProps({query}) {
    const repo = parseGitHubURL(query.repo) || {}
    return { repo }
  }

  render() {
    const {branch, owner, name, repository, href} = this.props.repo

    return (
      <Main>
        <h1># dropstack deploy</h1>
        <small>&gt; One click deploys to the <a href="https://dropstack.run">dropstack|cloud</a></small>
        <hr />
        <div>
          <h2>## Deploying</h2>
          <div>{repository ? `${repository} directory in ` : ''}{branch ? `${branch} branch of ` : ''}<a href={href}>{name}</a></div>
        </div>
        <hr />
        <div>
          <DeployInput type="text" placeholder="URL to a GitHub repo" defaultValue={href}/>
          <br />
          <DeployInput type="text" placeholder="API token" />
          <br />
          {
            this.state.envVars.map((x, i) =>
              <div key={i}>
                <DeployEnvVarInput type="text" placeholder={`ENV_VAR_${i}`} />=<DeployEnvVarInput type="text" placeholder="value" />
                <RemoveEnvVarButton onClick={() => { delete this.state.envVars[i]; this.setState({envVars: this.state.envVars}); }}>-</RemoveEnvVarButton>
              </div>
            )
          }
          <DeployButton onClick={() => this.setState({envVars: this.state.envVars.concat([''])})}>Add environment variable</DeployButton>
        </div>
        <hr />
        <div>
          <DeployButton><strong>DEPLOY</strong></DeployButton>
        </div>
        <Usage />
        <Footer>
          CodeCommission
        </Footer>
      </Main>
    )
  }
}