export const VotableTypeSelector = ({ value, onChange }) => {
  // `votableTypes` is aligned to `enum VotableType` in schema.prisma
  const votableTypes = [
    { value: 'CERTIFICATION', label: 'Certification' },
    { value: 'COMPANY', label: 'Company' },
    { value: 'FOOD', label: 'Food' },
    { value: 'JOB_TITLE', label: 'Job Title' },
    { value: 'SCHOOL', label: 'School' },
    { value: 'SKILL', label: 'Skill' },
    { value: 'TECH_INFLUENCER', label: 'Tech Influencer' },
  ]

  return (
    <div className="mb-4">
      <label htmlFor="votable-type" className="mr-2">
        Select Votable Type:
      </label>
      <select
        id="votable-type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border p-2"
      >
        {votableTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  )
}
