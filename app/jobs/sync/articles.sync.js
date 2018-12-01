const { http, logger, createOrUpdateArticle, paginateArticles, constants } = require('../../utils')
const { Article, ProcessRecord } = require('../../models')
let running = false

async function processArticleChunk (articles) {
  try {
    const promises = articles.map(async (article) => {
      try {
        const raw = await http.searchByArticleId(article.id)
        return createOrUpdateArticle(raw)
      } catch (err) {
        logger.error(`[Error Sync Article ❌]: ${article.id}, ${err.message}`)
      }
    })
    return Promise.all(promises)
  } catch (err) {
    logger.error(`[Error Sync Article chunk]: ${err.message}`)
  }
}

async function articlesSync (singleRun = false) {
  try {
    running = true
    const limit = 1000
    let skip = 0
    const documentCount = await Article.estimatedDocumentCount().exec()
    const processRecord = new ProcessRecord({ name: constants.processNames.priceSync })
    await processRecord.begin()

    let articles = await paginateArticles({})
    while (articles.length) {
      await processArticleChunk(articles)
      skip += 1000
      const percentage = Math.floor((skip * 100 / documentCount)).toFixed(3)
      logger.info(`[Sync]: ${skip}/${documentCount} - ${percentage}%`)
      articles = await paginateArticles({ skip, limit })
    }

    if (processRecord) {
      await processRecord.end(documentCount)
    }

    if (singleRun) {
      running = false
    } else {
      articlesSync()
    }
  } catch (error) {
    logger.error(`[Error Articles sync]: ${error.message}`)
    running = false
  }
}

function run () {
  try {
    articlesSync()
  } catch (err) {
    console.log(err)
    logger.error(`[Fatal] There was an error running the Articles sync`)
  }
}

function articlesSyncRoute (req, res) {
  if (running) return res.status(403).send({ message: `Sync already running` })
  res.status(202).send({ message: `Sync triggered successfully` })
  console.log('Triggered sync')
  articlesSync()
}

module.exports = { articlesSyncRoute, run }
