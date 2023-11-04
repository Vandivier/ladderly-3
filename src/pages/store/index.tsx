import { GetStaticProps } from "next"
import React from "react"

import ProductGrid from "src/store/components/ProductGrid"
import { PrintfulProduct } from "src/store/types"
import { formatVariantName, printful } from "src/store/utils"

type IndexPageProps = {
  products: PrintfulProduct[]
}

const IndexPage: React.FC<IndexPageProps> = ({ products }) => (
  <>
    <div className="pb-6 text-center md:pb-12">
      <h1 className="text-xl font-bold md:text-3xl lg:text-5xl">All Products</h1>
    </div>

    <ProductGrid products={products} />
  </>
)

export const getStaticProps: GetStaticProps = async () => {
  const { result: productIds } = await printful.get("sync/products")

  const allProducts = await Promise.all(
    productIds.map(async ({ id }) => await printful.get(`sync/products/${id}`))
  )

  const products: PrintfulProduct[] = allProducts.map(
    ({ result: { sync_product, sync_variants } }) => ({
      ...sync_product,
      variants: sync_variants.map(({ name, ...variant }) => ({
        name: formatVariantName(name),
        ...variant,
      })),
    })
  )

  return {
    props: {
      products,
    },
  }
}

export default IndexPage