declare module 'node-fetch' {
  const fetchFn: typeof fetch
  const HeadersCtor: typeof Headers

  export { HeadersCtor as Headers }
  export default fetchFn
}
