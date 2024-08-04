type ParsedUrl = {
  pathname: string
  search: string
}

export const parseUrl = (url: string): ParsedUrl => {
  try {
    const urlObject = new URL(url)

    return {
      pathname: `${urlObject.origin}${urlObject.pathname}`,
      search: urlObject.search,
    }
  } catch (e) {
    return {
      pathname: url,
      search: '',
    }
  }
}
