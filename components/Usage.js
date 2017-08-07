import React from 'react'
import styled from 'styled-components'

const Main = styled.div`
  font-family: Consolas, monaco, monospace;
  max-width: 800px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0;
`

const Code = styled.code`
  background-color: #f7f7f7;
`

const Pre = styled.pre`
  background-color: #f7f7f7;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 19px;
  padding: 15px;
`

const Usage = () => (
  <Main>
    <h3>### Usage</h3>
    <p>To add one-click deploys to your open source project, include the button to your
    readme:</p>

    <Pre>[![Deploy to dropstack](https://deploy.cloud.dropstack.run/button.svg)](https://deploy.cloud.dropstack.run/?repo=https://github.com/zpnk/hello-world)</Pre>
    <p>
      Be sure to set the <Code>repo</Code> parameter to the GitHub url of your project.
      This will result in the following link:
    </p>

    <p>
      <a href="https://deploy.cloud.dropstack.run/?repo=https://github.com/zpnk/hello-world">
        <img src="button.svg" />
      </a>
    </p>

    <p>
      If your app requires users to specify environment variables,
      you may include these in the <Code>deploy</Code> url:
    </p>

    <Pre>https://deploy.cloud.dropstack.run/?repo=https://github.com/zpnk/hello-world&env=GREETING&env=RECIPIENT</Pre>

    <p>The user will then be asked for these when deploying the app.</p>
  </Main>
)

export default Usage