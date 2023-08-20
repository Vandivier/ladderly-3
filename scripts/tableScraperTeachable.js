// init cells
const cells = []

// for each teachable page, run this to accumulate cells
cells.push(
  ...[...document.querySelectorAll("table.student-table tr")].map((el) => {
    const _cells = el.innerText.split("\n").filter((s) => s && s !== "\t")
    return _cells.length === 1 ? _cells[0].split("\t").filter((s) => s) : _cells
  })
)

// convert to json, filter down, and save
const colMap = { NAME: true, EMAIL: true, "EMAIL OPT OUT": true, PURCHASES: true }
const idxMap = {}
const initialRow = cells[0].map((el, idx) => {
  if (colMap[el]) {
    idxMap[idx] = true
  }

  return el
})
const otherRows = cells.filter((c) => c[0] !== "NAME")
const finalRows = [initialRow, ...otherRows].map((row) => row.filter((s, i) => idxMap[i]))

JSON.stringify(finalRows)
