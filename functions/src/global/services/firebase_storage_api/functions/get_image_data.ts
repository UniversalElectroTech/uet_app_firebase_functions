export const getImageData = async (imageUrl: string): Promise<string> => {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image data, status: ${response.status}`);
		}
		const imageData = await response.arrayBuffer();

		if (imageData) {
			// Convert the image data to base64
			const base64Data = Buffer.from(imageData).toString("base64");
			return base64Data;
		} else {
			throw new Error("Failed to fetch image data");
		}
	} catch (e) {
		// Handle errors
		throw new Error(`Error fetching image data: ${e}`);
	}
};
