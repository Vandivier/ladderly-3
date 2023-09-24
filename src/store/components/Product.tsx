import Image from "next/image"
import React from "react"
import VariantPicker from "./VariantPicker"

type ProductProps = {
  name: string
  variants: {
    external_id: string
    name: string
    files: {
      type: string
      preview_url: string
    }[]
    currency: string
    retail_price: number
  }[]
}

const Product: React.FC = (product: ProductProps) => {
  const { name, variants } = product
  const firstVariant = variants[0]
  const oneStyle = variants.length === 1
  const [activeVariantExternalId, setActiveVariantExternalId] = React.useState(
    firstVariant?.external_id
  )

  const activeVariant = variants.find((v) => v.external_id === activeVariantExternalId)
  if (activeVariant === undefined) return null

  const activeVariantFile = activeVariant.files.find(({ type }) => type === "preview")
  if (activeVariantFile === undefined) return null

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: activeVariant.currency,
  }).format(activeVariant.retail_price)

  return (
    <article className="relative flex flex-col rounded border border-gray-200 bg-white">
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:shrink-0">
        {activeVariantFile && (
          <Image
            src={activeVariantFile.preview_url}
            width={250}
            height={250}
            alt={`${activeVariant.name} ${name}`}
            title={`${activeVariant.name} ${name}`}
          />
        )}
      </div>
      <div className="flex-1 p-6 pt-0">
        <div className="text-center">
          <p className="mb-1 font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{formattedPrice}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-3 sm:flex-row">
        <VariantPicker
          value={activeVariantExternalId}
          onChange={({ target: { value } }) => setActiveVariantExternalId(value)}
          variants={variants}
          disabled={oneStyle}
        />
        <button
          className="snipcart-add-item w-full shrink-0 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-transparent hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white focus:outline-none md:w-auto"
          data-item-id={activeVariantExternalId}
          data-item-price={activeVariant.retail_price}
          data-item-url={`/api/products/${activeVariantExternalId}`}
          data-item-description={activeVariant.name}
          data-item-image={activeVariantFile.preview_url}
          data-item-name={name}
        >
          Add to Cart
        </button>
      </div>
    </article>
  )
}

export default Product
