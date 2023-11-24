import * as functions from '@google-cloud/functions-framework'

functions.http('main', async (req, res) => {
  res.send('Hello World!')
})
