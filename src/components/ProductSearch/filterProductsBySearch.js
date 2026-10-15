export function filterProductsBySearch(products, searchValue) {
  const query = searchValue.trim().toLocaleLowerCase()
  if (!query) return products

  return products.filter((product) =>
    [product.nombre, product.marca, product.categorias?.nombre]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(query))
  )
}
