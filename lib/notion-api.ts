import { NotionAPI } from 'notion-client'

// Notion's private API rejects requests whose user-agent looks like a bot or a
// bare HTTP client with 403 Forbidden, which silently breaks ISR revalidation
// (getStaticProps throws and next.js keeps serving the last good page forever).
// Sending a browser user-agent keeps the page fetches working.
const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL,
  ofetchOptions: {
    headers: {
      'user-agent': userAgent
    }
  }
})
