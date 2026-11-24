import * as React from 'react'
import { existsSync } from 'fs'
import { join } from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import twemoji from 'twemoji'
import type { NextApiRequest, NextApiResponse } from 'next'

import {
  getBlockTitle,
  getBlockIcon,
  getPageProperty,
  isUrl,
  parsePageId
} from 'notion-utils'
import { PageBlock } from 'notion-types'

import { notion } from 'lib/notion-api'
import { mapImageUrl } from 'lib/map-image-url'
import { interRegular } from 'lib/fonts'
import * as siteConfig from 'lib/config'

// Cache extraction within this process so concurrent cold-start requests do not
// try to launch a partially extracted Chromium binary.
let chromiumPath: Promise<string> | undefined

async function executablePath(): Promise<string> {
  if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.VERCEL) {
    return (
      process.env.CHROME_PATH ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    )
  }
  if (!chromiumPath) {
    // Explicit checks also allow Next.js 12 to trace these runtime assets.
    const archivesPresent = [
      existsSync(
        join(process.cwd(), 'node_modules/@sparticuz/chromium/bin/chromium.br')
      ),
      existsSync(
        join(
          process.cwd(),
          'node_modules/@sparticuz/chromium/bin/al2023.tar.br'
        )
      ),
      existsSync(
        join(process.cwd(), 'node_modules/@sparticuz/chromium/bin/fonts.tar.br')
      ),
      existsSync(
        join(
          process.cwd(),
          'node_modules/@sparticuz/chromium/bin/swiftshader.tar.br'
        )
      )
    ]
    if (archivesPresent.some((present) => !present)) {
      throw new Error(
        'Chromium runtime archives are missing from the deployment'
      )
    }
    chromiumPath = chromium
      .executablePath(
        join(process.cwd(), 'node_modules/@sparticuz/chromium/bin')
      )
      .catch((error) => {
        chromiumPath = undefined
        throw error
      })
  }
  return chromiumPath
}

async function createTemplate(id: string) {
  const pageId = parsePageId(id)

  if (!pageId) {
    throw new Error('Invalid notion page id')
  }

  const recordMap = await notion.getPage(pageId)

  const keys = Object.keys(recordMap?.block || {})
  const rootBlockRef = recordMap?.block?.[keys[0]] as any
  const block = rootBlockRef?.value?.value ?? rootBlockRef?.value

  if (!block) {
    throw new Error('Invalid recordMap for page')
  }

  const isBlogPost =
    block.type === 'page' && block.parent_table === 'collection'
  const title = getBlockTitle(block, recordMap) || siteConfig.name
  const image = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
      (block as PageBlock).format?.page_cover ||
      siteConfig.defaultPageCover,
    block
  )

  const imageCoverPosition =
    (block as PageBlock).format?.page_cover_position ??
    siteConfig.defaultPageCoverPosition
  const imageObjectPosition = imageCoverPosition
    ? `center ${(1 - imageCoverPosition) * 100}%`
    : null

  const blockIcon = getBlockIcon(block, recordMap)
  const authorImage = mapImageUrl(
    blockIcon && isUrl(blockIcon) ? blockIcon : siteConfig.defaultPageIcon,
    block
  )

  const author =
    getPageProperty<string>('Author', block, recordMap) || siteConfig.author

  // const socialDescription =
  //   getPageProperty<string>('Description', block, recordMap) ||
  //   siteConfig.description

  const lastUpdatedTime = getPageProperty<number>(
    'Last Updated',
    block,
    recordMap
  )
  const publishedTime = getPageProperty<number>('Published', block, recordMap)
  const dateUpdated = lastUpdatedTime
    ? new Date(lastUpdatedTime)
    : publishedTime
    ? new Date(publishedTime)
    : undefined
  const date =
    isBlogPost && dateUpdated
      ? `${dateUpdated.toLocaleString('en-US', {
          month: 'long'
        })} ${dateUpdated.getFullYear()}`
      : undefined
  const detail = date || siteConfig.domain

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </head>

      <body>
        <div className='container'>
          <div className='horiz'>
            <div className='lhs'>
              <div className='main'>
                <h1 className='title'>{title}</h1>
              </div>

              <div className='metadata'>
                {authorImage && (
                  <div
                    className='author-image'
                    style={{ backgroundImage: `url(${authorImage})` }}
                  />
                )}

                {(author || detail) && (
                  <div className='metadata-rhs'>
                    {author && <div className='author'>{author}</div>}
                    {detail && <div className='detail'>{detail}</div>}
                  </div>
                )}
              </div>
            </div>

            {image && (
              <img
                src={image}
                className='rhs'
                style={{
                  objectPosition: imageObjectPosition || undefined
                }}
              />
            )}
          </div>
        </div>
      </body>
    </html>
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = typeof req.query.id === 'string' ? req.query.id : ''
  if (!parsePageId(id)) return res.status(400).send('Invalid notion page id')

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined
  try {
    const markup = renderToStaticMarkup(await createTemplate(id))
    const html =
      '<!doctype html>' + twemoji.parse(markup, { folder: 'svg', ext: '.svg' })
    const isServerless = Boolean(
      process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
    )
    browser = await puppeteer.launch({
      args: isServerless ? chromium.args : [],
      executablePath: await executablePath(),
      headless: 'shell',
      defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 }
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 })
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 })
    const image = await page.screenshot({ type: 'jpeg', quality: 75 })
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader(
      'Cache-Control',
      'max-age=0, s-maxage=86400, stale-while-revalidate=3600'
    )
    return res.status(200).send(Buffer.from(image))
  } catch (error) {
    console.error('Social image generation failed', error)
    return res.status(500).send('Social image generation failed')
  } finally {
    if (browser) await browser.close()
  }
}

const style = `
@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: normal;
  src: url(data:font/woff2;charset=utf-8;base64,${interRegular}) format('woff2');
}

:root {
  --padding: 8vmin;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  padding: 0;
  margin: 0;
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--padding);
  background: #1F2027;
  color: #fff;
}

.horiz {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--padding);
  width: 100%;
  height: 100%;
}

.lhs {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rhs {
  width: 35%;
  height: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.title {
  font-size: 3.2em;
  line-height: 1.3;
}

.metadata {
  color: #A9ACC0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: calc(var(--padding) * 0.7);
  font-size: 1.5em;
}

.author {
  font-size: 1.75em;
}

.author-image {
  background-size: cover;
  width: 20vmin;
  min-width: 20vmin;
  max-width: 20vmin;
  height: 20vmin;
  min-height: 20vmin;
  max-height: 20vmin;
  border-radius: 50%;
  border: 1.5vmin solid #fff;
}

.metadata-rhs {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5em;
}

.detail {
  overflow-wrap: break-word;
}
`
