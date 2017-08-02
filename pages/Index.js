import React from 'react'
import styled from 'styled-components'
import parseGitHubURL from 'parse-github-url'
import Usage from '../components/Usage'

const Main = styled.div`
  font-family: Consolas, monaco, monospace;
`

const Title = ({className, text}) => <h1 className={className}>{text}</h1>
const StyledTitle = styled(Title)``

const Quote = ({className, children}) => <h2 className={className}>{children}</h2>
const StyledQuote = styled(Quote)`
`

export default class Index extends React.Component {
  static async getInitialProps({query}) {
    const repo = parseGitHubURL(query.repo) || {}
    return { repo }
  }

  render() {
    const {branch, owner, name, repository, href} = this.props.repo

    return (
      <Main>
        <StyledTitle text="DropStack: deploy instantlys" />
        <StyledQuote>
          &gt; One click deploys to the <a href="https://dropstack.run">dropstack | cloud</a>
        </StyledQuote>
        <p>
          Deploying {repository ? `${repository} directory in ` : ''}{branch ? `${branch} branch of ` : ''}<a href={href}>{name}</a>
        </p>
        <Usage />
      </Main>
    )
  }
}