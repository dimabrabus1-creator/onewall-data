export default async function handler(req, res) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=100&tags=true`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    const data = await response.json()

    const wallpapers = data.resources.map((item) => ({
      title: item.public_id.split("/").pop(),
      imageURL: item.secure_url,

      category:
        item.tags && item.tags.length > 0
          ? item.tags[0]
          : "Other",

      tags: item.tags || [],
    }))

    res.status(200).json(wallpapers)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}
