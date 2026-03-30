export const normalizeApiErrors = (error, fallbackMessage) => {
  const responseData = error?.response?.data
  const rawErrors = responseData?.errors

  if (rawErrors && typeof rawErrors === 'object') {
    return Object.fromEntries(
      Object.entries(rawErrors).map(([field, value]) => [
        field,
        Array.isArray(value) ? value[0] : value,
      ])
    )
  }

  if (responseData?.message) {
    return { general: responseData.message }
  }

  return { general: fallbackMessage }
}
