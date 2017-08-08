// http://0.0.0.0:8080/deploy?repo=https://github.com/CodeCommission/linklet-examples/tree/master/basic-function
export default {
  async getInitialProps(req, res) {
    res.writeHead(200)

    const parseGitHubURL = require('parse-github-url')
    const fs = require('fs')
    const fse = require('fs-extra')
    const path = require('path')
    const tar = require('tar-fs')
    const gunzip = require('gunzip-maybe')
    const MemoryStream = require('memory-stream')
    const FormData = require('form-data')

    const repo = parseGitHubURL(req.body.repo) || {}
    const extractedRepoFolderPath = path.parse(repo.pathname)
    const extractedRepoPath = path.resolve(`${repo.name}-${repo.branch}/${extractedRepoFolderPath.name}`)
    const tarFileResponse = await fetch(`https://codeload.github.com/${repo.repository}/tar.gz/${repo.branch}`)
    const tarFileResponseExtract = tar.extract('./')

    tarFileResponse.body
    .pipe(gunzip())
    .pipe(tarFileResponseExtract)

    tarFileResponseExtract
    .on('finish', () => {
      console.log('Extracting done')
      const tranferToTarFileName = `${extractedRepoFolderPath.name}.tar`
      const tmpTarFile = fs.createWriteStream(tranferToTarFileName)

      tar.pack(extractedRepoPath).pipe(tmpTarFile)

      tmpTarFile.on('finish', () => {
        console.log('Repacking done')
        const form = new FormData()
        const startDate = new Date()
        // form.append('serviceName', '')
        // form.append('serviceAlias', '')
        // form.append('serviceHTTPS', '')
        // form.append('serviceType', '')
        // form.append('serviceInstances', '1')
        // form.append('serviceAliveEndpoint', '')
        form.append('serviceVariables', req.body.envVars)
        form.append(tranferToTarFileName, fs.createReadStream(tranferToTarFileName))

        fetch(`https://api.cloud.dropstack.run/deploys/`, {
          method: 'POST',
          body: form,
          headers: { Authorization: `Bearer ${req.body.token}` }
        })
        .then(response => response.json())
        .then(data => res.end(JSON.stringify({...repo, ...data})))
        .then(() => console.log('Deployment done'))
        .catch(error => console.error(error))
        .then(() => fse.remove(path.resolve(tranferToTarFileName)))
        .then(() => fse.remove(path.resolve(`${repo.name}-${repo.branch}`)))
        .catch(error => console.error(error))
      })
    })
  }
}