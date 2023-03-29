import {
  generateImage,
  GenerateImageInput,
} from '../../services/generateImage';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // not really type-safe, force cast because I can =P
    const prompt = req.body as GenerateImageInput;
    try {
      const imageUrl = await generateImage(prompt);
      res.status(200).json({ imageUrl });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to update image', causedBy: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
