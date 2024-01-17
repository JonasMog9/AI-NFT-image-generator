document.addEventListener('DOMContentLoaded', () => {

    alert('Welcome! This site is currently in beta. We are awaiting updates from OpenAI for enhanced image generation capabilities.');

    const submitButton = document.getElementById('submitToken');
    const generateButton = document.getElementById('startGenerating');
    const tokenIDInput = document.getElementById('tokenID');
    const nftImageContainer = document.getElementById('nftImageContainer');
    const promptText = document.getElementById('promptText'); 
    const generatedImages = document.getElementById('generatedImages');
    const apiKey = 'MYAPIKEY';
    const downloadButton = document.getElementById('downloadImages');

    // Function to parse CSV data and find the attributes by token ID
    function getAttributesFromTokenId(csvData, tokenId) {
        const lines = csvData.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const [id, ...attributes] = lines[i].split(',');
            if (id.trim() === tokenId) {
                return attributes.join(',').replace(/"/g, '').trim(); // Rejoin and remove quotes
            }
        }
        return null;
    }

    function buildPrompt(attributes) {
        const excludedStats = ['Shooting', 'Defense', 'Vision', 'Finish'];
        const parts = attributes.split(', ');
        const descriptions = parts.map(part => {
            let [key, value] = part.split(':');
            if (value === 'NULL' || !value || excludedStats.includes(key)) return ''; // Skip if attribute is NULL or excluded
    
            // Special cases
            if (key === 'Clothes' && value === 'Hawaii Shirt') {
                value = 'a hot-pink hawaiian button up short-sleeved shirt with red and pink flowers on it';
            }
    
            if (key === 'Head' && value === 'Blonde Bun') {
                value = 'a blonde haired bun that is tied up high by a blue hair-tie.  the hair has two or three strands covering some of its face like skinny bangs';
            }
    
            
    
            return `has ${key} resembling "${value}"`;
        }).filter(Boolean); // Remove empty strings
    
        return `The Kong ${descriptions.join(' and ')}.`; // Constructing the full prompt
    }


    function generateStoryPrompts(basePrompt) {
        const storyElements = [
            "exploring a mystical forest",
            "visiting a futuristic city",
            "searching for treasure on a pirate ship",
            "having an adventure in the jungle",
            "flying through space in a spaceship",
            "participating in a magical tournament",
            "solving a mystery in an ancient castle",
            "competing in a sports event",
            "attending a royal ball",
            "exploring the depths of the ocean"
        ];

        return storyElements.map(element => `${basePrompt}, depicted in a children's storybook style, ${element}.`);
    }

 

    submitButton.addEventListener('click', () => {
        const tokenID = tokenIDInput.value;
        if (tokenID && !isNaN(tokenID) && parseInt(tokenID) > 0 && parseInt(tokenID) <= 9999) {
            fetch('images9.csv')
                .then(response => response.text())
                .then(csvData => {
                    const imageUrl = getAttributesFromTokenId(csvData, tokenID);
                    if (imageUrl) {
                        nftImageContainer.innerHTML = `<img src="${imageUrl}" alt="NFT Image">`;
                    } else {
                        alert('No image found for this Token ID.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching image data:', error);
                });

            fetch('formatted_nft_stats.csv')
                .then(response => response.text())
                .then(csvData => {
                    const attributes = getAttributesFromTokenId(csvData, tokenID);
                    if (attributes) {
                        const prompt = buildPrompt(attributes);
                        promptText.value = prompt;
                    } else {
                        alert('No attributes found for this Token ID.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching attributes data:', error);
                });
        } else {
            alert('Please enter a valid Token ID (between 1 and 9999).');
        }
    });

    generateButton.addEventListener('click', () => {
        const basePrompt = promptText.value;
        const storyPrompts = generateStoryPrompts(basePrompt);

        generatedImages.innerHTML = '<p>Generating images, please wait...</p>';

        if (storyPrompts.length > 0) {
            storyPrompts.forEach((prompt, index) => {
                setTimeout(() => {
                    const simplePrompt = `A children's storybook illustration of a character: ${prompt}`;
                    promptText.value = simplePrompt;

                    const requestBody = {
                        prompt: simplePrompt,
                        n: 1,
                        size: '1024x1024'
                    };

                    fetch('https://api.openai.com/v1/images/generations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(requestBody)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`API responded with status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const imageUrl = data.data[0].url;
                        generatedImages.innerHTML += `<img src="${imageUrl}" alt="Generated Image ${index + 1}">`;

                        if (index === storyPrompts.length - 1) {
                            generatedImages.innerHTML += '<p>Finished generating images.</p>';
                            downloadButton.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Error generating image:', error);
                        generatedImages.innerHTML += `<p>Error generating image ${index + 1}: ${error.message}</p>`;
                    });
                }, (index + 1) * 20000); // 20 seconds delay for each request
            });
        } else {
            alert('No story prompt available.');
        }
    });

    downloadButton.addEventListener('click', () => {
        const images = document.querySelectorAll('#generatedImages img');
        images.forEach((img, index) => {
            const a = document.createElement('a');
            a.href = img.src;
            a.download = `GeneratedImage_${index + 1}.png`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    });
    
});
