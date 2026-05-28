export default async function handler(req, res) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

  const categories = [
    "art",
    "brands",
    "cars",
    "cartoon",
    "cities",
    "holidays",
    "interior",
    "landscapes",
    "space",
    "trading",
    "vibe",
  ]

  const formatCategory = (category) => {
    if (!category) return "Other"

    return category
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  async function fetchAllResources() {
    let allResources = []
    let nextCursor = null

    do {
      let url =
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500&tags=true`

      if (nextCursor) {
        url += `&next_cursor=${nextCursor}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      })

      const data = await response.json()

      allResources = [...allResources, ...(data.resources || [])]

      nextCursor = data.next_cursor
    } while (nextCursor)

    return allResources
  }

  try {
    const resources = await fetchAllResources()

    const wallpapers = resources.map((item) => {
      const tags = item.tags || []

      const categoryTag = tags.find((tag) =>
        categories.includes(tag.toLowerCase())
      )

      return {
        title: item.public_id.split("/").pop(),
        imageURL: item.secure_url,
        category: formatCategory(categoryTag),
        tags,
      }
    })

    res.status(200).json(wallpapers)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}
