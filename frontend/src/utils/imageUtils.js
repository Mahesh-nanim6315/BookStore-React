export const getImageUrl = (image) => {
  if (!image) return '/placeholder.jpg'
  
  // If it's already a full URL (starts with http), use as is
  if (image.startsWith('http')) {
    return image
  }
  
  // If it's a relative path starting with /storage/, add base URL
  if (image.startsWith('/storage/')) {
    return `http://localhost:8000${image}`
  }
  
  // If it's just a filename, assume it's in storage
  return `http://localhost:8000/storage/${image}`
}
