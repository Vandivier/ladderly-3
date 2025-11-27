declare module 'node-fetch' {
  import { RequestInfo, RequestInit, Response, Headers } from 'node-fetch'

  export interface Fetch {
    (url: RequestInfo, init?: RequestInit): Promise<Response>
  }

  const fetchFn: Fetch
  export { Headers }
  export default fetchFn
}
