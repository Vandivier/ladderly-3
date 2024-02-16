import LabeledSelectField from "src/core/components/LabeledSelectField"

export const CountryDropdown = () => (
  <LabeledSelectField name="countryOfResidence" label="Country of Residence">
    <option value="Canonical">Canonical</option>
    <option value="Narrative">Narrative</option>
  </LabeledSelectField>
)
