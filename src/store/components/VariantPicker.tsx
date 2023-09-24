const VariantPicker = ({ variants, ...props }) => {
  if (variants.length === (0 || 1)) return null

  return (
    <select
      {...props}
      className="form-select relative mb-3 w-full grow appearance-none rounded border border-gray-300 bg-white py-2 pl-3 text-sm text-gray-500 shadow-sm ring-0 focus:border-gray-500 focus:text-gray-900 focus:outline-none focus:ring-0 sm:mb-0 sm:mr-3"
    >
      {variants.map(({ external_id, name }) => (
        <option key={external_id} value={external_id}>
          {name}
        </option>
      ))}
    </select>
  )
}

export default VariantPicker
