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
    const extractedRepoPath = extractedRepoFolderPath.dir.split('/').length > 1
      ? path.resolve(`${repo.name}-${repo.branch}/${extractedRepoFolderPath.name}`)
      : path.resolve(`${repo.name}-${repo.branch}/`)
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
        form.append('serviceAlias', req.body.alias)
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